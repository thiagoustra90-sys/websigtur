import * as servicio from "../servicios/reservas_servicios.js";

function gestionarFallo(res, fallo) {
  res.status(fallo.status || 500).json({
    error: fallo.status ? fallo.message : "No se pudo completar la operación de reservas.",
  });
}
export async function listarReservas(req, res) {
  try {
    res.json(await servicio.listarReservas(req.user.id));
  } catch (fallo) {
    gestionarFallo(res, fallo);
  }
}
export async function crearPlan(req, res) {
  try {
    res.status(201).json(await servicio.crearPlan(req.user.id, req.body));
  } catch (fallo) {
    gestionarFallo(res, fallo);
  }
}
export async function crearReservaEvento(req, res) {
  try {
    res.status(201).json(await servicio.crearReservaEvento(req.user.id, req.body));
  } catch (fallo) {
    gestionarFallo(res, fallo);
  }
}
export async function cancelarPlan(req, res) {
  try {
    await servicio.cancelarReserva(req.user.id, "tourism_plans", req.params.id);
    res.status(204).end();
  } catch (fallo) {
    gestionarFallo(res, fallo);
  }
}
export async function cancelarEvento(req, res) {
  try {
    await servicio.cancelarReserva(req.user.id, "event_reservations", req.params.id);
    res.status(204).end();
  } catch (fallo) {
    gestionarFallo(res, fallo);
  }
}

// Alias temporales para controladores que todavía importan los nombres anteriores.
export { listarReservas as listar, crearPlan as plan, crearReservaEvento as evento };
