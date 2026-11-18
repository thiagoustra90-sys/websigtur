// ============================================================================
// servicios/verificacion.js
// Middleware de Express que protege rutas privadas. Lee el header
// "Authorization: Bearer <token>", lo valida contra Supabase Auth y cuelga
// el usuario en req.user para que el controlador lo use.
// ============================================================================
import { verificarToken, obtenerPerfil, asegurarPerfil } from "./auth_servicios.js";

export async function requiereSesion(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Falta iniciar sesión." });
  }

  const authUser = await verificarToken(token);
  if (!authUser) {
    return res.status(401).json({ error: "Sesión inválida o vencida." });
  }

  req.authUser = authUser;
  const perfil = (await obtenerPerfil(authUser.id)) || (await asegurarPerfil(authUser));
  if (!perfil)
    return res.status(503).json({ error: "No se pudo validar el perfil de esta cuenta." });
  req.user = perfil;
  next();
}

// Igual que requiereSesion pero no corta la request si no hay token: lo
// deja pasar con req.user = null. Útil para rutas que cambian de
// comportamiento si estás logueado, sin exigirlo (ej: "guardado" en mapa).
export async function sesionOpcional(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    req.user = null;
    return next();
  }
  const authUser = await verificarToken(token);
  req.user = authUser
    ? (await obtenerPerfil(authUser.id)) || (await asegurarPerfil(authUser))
    : null;
  next();
}

export function requiereAdmin(req, res, next) {
  const appRole = req.authUser?.app_metadata?.role || req.authUser?.app_metadata?.rol;
  const profileRole = req.user?.rol;
  if (appRole !== "admin" && profileRole !== "admin") {
    return res.status(403).json({ error: "Necesitás permisos de administrador." });
  }
  next();
}
