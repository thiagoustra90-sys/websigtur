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
export async function registrarUsuario({ nombre, apellido, correo, password }) {
  const { data: created, error: authError } = await supabase.auth.admin.createUser({
    email: correo,
    password,
    email_confirm: true, // no exigimos verificación por mail en este prototipo
    user_metadata: { nombre, apellido },
  });

  if (authError) {
    // Supabase devuelve este mensaje cuando el correo ya existe
    const yaExiste = /already been registered|already exists/i.test(authError.message || "");
    return { error: yaExiste ? "Ese correo ya está registrado." : authError.message };
  }

  const userId = created.user.id;

  const { error: perfilError } = await supabase.from("usuarios").insert({
    id: userId,
    nombre,
    apellido: apellido || null,
    correo,
    rol: "usuario",
  });

  if (perfilError) {
    await supabase.auth.admin.deleteUser(userId); // rollback
    return { error: "No se pudo crear el perfil del usuario." };
  }

  // Iniciamos sesión automáticamente después de registrar
  return iniciarSesion({ correo, password });
}

async function asegurarPerfil(user) {
  const metadata = user.user_metadata || {};
  const nombre = String(metadata.nombre || metadata.full_name || user.email?.split('@')[0] || 'Usuario').trim();
  const apellido = String(metadata.apellido || '').trim() || null;
  const correo = String(user.email || '').trim().toLowerCase();
  const { data: perfil, error } = await supabase
    .from('usuarios')
    .upsert({ id: user.id, nombre, apellido, correo, rol: 'usuario' }, { onConflict: 'id' })
    .select('id, nombre, apellido, correo, rol, avatar_url, biografia, ubicacion, sitio_web, created_at')
    .single();
  return error ? null : perfil;
}

export async function iniciarGoogle() {
  const redirectTo = process.env.OAUTH_REDIRECT_URL || 'https://websigtur.onrender.com/api/auth/google/callback';
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, queryParams: { access_type: 'offline', prompt: 'select_account' } },
  });
  return error ? { error: 'No se pudo iniciar Google OAuth.' } : { url: data.url };
}

export async function completarGoogle(code) {
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data?.user || !data.session) return { error: 'No se pudo completar el inicio de sesión con Google.' };
  const perfil = await asegurarPerfil(data.user);
  return {
    token: data.session.access_token,
    refreshToken: data.session.refresh_token,
    expiresAt: data.session.expires_at,
    usuario: perfil || { id: data.user.id, correo: data.user.email, nombre: data.user.email?.split('@')[0], rol: 'usuario' },
  };
}

export async function iniciarSesion({ correo, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: correo,
    password,
  });

  if (error) {
    return { error: "Correo o contraseña incorrectos." };
  }

  const perfil = await asegurarPerfil(data.user);

  return {
    token: data.session.access_token,
    refreshToken: data.session.refresh_token,
    expiresAt: data.session.expires_at,
    usuario: perfil || { id: data.user.id, correo: data.user.email, nombre: correo.split("@")[0], rol: "usuario" },
  };
}

// Renueva un access token vencido sin pedirle credenciales otra vez al usuario.
// El refresh token solo viaja al backend, que lo intercambia con Supabase.
export async function renovarSesion(refreshToken) {
  if (!refreshToken) return { error: "No hay una sesión que renovar." };

  const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
  if (error || !data?.session || !data?.user) {
    return { error: "La sesión venció. Iniciá sesión nuevamente." };
  }

  const perfil = await asegurarPerfil(data.user);
  return {
    token: data.session.access_token,
    refreshToken: data.session.refresh_token,
    expiresAt: data.session.expires_at,
    usuario: perfil || {
      id: data.user.id,
      correo: data.user.email,
      nombre: data.user.email?.split("@")[0],
      rol: "usuario",
    },
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
    .select("id, nombre, apellido, correo, rol, avatar_url, biografia, ubicacion, sitio_web, created_at")
    .eq("id", userId)
    .single();
  if (error) return null;
  return data;
}

export async function actualizarPerfil(userId, { nombre, biografia, ubicacion, sitio_web, avatar_url }) {
  const payload = {
    nombre: String(nombre || '').trim().slice(0, 100),
    biografia: String(biografia || '').trim().slice(0, 300) || null,
    ubicacion: String(ubicacion || '').trim().slice(0, 100) || null,
    sitio_web: String(sitio_web || '').trim().slice(0, 500) || null,
    avatar_url: String(avatar_url || '').trim().slice(0, 1_500_000) || null,
  };
  if (!payload.nombre) throw Object.assign(new Error('El nombre es obligatorio.'), { status: 400 });
  if (payload.sitio_web && !/^https?:\/\//i.test(payload.sitio_web)) throw Object.assign(new Error('El sitio web debe comenzar con http:// o https://.'), { status: 400 });
  if (payload.avatar_url && !/^(https?:\/\/|data:image\/(png|jpe?g|webp);base64,)/i.test(payload.avatar_url)) throw Object.assign(new Error('La imagen de perfil no es válida.'), { status: 400 });
  const { data, error } = await supabase.from('usuarios').update(payload).eq('id', userId)
    .select('id, nombre, apellido, correo, rol, avatar_url, biografia, ubicacion, sitio_web, created_at').single();
  if (error) throw error;
  return data;
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
  if (!redirectTo) return { error: 'La recuperación de contraseña no está configurada.' };
  const { error } = await supabase.auth.resetPasswordForEmail(correo, { redirectTo });
  if (error) return { error: "No se pudo solicitar la recuperación de contraseña." };
  return { ok: true };
}
