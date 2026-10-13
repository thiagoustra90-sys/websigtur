import { listarEventos } from "../servicios/eventos_servicios.js";

export async function listar(req, res) {
  try {
    res.json(await listarEventos());
  } catch (error) {
    res.status(500).json({ error: "No se pudieron cargar los eventos." });
  }
}
