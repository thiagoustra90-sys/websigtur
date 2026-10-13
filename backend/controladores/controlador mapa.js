// ============================================================================
// controladores/controlador mapa.js
// ============================================================================
import { obtenerPuntosDeMapa } from "../servicios/mapa_servicios.js";

export async function listarPuntos(req, res) {
  try {
    const puntos = await obtenerPuntosDeMapa({ tipo: req.query.tipo });
    res.json({ data: puntos, total: puntos.length });
  } catch (error) {
    res.status(500).json({ error: "No se pudieron cargar los puntos del mapa." });
  }
}
