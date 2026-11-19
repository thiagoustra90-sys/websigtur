// ============================================================================
// servicios/verificacion.js
// Valida el token de la petición con Supabase y deja el usuario autenticado
// en la solicitud para que lo usen los controladores.
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

// Permite rutas públicas que muestran información adicional cuando hay sesión;
// si no llega un token válido, continúa con req.user = null.
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
