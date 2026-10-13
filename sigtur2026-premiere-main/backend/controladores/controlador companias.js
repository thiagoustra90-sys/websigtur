import { listarCompanias } from "../servicios/compania_servicios.js";

export async function listar(req, res) {
  try {
    res.json(await listarCompanias());
  } catch (error) {
    res.status(500).json({ error: "No se pudieron cargar las compañías." });
  }
}
