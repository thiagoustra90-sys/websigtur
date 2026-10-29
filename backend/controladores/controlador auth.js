// ============================================================================
// controladores/controlador auth.js
// Recibe el request/response de Express, valida lo básico del body y llama
// a servicios/auth_servicios.js para hablar con Supabase.
// ============================================================================
import { registrarUsuario, iniciarSesion, renovarSesion, cerrarSesion, obtenerPerfil, asegurarPerfil, actualizarPerfil, solicitarRecuperacion, iniciarGoogle, completarGoogle } from "../servicios/auth_servicios.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function register(req, res) {
  const nombre = String(req.body?.nombre || "").trim();
  const apellido = String(req.body?.apellido || "").trim();
  const correo = String(req.body?.correo || req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");

  if (!nombre) return res.status(400).json({ error: "El nombre es obligatorio." });
  if (!emailRegex.test(correo)) return res.status(400).json({ error: "Correo inválido." });
  if (password.length < 8) return res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres." });

  try {
    const resultado = await registrarUsuario({ nombre, apellido, correo, password });
    if (resultado.error) return res.status(400).json({ error: resultado.error });
    res.status(201).json(resultado);
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res.status(500).json({ error: "No se pudo completar el registro. Ejecutá la migración de usuarios en Supabase y volvé a intentar." });
  }
}

export async function login(req, res) {
  const correo = String(req.body?.correo || req.body?.email || req.body?.user || "").trim().toLowerCase();
  const password = String(req.body?.password || "");

  if (!correo || !password) {
    return res.status(400).json({ error: "Completá correo y contraseña." });
  }

  const resultado = await iniciarSesion({ correo, password });
  if (resultado.error) return res.status(401).json({ error: resultado.error });

  res.json(resultado);
}

export async function renovar(req, res) {
  try {
    const refreshToken = String(req.body?.refreshToken || req.body?.refresh_token || "");
    const resultado = await renovarSesion(refreshToken);
    if (resultado.error) return res.status(401).json({ error: resultado.error });
    res.json(resultado);
  } catch (error) {
    console.error("Error al renovar sesión:", error);
    res.status(401).json({ error: "La sesión venció. Iniciá sesión nuevamente." });
  }
}

export async function logout(req, res) {
  await cerrarSesion(req.user?.id);
  res.json({ ok: true });
}

export async function me(req, res) {
  const perfil = await obtenerPerfil(req.user.id) || await asegurarPerfil(req.authUser);
  res.json({ usuario: perfil || req.user });
}

export async function actualizarMiPerfil(req, res) {
  try {
    res.json({ usuario: await actualizarPerfil(req.user.id, req.body || {}) });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.status ? error.message : 'No se pudo guardar el perfil.' });
  }
}

export function esAdmin(req, res) {
  res.json({ rol: req.user.rol, nombre: req.user.nombre || req.user.correo });
}

export async function recuperar(req, res) {
  const correo = String(req.body?.correo || req.body?.email || "").trim().toLowerCase();
  if (!emailRegex.test(correo)) return res.status(400).json({ error: "Correo inválido." });

  const resultado = await solicitarRecuperacion(correo);
  if (resultado.error) return res.status(400).json({ error: resultado.error });
  res.json({ success: true, message: "Si el correo existe, recibirás un enlace para cambiar la contraseña." });
}

export async function google(req, res) {
  const resultado = await iniciarGoogle();
  if (resultado.error) return res.status(503).json({ error: resultado.error });
  res.redirect(resultado.url);
}

export async function googleCallback(req, res) {
  let frontend;
  try {
    frontend = new URL(process.env.FRONTEND_URL || 'https://websigtur.onrender.com/login.html');
  } catch {
    return res.status(503).json({ error: 'La URL pública del frontend no está configurada.' });
  }
  const code = String(req.query.code || '');
  if (!code) {
    const providerError = String(req.query.error_description || req.query.error || '').trim().slice(0, 240);
    frontend.searchParams.set('oauth_error', providerError || 'missing_code');
    return res.redirect(frontend.toString());
  }
  const resultado = await completarGoogle(code);
  if (resultado.error) {
    frontend.searchParams.set('oauth_error', resultado.error);
    return res.redirect(frontend.toString());
  }
  frontend.searchParams.set('access_token', resultado.token);
  frontend.searchParams.set('refresh_token', resultado.refreshToken || '');
  frontend.searchParams.set('expires_at', String(resultado.expiresAt || ''));
  res.redirect(frontend.toString());
}
