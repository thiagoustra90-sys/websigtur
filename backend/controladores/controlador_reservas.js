import * as service from "../servicios/reservas_servicios.js";

function fail(res, error) {
  res.status(error.status || 500).json({
    error: error.status ? error.message : "No se pudo completar la operación de reservas.",
  });
}
export async function listar(req, res) {
  try {
    res.json(await service.listarReservas(req.user.id));
  } catch (error) {
    fail(res, error);
  }
}
export async function plan(req, res) {
  try {
    res.status(201).json(await service.crearPlan(req.user.id, req.body));
  } catch (error) {
    fail(res, error);
  }
}
export async function evento(req, res) {
  try {
    res.status(201).json(await service.crearReservaEvento(req.user.id, req.body));
  } catch (error) {
    fail(res, error);
  }
}
export async function cancelarPlan(req, res) {
  try {
    await service.cancelarReserva(req.user.id, "tourism_plans", req.params.id);
    res.status(204).end();
  } catch (error) {
    fail(res, error);
  }
}
export async function cancelarEvento(req, res) {
  try {
    await service.cancelarReserva(req.user.id, "event_reservations", req.params.id);
    res.status(204).end();
  } catch (error) {
    fail(res, error);
  }
}
