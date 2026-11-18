import { Router } from "express";
import { requiereSesion, sesionOpcional } from "../servicios/verificacion.js";
import * as admin from "../servicios/admin_servicios.js";

const router = Router();
router.post("/", sesionOpcional, async (req, res, next) => {
  try {
    res.status(201).json({ data: await admin.crearTicket(req.body, req.user?.id || null) });
  } catch (error) {
    next(error);
  }
});
router.get("/mios", requiereSesion, async (req, res, next) => {
  try {
    res.json(await admin.listarTickets(req.query, req.user.id));
  } catch (error) {
    next(error);
  }
});
export default router;
