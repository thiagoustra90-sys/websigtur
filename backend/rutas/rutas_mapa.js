// ============================================================================
// rutas/rutas_mapa.js — se monta en app.js como GET /mapa y GET /api/mapa
// Query opcional: /mapa?tipo=company|event|place
// ============================================================================
import { Router } from "express";
import { listarPuntos } from "../controladores/controlador_mapa.js";

const router = Router();
router.get("/", listarPuntos);

export default router;
