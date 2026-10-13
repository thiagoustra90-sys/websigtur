// ============================================================================
// servicios/verificacion.js
// Middleware de Express que protege rutas privadas. Lee el header
// "Authorization: Bearer <token>", lo valida contra Supabase Auth y cuelga
// el usuario en req.user para que el controlador lo use.
// ============================================================================
import { verificarToken, obtenerPerfil } from "./auth_servicios.js";

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

  const perfil = await obtenerPerfil(authUser.id);
  req.user = perfil || { id: authUser.id, correo: authUser.email, rol: "usuario" };
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
  req.user = authUser ? (await obtenerPerfil(authUser.id)) || { id: authUser.id, correo: authUser.email } : null;
  next();
}

export function requiereAdmin(req, res, next) {
  if (!req.user || req.user.rol !== "admin") {
    return res.status(403).json({ error: "Necesitás permisos de administrador." });
  }
  next();
}
