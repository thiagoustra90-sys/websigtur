// ============================================================================
// rutas/auth rutas.js
// Define las URLs de autenticación. Se monta en app.js bajo /api/auth.
//   POST /api/auth/register  { nombre, apellido, correo, password }
//   POST /api/auth/login     { correo, password }
//   POST /api/auth/logout    (requiere sesión)
//   GET  /api/auth/me        (requiere sesión)
// ============================================================================
import { Router } from "express";
import { register, login, renovar, logout, me, actualizarMiPerfil, esAdmin, recuperar, google, googleCallback } from "../controladores/controlador auth.js";
import { requiereSesion, requiereAdmin } from "../servicios/verificacion.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", renovar);
router.post("/logout", requiereSesion, logout);
router.get("/me", requiereSesion, me);
router.patch("/me", requiereSesion, actualizarMiPerfil);
router.get("/es-admin", requiereSesion, requiereAdmin, esAdmin);
router.post("/recuperar", recuperar);
router.get("/google", google);
router.get("/google/callback", googleCallback);

export default router;
