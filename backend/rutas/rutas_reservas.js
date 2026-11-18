import { Router } from "express";
import { requiereSesion } from "../servicios/verificacion.js";
import {
  listarReservas,
  crearPlan,
  crearReservaEvento,
  cancelarPlan,
  cancelarEvento,
} from "../controladores/controlador_reservas.js";

const router = Router();
router.use(requiereSesion);
router.get("/", listarReservas);
router.post("/planes", crearPlan);
router.delete("/planes/:id", cancelarPlan);
router.post("/eventos", crearReservaEvento);
router.delete("/eventos/:id", cancelarEvento);
export default router;
