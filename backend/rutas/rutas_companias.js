import { Router } from "express";
import { listar } from "../controladores/controlador_companias.js";

const router = Router();
router.get("/", listar);

export default router;
