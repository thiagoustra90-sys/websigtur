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
  registrar,
  iniciarSesionControlador,
  renovarSesionControlador,
  cerrarSesionControlador,
  obtenerMiPerfil,
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
  esquemaRegistro,
  esquemaInicioSesion,
  actualizacionSesionSchema,
  recuperarSchema,
  profileSchema,
  esquemaActualizacionContrasena,
} from "../servicios/validacion.js";

const router = Router();

router.post("/register", validate(esquemaRegistro), registrar);
router.post("/login", validate(esquemaInicioSesion), iniciarSesionControlador);
router.post("/refresh", validate(actualizacionSesionSchema), renovarSesionControlador);
router.post("/logout", requiereSesion, cerrarSesionControlador);
router.get("/me", requiereSesion, obtenerMiPerfil);
router.patch("/me", requiereSesion, validate(profileSchema), actualizarMiPerfil);
router.patch(
  "/password",
  requiereSesion,
  validate(esquemaActualizacionContrasena),
  actualizarMiContrasena,
);
router.get("/es-admin", requiereSesion, requiereAdmin, esAdmin);
router.post("/recuperar", validate(recuperarSchema), recuperar);
router.get("/google", google);
router.get("/google/callback", googleCallback);

export default router;
