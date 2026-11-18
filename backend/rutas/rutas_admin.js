import { Router } from "express";
import { requiereSesion, requiereAdmin } from "../servicios/verificacion.js";
import {
  crearEvento,
  actualizarEvento,
  listarEventos,
  listarUsuarios,
  banearUsuario,
  eliminarEvento,
  eliminarComentario,
  listarComentarios,
  fijarComentario,
  metricas,
  configuracion,
  aviso,
  actividad,
  registrarActividad,
  tickets,
  estadoTicket,
} from "../controladores/controlador_admin.js";
import { validate, eventSchema, baneoSchema } from "../servicios/validacion.js";

const router = Router();
router.use(requiereSesion, requiereAdmin);
router.get("/metricas", metricas);
router.get("/configuracion", configuracion);
router.patch("/configuracion", configuracion);
router.get("/aviso", aviso);
router.put("/aviso", aviso);
router.delete("/aviso", aviso);
router.get("/actividad", actividad);
router.post("/actividad", registrarActividad);
router.get("/soporte", tickets);
router.patch("/soporte/:id", estadoTicket);
router.get("/eventos", listarEventos);
router.post("/eventos", validate(eventSchema), crearEvento);
router.patch("/eventos/:id", validate(eventSchema), actualizarEvento);
router.delete("/eventos/:id", eliminarEvento);
router.delete("/comentarios/:id", eliminarComentario);
router.patch("/comentarios/:id/fijado", fijarComentario);
router.get("/comentarios", listarComentarios);
router.get("/usuarios", listarUsuarios);
router.patch("/usuarios/:id/baneo", validate(baneoSchema), banearUsuario);
export default router;
