// ============================================================================
// rutas/auth_rutas.js
// Define las URLs de autenticación. Se monta en app.js bajo /api/auth.
//   POST /api/auth/register  { nombre, apellido, correo, password }
//   POST /api/auth/login     { correo, password }
//   POST /api/auth/logout    (requiere sesión)
//   GET  /api/auth/me        (requiere sesión)
// ============================================================================
import { Router } from "express";
import {
  register,
  login,
  renovar,
  logout,
  me,
  actualizarMiPerfil,
  actualizarMiContrasena,
  esAdmin,
  recuperar,
  google,
  googleCallback,
} from "../controladores/controlador_auth.js";
import { requiereSesion, requiereAdmin } from "../servicios/verificacion.js";
import {
  validate,
  registerSchema,
  loginSchema,
  refreshSchema,
  recuperarSchema,
  profileSchema,
  passwordUpdateSchema,
} from "../servicios/validacion.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", validate(refreshSchema), renovar);
router.post("/logout", requiereSesion, logout);
router.get("/me", requiereSesion, me);
router.patch("/me", requiereSesion, validate(profileSchema), actualizarMiPerfil);
router.patch("/password", requiereSesion, validate(passwordUpdateSchema), actualizarMiContrasena);
router.get("/es-admin", requiereSesion, requiereAdmin, esAdmin);
router.post("/recuperar", validate(recuperarSchema), recuperar);
router.get("/google", google);
router.get("/google/callback", googleCallback);

export default router;
