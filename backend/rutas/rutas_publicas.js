import { Router } from "express";
import * as admin from "../servicios/admin_servicios.js";

const router = Router();
router.get("/site", async (_req, res, next) => {
  try {
    const stored = await admin.leerConfiguracion();
    const settings = Object.fromEntries(
      ["featuredEvents", "reviewPlaces", "showSupport", "maintenanceMode"]
        .filter((key) => typeof stored[key] === "boolean")
        .map((key) => [key, stored[key]]),
    );
    res.json({ settings, announcement: stored.announcement || null });
  } catch (error) {
    next(error);
  }
});
export default router;
