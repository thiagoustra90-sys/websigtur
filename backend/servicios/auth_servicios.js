// ============================================================================
// servicios/auth_servicios.js
// Toda la lógica que habla con Supabase para registro/login/sesión.
// Usa la Service Role Key (backend/config/supabase.js) porque este código
// corre en el servidor, nunca en el navegador.
// ============================================================================
import supabase from "../config/supabase.js";

// Crea el usuario en Supabase Auth (auth.users) y su fila de perfil en
// public.usuarios. Si algo falla a mitad de camino, deshace lo creado
// para no dejar usuarios "fantasma" sin perfil.
export async function registrarUsuario({ nombre, apellido, correo, contrasena, password }) {
  const contrasenaFinal = contrasena || password;
  const { data: usuarioCreado, error: errorAutenticacion } = await supabase.auth.admin.createUser({
    email: correo,
    password: contrasenaFinal,
    email_confirm: false,
    user_metadata: { nombre, apellido },
  });

  if (errorAutenticacion) {
    // Supabase devuelve este mensaje cuando el correo ya existe
    const yaExiste = /already been registered|already exists/i.test(errorAutenticacion.message || "");
    return { error: yaExiste ? "Ese correo ya está registrado." : errorAutenticacion.message };
  }

  const usuarioId = usuarioCreado.user.id;

  const { error: errorPerfil } = await supabase.from("usuarios").insert({
    id: usuarioId,
    nombre,
    apellido: apellido || null,
    correo,
    rol: "usuario",
  });

  if (errorPerfil) {
    await supabase.auth.admin.deleteUser(usuarioId); // rollback
    return { error: "No se pudo crear el perfil del usuario." };
  }

  // Iniciamos el registro sin crear una sesión: la cuenta debe confirmar el correo.
  return {
    pending: true,
    message: "Cuenta creada. Revisá tu correo para confirmar la cuenta antes de iniciar sesión.",
  };
}

export async function asegurarPerfil(usuarioAuth) {
  const metadatos = usuarioAuth.user_metadata || {};
  const nombre = String(
    metadatos.nombre || metadatos.full_name || usuarioAuth.email?.split("@")[0] || "Usuario",
  ).trim();
  const apellido = String(metadatos.apellido || "").trim() || null;
  const correo = String(usuarioAuth.email || "")
    .trim()
    .toLowerCase();
  const { data: perfil, error } = await supabase
    .from("usuarios")
    .upsert({ id: usuarioAuth.id, nombre, apellido, correo }, { onConflict: "id" })
    .select(
      "id, nombre, apellido, correo, rol, avatar_url, biografia, ubicacion, sitio_web, created_at",
    )
    .single();
  return error ? null : perfil;
}

export async function iniciarGoogle() {
  try {
    // Supabase devuelve el token en el fragmento de login.html; el navegador
    // lo quita de la barra de direcciones y valida el perfil con /api/auth/me.
    const frontend = new URL(
      process.env.FRONTEND_URL || "https://websigtur.onrender.com/login.html",
    );
    const allowedOrigin = process.env.FRONTEND_ORIGIN
      ? new URL(process.env.FRONTEND_ORIGIN).origin
      : frontend.origin;
    if (frontend.origin !== allowedOrigin || !frontend.pathname.endsWith("/login.html")) {
      return {
        error: "La URL de retorno de Google OAuth no coincide con el frontend configurado.",
      };
    }
    const authorize = new URL(
      "/auth/v1/authorize",
      String(process.env.SUPABASE_URL || "").replace(/\/$/, ""),
    );
    authorize.searchParams.set("provider", "google");
    authorize.searchParams.set("redirect_to", frontend.toString());
    authorize.searchParams.set("flow_type", "implicit");
    authorize.searchParams.set("access_type", "offline");
    authorize.searchParams.set("prompt", "select_account");
    return { url: authorize.toString() };
  } catch {
    return { error: "No se pudo iniciar Google OAuth. Revisa las URLs públicas configuradas." };
  }
}

export async function completarGoogle(code) {
  const { data: resultadoAuth, error: fallo } = await supabase.auth.exchangeCodeForSession(code);
  if (fallo || !resultadoAuth?.user || !resultadoAuth.session)
    return { error: "No se pudo completar el inicio de sesión con Google." };
  const perfil = await asegurarPerfil(resultadoAuth.user);
  if (!perfil)
    return {
      error: "Google autenticó la cuenta, pero no se pudo validar el perfil. Intenta nuevamente.",
      status: 503,
    };
  const sesion = resultadoAuth.session;
  return {
    token: sesion.access_token,
    tokenActualizacion: sesion.refresh_token,
    refreshToken: sesion.refresh_token,
    expiresAt: sesion.expires_at,
    usuario: perfil,
  };
}

