// ============================================================================
// Rutas del mapa. El parámetro tipo permite limitar los resultados a una categoría.
// ============================================================================
import { Router } from "express";
import { listarPuntos } from "../controladores/controlador_mapa.js";

const router = Router();
router.get("/", listarPuntos);

export default router;
