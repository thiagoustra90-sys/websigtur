// ============================================================================
// controladores/controlador_auth.js
// Valida las solicitudes de autenticación y delega las operaciones de cuenta
// al servicio de Supabase.
// ============================================================================
import {
  registrarUsuario,
  iniciarSesion,
  renovarSesion,
  cerrarSesion,
  obtenerPerfil,
  asegurarPerfil,
  actualizarPerfil,
  actualizarContrasena,
  solicitarRecuperacion,
  iniciarGoogle,
  completarGoogle,
} from "../servicios/auth_servicios.js";

const expresionCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function registrar(req, res) {
  const datos = req.validatedBody || req.body || {};
  const nombre = String(datos.nombre || "").trim();
  const apellido = String(datos.apellido || "").trim();
  const correo = String(datos.correo || datos.email || "")
    .trim()
    .toLowerCase();
  const contrasena = String(datos.contrasena || datos.password || "");

  if (!nombre) return res.status(400).json({ error: "El nombre es obligatorio." });
  if (!expresionCorreo.test(correo)) return res.status(400).json({ error: "Correo inválido." });
  if (contrasena.length < 8)
    return res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres." });

  try {
    const resultado = await registrarUsuario({ nombre, apellido, correo, contrasena });
    if (resultado.error) return res.status(resultado.status || 400).json({ error: resultado.error });
    res.status(201).json(resultado);
  } catch (fallo) {
    console.error("Error al registrar usuario:", fallo);
    res.status(500).json({
      error:
        "No se pudo completar el registro. Ejecutá la migración de usuarios en Supabase y volvé a intentar.",
    });
  }
}

export async function iniciarSesionControlador(req, res) {
  const datos = req.validatedBody || req.body || {};
  const correo = String(datos.correo || datos.email || "")
    .trim()
    .toLowerCase();
  const contrasena = String(datos.contrasena || datos.password || "");

  const resultado = await iniciarSesion({ correo, contrasena });
  if (resultado.error) return res.status(resultado.status || 401).json({ error: resultado.error });

  res.json(resultado);
}

export async function renovarSesionControlador(req, res) {
  const datos = req.validatedBody || req.body || {};
  const tokenActualizacion = String(
    datos.tokenActualizacion || datos.refreshToken || datos.refresh_token || "",
  );
  const resultado = await renovarSesion(tokenActualizacion);
  if (resultado.error) return res.status(resultado.status || 401).json({ error: resultado.error });
  res.json(resultado);
}

export async function cerrarSesionControlador(req, res) {
  await cerrarSesion(req.user?.id);
  res.json({ ok: true });
}

export async function obtenerMiPerfil(req, res) {
  const perfil = (await obtenerPerfil(req.user.id)) || (await asegurarPerfil(req.authUser));
  if (!perfil)
    return res.status(503).json({ error: "No se pudo validar el perfil de esta cuenta." });
  res.json({ usuario: perfil });
}

export async function actualizarMiContrasena(req, res) {
  try {
    res.json(
      await actualizarContrasena(
        req.user.id,
        (req.validatedBody || req.body || {}).contrasena ||
          (req.validatedBody || req.body || {}).password,
      ),
    );
  } catch (fallo) {
    res
      .status(fallo.status || 500)
      .json({ error: fallo.status ? fallo.message : "No se pudo actualizar la contraseña." });
  }
}

export async function actualizarMiPerfil(req, res) {
  try {
    res.json({ usuario: await actualizarPerfil(req.user.id, req.validatedBody || req.body || {}) });
  } catch (fallo) {
    res
      .status(fallo.status || 500)
      .json({ error: fallo.status ? fallo.message : "No se pudo guardar el perfil." });
  }
}

export function esAdmin(req, res) {
  res.json({ rol: req.user.rol, nombre: req.user.nombre || req.user.correo });
}

export async function recuperar(req, res) {
  const datos = req.validatedBody || req.body || {};
  const correo = String(datos.correo || datos.email || "")
    .trim()
    .toLowerCase();

  const resultado = await solicitarRecuperacion(correo);
  if (resultado.error) return res.status(400).json({ error: resultado.error });
  res.json({
    success: true,
    message: "Si el correo existe, recibirás un enlace para cambiar la contraseña.",
  });
}

export async function google(req, res) {
  const resultado = await iniciarGoogle();
  if (resultado.error || !resultado.url)
    return res.status(503).json({ error: resultado.error || "No se pudo iniciar Google OAuth." });
  res.set("Cache-Control", "no-store");
  res.set("Referrer-Policy", "no-referrer");
  res.redirect(resultado.url);
}

export async function googleCallback(req, res) {
  res.set("Cache-Control", "no-store");
  res.set("Referrer-Policy", "no-referrer");
  let frontend;
  try {
    frontend = new URL(process.env.FRONTEND_URL || "https://websigtur.onrender.com/login.html");
    const allowedOrigin = process.env.FRONTEND_ORIGIN
      ? new URL(process.env.FRONTEND_ORIGIN).origin
      : frontend.origin;
    if (frontend.origin !== allowedOrigin) throw new Error("OAuth frontend origin mismatch");
  } catch {
    return res.status(503).json({ error: "La URL pública del frontend no está configurada." });
  }
  const code = String(req.query.code || "");
  if (!code) {
    const providerError = String(req.query.error_description || req.query.error || "")
      .trim()
      .slice(0, 240);
    frontend.searchParams.set("oauth_error", providerError || "missing_code");
    return res.redirect(frontend.toString());
  }
  const resultado = await completarGoogle(code);
  if (resultado.error) {
    frontend.searchParams.set("oauth_error", resultado.error);
    return res.redirect(frontend.toString());
  }
  const parametrosCallback = new URLSearchParams({
    access_token: resultado.token,
    refresh_token: resultado.tokenActualizacion || resultado.refreshToken || "",
    expires_at: String(resultado.expiresAt || ""),
    type: "oauth",
  });
  frontend.hash = parametrosCallback.toString();
  res.redirect(frontend.toString());
}

// Alias temporales mientras frontend y XAMPP migran a nombres internos en español.
export {
  registrar as register,
  iniciarSesionControlador as login,
  renovarSesionControlador as renovar,
  cerrarSesionControlador as logout,
  obtenerMiPerfil as me,
};
