import { Router } from "express";
import { requiereSesion } from "../servicios/verificacion.js";
import {
  listar,
  plan,
  evento,
  cancelarPlan,
  cancelarEvento,
} from "../controladores/controlador_reservas.js";

const router = Router();
router.use(requiereSesion);
router.get("/", listar);
router.post("/planes", plan);
router.delete("/planes/:id", cancelarPlan);
router.post("/eventos", evento);
router.delete("/eventos/:id", cancelarEvento);
export default router;
