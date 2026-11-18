import supabase from "../config/supabase.js";

function badRequest(message) {
  return Object.assign(new Error(message), { status: 400 });
}
function requiredText(value, label, max = 180) {
  const text = String(value || "").trim();
  if (!text || text.length > max) throw badRequest(`${label} es obligatorio.`);
  return text;
}
function validatePeople(value) {
  const people = Number(value);
  if (!Number.isInteger(people) || people < 1 || people > 20)
    throw badRequest("La cantidad de personas debe estar entre 1 y 20.");
  return people;
}
function validateDate(value) {
  const date = String(value || "");
  const parsed = new Date(`${date}T00:00:00Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== date ||
    date < new Date().toISOString().slice(0, 10)
  )
    throw badRequest("Elegí una fecha válida a partir de hoy.");
  return date;
}
export async function crearPlan(usuarioId, body) {
  body ||= {};
  const payload = {
    user_id: usuarioId,
    place_ref: requiredText(body.place_ref, "El lugar", 240),
    place_name: requiredText(body.place_name, "El nombre del lugar"),
    visit_date: validateDate(body.visit_date),
    people: validatePeople(body.people),
    schedule: requiredText(body.schedule, "El horario", 120),
  };
  const { data, error } = await supabase.from("tourism_plans").insert(payload).select().single();
  if (error) throw error;
  return data;
}
export async function crearReservaEvento(usuarioId, body) {
  body ||= {};
  const payload = {
    user_id: usuarioId,
    event_ref: requiredText(body.event_ref, "El evento", 240),
    event_title: requiredText(body.event_title, "El evento"),
    quantity: validatePeople(body.quantity),
    schedule: requiredText(body.schedule, "El horario", 120),
  };
  const { data, error } = await supabase
    .from("event_reservations")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}
export async function listarReservas(usuarioId) {
  const [events, plans] = await Promise.all([
    supabase
      .from("event_reservations")
      .select("*")
      .eq("user_id", usuarioId)
      .order("created_at", { ascending: false }),
    supabase
      .from("tourism_plans")
      .select("*")
      .eq("user_id", usuarioId)
      .order("created_at", { ascending: false }),
  ]);
  if (events.error) throw events.error;
  if (plans.error) throw plans.error;
  return { events: events.data || [], plans: plans.data || [] };
}
export async function cancelarReserva(usuarioId, table, id) {
  if (!["event_reservations", "tourism_plans"].includes(table))
    throw badRequest("Tipo de reserva inválido.");
  const { data, error } = await supabase
    .from(table)
    .delete()
    .eq("id", id)
    .eq("user_id", usuarioId)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  if (!data)
    throw Object.assign(new Error("No se encontró la reserva o no pertenece a tu cuenta."), {
      status: 404,
    });
}
