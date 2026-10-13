import { Router } from "express";
import { listar } from "../controladores/controlador companias.js";

const router = Router();
router.get("/", listar);

export default router;