export async function iniciarSesion({ correo, contrasena, password }) {
  const contrasenaFinal = contrasena || password;
  const { data: resultadoAuth, error: fallo } = await supabase.auth.signInWithPassword({
    email: correo,
    password: contrasenaFinal,
  });

  if (fallo) {
    return { error: "Correo o contraseña incorrectos." };
  }

  const perfil = await asegurarPerfil(resultadoAuth.user);
  if (!perfil)
    return { error: "La cuenta se autenticó, pero no se pudo validar el perfil.", status: 503 };

  const sesion = resultadoAuth.session;
  return {
    token: sesion.access_token,
    tokenActualizacion: sesion.refresh_token,
    refreshToken: sesion.refresh_token,
    expiresAt: sesion.expires_at,
    usuario: perfil,
  };
}

// Renueva un access token vencido sin pedirle credenciales otra vez al usuario.
// El refresh token solo viaja al backend, que lo intercambia con Supabase.
export async function renovarSesion(tokenActualizacion) {
  if (!tokenActualizacion) return { error: "No hay una sesión que renovar." };

  const { data: resultadoAuth, error: fallo } = await supabase.auth.refreshSession({
    refresh_token: tokenActualizacion,
  });
  if (fallo || !resultadoAuth?.session || !resultadoAuth?.user) {
    const estado = fallo?.status === 429 || fallo?.status >= 500 ? 503 : 401;
    return { error: "La sesión venció o no se pudo renovar. Iniciá sesión nuevamente.", status: estado };
  }

  const perfil = await asegurarPerfil(resultadoAuth.user);
  if (!perfil)
    return { error: "La sesión se renovó, pero no se pudo validar el perfil.", status: 503 };
  const sesion = resultadoAuth.session;
  return {
    token: sesion.access_token,
    tokenActualizacion: sesion.refresh_token,
    refreshToken: sesion.refresh_token,
    expiresAt: sesion.expires_at,
    usuario: perfil,
  };
}

// Verifica un access_token y devuelve el usuario de Supabase Auth, o null.
export async function verificarToken(token) {
  if (!token) return null;
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

export async function obtenerPerfil(userId) {
  const { data, error } = await supabase
    .from("usuarios")
    .select(
      "id, nombre, apellido, correo, rol, avatar_url, biografia, ubicacion, sitio_web, created_at",
    )
    .eq("id", userId)
    .single();
  if (error) return null;
  return data;
}

export async function actualizarPerfil(
  userId,
  { nombre, biografia, ubicacion, sitio_web, avatar_url },
) {
  const payload = {
    nombre: String(nombre || "")
      .trim()
      .slice(0, 100),
    biografia:
      String(biografia || "")
        .trim()
        .slice(0, 300) || null,
    ubicacion:
      String(ubicacion || "")
        .trim()
        .slice(0, 100) || null,
    sitio_web:
      String(sitio_web || "")
        .trim()
        .slice(0, 500) || null,
    avatar_url:
      String(avatar_url || "")
        .trim()
        .slice(0, 1_500_000) || null,
  };
  if (!payload.nombre) throw Object.assign(new Error("El nombre es obligatorio."), { status: 400 });
  if (payload.sitio_web && !/^https?:\/\//i.test(payload.sitio_web))
    throw Object.assign(new Error("El sitio web debe comenzar con http:// o https://."), {
      status: 400,
    });
  if (
    payload.avatar_url &&
    !/^(https?:\/\/|data:image\/(png|jpe?g|webp);base64,)/i.test(payload.avatar_url)
  )
    throw Object.assign(new Error("La imagen de perfil no es válida."), { status: 400 });
  const { data, error } = await supabase
    .from("usuarios")
    .update(payload)
    .eq("id", userId)
    .select(
      "id, nombre, apellido, correo, rol, avatar_url, biografia, ubicacion, sitio_web, created_at",
    )
    .single();
  if (error) throw error;
  return data;
}

export async function actualizarContrasena(usuarioId, contrasena) {
  const { error } = await supabase.auth.admin.updateUserById(usuarioId, { password: contrasena });
  if (error)
    throw Object.assign(new Error("No se pudo actualizar la contraseña."), { status: 400 });
  return { ok: true };
}

// Con la Service Role Key podemos invalidar todas las sesiones del usuario
// (logout "global"). Si falla, no pasa nada grave: el front igual borra el
// token local y el access_token expira solo en un par de horas.
export async function cerrarSesion(userId) {
  if (!userId) return;
  try {
    await supabase.auth.admin.signOut(userId, "global");
  } catch {
    // no crítico
  }
}

export async function solicitarRecuperacion(correo) {
  const redirectTo = process.env.PASSWORD_RESET_REDIRECT_URL;
  if (!redirectTo) return { error: "La recuperación de contraseña no está configurada." };
  const { error } = await supabase.auth.resetPasswordForEmail(correo, { redirectTo });
  if (error) return { error: "No se pudo solicitar la recuperación de contraseña." };
  return { ok: true };
}
