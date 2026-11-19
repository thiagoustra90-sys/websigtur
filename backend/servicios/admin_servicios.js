import supabase from "../config/supabase.js";

function validarEvento(evento) {
  const title = String(evento.title || evento.titulo || "").trim();
  if (!title)
    throw Object.assign(new Error("El título del evento es obligatorio."), { status: 400 });
  const description = String(evento.description || "").trim() || null;
  const location = String(evento.location || "").trim();
  const latitude = Number(evento.latitude);
  const longitude = Number(evento.longitude);
  const dateStart = String(evento.date_start || "").trim();
  const dateEnd = String(evento.date_end || "").trim() || null;
  const price = Number(evento.price || 0);
  const color = /^#[0-9a-f]{6}$/i.test(String(evento.color || ""))
    ? String(evento.color)
    : "#16b3a3";
  if (
    !location ||
    !dateStart ||
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90 ||
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw Object.assign(
      new Error("Completá título, lugar, fecha de inicio y ubicación en el mapa."),
      { status: 400 },
    );
  }
  if (dateEnd && dateEnd < dateStart) {
    throw Object.assign(
      new Error("La fecha de finalización no puede ser anterior a la fecha de inicio."),
      { status: 400 },
    );
  }
  if (!Number.isFinite(price) || price < 0) {
    throw Object.assign(new Error("El precio debe ser un número mayor o igual a cero."), {
      status: 400,
    });
  }
  const eventPayload = {
    title,
    description,
    date_start: dateStart,
    date_end: dateEnd,
    event_time: String(evento.event_time || "").trim() || null,
    location,
    latitude,
    longitude,
    price,
    categories: Array.isArray(evento.categories) ? evento.categories : [],
    image_url: String(evento.image_url || "").trim() || null,
    link: String(evento.link || "").trim() || null,
    color,
  };
  return eventPayload;
}

async function guardarEvento(eventPayload, eventId = null) {
  const guardar = (payload) => {
    const consulta = eventId
      ? supabase.from("events").update(payload).eq("id", eventId)
      : supabase.from("events").insert(payload);
    return consulta.select().single();
  };
  let { data, error } = await guardar(eventPayload);
  if (error?.code === "PGRST204" || /column .*color.*does not exist/i.test(error?.message || "")) {
    delete eventPayload.color;
    ({ data, error } = await guardar(eventPayload));
  }
  if (error) throw error;
  return data;
}

export async function crearEvento(evento) {
  return guardarEvento(validarEvento(evento));
}

export async function actualizarEvento(eventId, evento) {
  return guardarEvento(validarEvento(evento), eventId);
}

const pageArgs = (query) => ({
  page: Math.max(1, Number(query.page) || 1),
  pageSize: Math.min(50, Math.max(1, Number(query.pageSize) || 10)),
});
export async function listarEventosAdmin(query = {}) {
  const { page, pageSize } = pageArgs(query);
  const buildQuery = (includeColor) => {
    let request = supabase
      .from("events")
      .select(
        `id,title,description,categories,date_start,date_end,event_time,location,latitude,longitude,image_url,link,price${includeColor ? ",color" : ""}`,
        { count: "exact" },
      )
      .order("date_start", { ascending: true });
    if (query.q)
      request = request.or(
        `title.ilike.%${String(query.q).replace(/[,%()]/g, "")}%,location.ilike.%${String(query.q).replace(/[,%()]/g, "")}%`,
      );
    return request.range((page - 1) * pageSize, page * pageSize - 1);
  };
  let { data, error, count } = await buildQuery(true);
  if (error?.code === "PGRST204" || /column .*color.*does not exist/i.test(error?.message || "")) {
    ({ data, error, count } = await buildQuery(false));
  }
  if (error) throw error;
  return { data: data || [], total: count || 0, page, pageSize };
}

export async function listarUsuarios(query = {}) {
  const { page, pageSize } = pageArgs(query);
  let request = supabase
    .from("usuarios")
    .select("id,nombre,apellido,correo,rol,created_at", { count: "exact" })
    .order("created_at", { ascending: false });
  if (query.q) {
    const q = String(query.q).replace(/[,%()]/g, "");
    request = request.or(`nombre.ilike.%${q}%,apellido.ilike.%${q}%,correo.ilike.%${q}%`);
  }
  if (query.rol && ["usuario", "admin"].includes(query.rol)) request = request.eq("rol", query.rol);
  const { data, error, count } = await request.range((page - 1) * pageSize, page * pageSize - 1);
  if (error) throw error;
  const users = await Promise.all(
    (data || []).map(async (profile) => {
      const { data: auth } = await supabase.auth.admin.getUserById(profile.id);
      return {
        ...profile,
        banned: Boolean(auth?.user?.banned_until && new Date(auth.user.banned_until) > new Date()),
      };
    }),
  );
  return { data: users, total: count || 0, page, pageSize };
}

export async function cambiarBaneo(userId, duration = "24h") {
  const normalized = duration === "none" ? "none" : String(duration || "24h").trim();
  const allowed = new Set(["none", "1h", "24h", "7d", "30d"]);
  if (!allowed.has(normalized)) {
    throw Object.assign(new Error("Duración de baneo no válida."), { status: 400 });
  }
  if (!/^[0-9a-f-]{36}$/i.test(String(userId || ""))) {
    throw Object.assign(new Error("Usuario no válido."), { status: 400 });
  }
  const { data, error } = await supabase.auth.admin.updateUserById(userId, {
    ban_duration: normalized === "none" ? "none" : normalized,
  });
  if (error) throw error;
  return { id: data.user.id, banned: normalized !== "none", duration: normalized };
}

export async function eliminarEvento(eventId) {
  const { error } = await supabase.from("events").delete().eq("id", eventId);
  if (error) throw error;
}

export async function crearTicket(ticket, userId = null) {
  const ticketType = ticket.ticket_type === "business_verification" ? ticket.ticket_type : "general";
  const payload = {
    name: String(ticket.name || "").trim(),
    email: String(ticket.email || "").trim().toLowerCase(),
    topic: String(
      ticketType === "business_verification"
        ? "Verificaci\u00f3n de empresa u organizaci\u00f3n"
        : ticket.topic || "General",
    ).trim().slice(0, 100),
    message: String(ticket.message || "").trim(),
    user_id: userId,
    ticket_type: ticketType,
    details: {},
  };
  if (
    payload.name.length < 2 ||
    payload.name.length > 120 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email) ||
    payload.message.length < 10 ||
    payload.message.length > 5000
  ) {
    throw Object.assign(
      new Error("Revis\u00e1 el nombre, correo y mensaje (entre 10 y 5000 caracteres)."),
      { status: 400 },
    );
  }
  if (ticketType === "business_verification") {
    if (!userId)
      throw Object.assign(new Error("IniciÃ¡ sesiÃ³n con la cuenta que querÃ©s verificar."), {
        status: 401,
      });
    const details = ticket.details || {};
    const organizationType = String(details.organization_type || "").trim();
    const legalName = String(details.legal_name || "").trim();
    const publicName = String(details.public_name || "").trim();
    const phone = String(details.phone || "").trim();
    const address = String(details.address || "").trim();
    const locality = String(details.locality || "").trim();
    const registrationNumber = String(details.registration_number || "").trim();
    const website = String(details.website || "").trim();
    const evidenceUrl = String(details.evidence_url || "").trim();
    const validUrl = (value) => {
      if (!value) return true;
      if (value.length > 1500) return false;
      try { return ["http:", "https:"].includes(new URL(value).protocol); }
      catch { return false; }
    };
    if (
      !["company", "nonprofit", "tourism_service", "independent_professional"].includes(organizationType) ||
      legalName.length < 2 || legalName.length > 180 ||
      publicName.length < 2 || publicName.length > 180 ||
      phone.length < 7 || phone.length > 40 ||
      address.length < 4 || address.length > 250 ||
      locality.length < 2 || locality.length > 120 ||
      registrationNumber.length > 80 ||
      !validUrl(website) || !validUrl(evidenceUrl) ||
      details.authorization !== true
    ) {
      throw Object.assign(
        new Error("Complet\u00e1 los datos obligatorios y confirm\u00e1 que est\u00e1s autorizado a enviarlos."),
        { status: 400 },
      );
    }
    payload.details = {
      organization_type: organizationType,
      legal_name: legalName,
      public_name: publicName,
      registration_number: registrationNumber || null,
      phone,
      website: website || null,
      evidence_url: evidenceUrl || null,
      address,
      locality,
      authorization: true,
    };
  }
  const { data, error } = await supabase
    .from("support_tickets")
    .insert(payload)
    .select("id,status,created_at,ticket_type")
    .single();
  if (error) throw error;
  return data;
}
export async function listarTickets(query = {}, userId = null) {
  const { page, pageSize } = pageArgs(query);
  let request = supabase
    .from("support_tickets")
    .select("id,user_id,name,email,topic,message,ticket_type,details,status,created_at,updated_at", { count: "exact" })
    .order("created_at", { ascending: false });
  if (userId) request = request.eq("user_id", userId);
  else {
    if (query.status && ["open", "in_progress", "resolved"].includes(query.status))
      request = request.eq("status", query.status);
    if (query.type && ["general", "business_verification"].includes(query.type))
      request = request.eq("ticket_type", query.type);
  }
  if (query.q)
    request = request.or(
      `name.ilike.%${String(query.q).replace(/[,%()]/g, "")}%,email.ilike.%${String(query.q).replace(/[,%()]/g, "")}%,topic.ilike.%${String(query.q).replace(/[,%()]/g, "")}%`,
    );
  const { data, error, count } = await request.range((page - 1) * pageSize, page * pageSize - 1);
  if (error) throw error;
  return { data: data || [], total: count || 0, page, pageSize };
}
export async function cambiarEstadoTicket(id, status, actorId) {
  if (!["open", "in_progress", "resolved"].includes(status))
    throw Object.assign(new Error("Estado de ticket no válido."), { status: 400 });
  const { data, error } = await supabase
    .from("support_tickets")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id,status")
    .single();
  if (error) throw error;
  await registrarActividad(actorId, "support.ticket.status", { ticketId: id, status });
  return data;
}
export async function leerConfiguracion() {
  const { data, error } = await supabase.from("admin_settings").select("key,value");
  if (error) throw error;
  return Object.fromEntries((data || []).map((row) => [row.key, row.value]));
}
export async function guardarConfiguracion(settings, actorId) {
  const allowed = ["featuredEvents", "reviewPlaces", "showSupport", "maintenanceMode"];
  const rows = allowed
    .filter((key) => typeof settings[key] === "boolean")
    .map((key) => ({
      key,
      value: settings[key],
      updated_by: actorId,
      updated_at: new Date().toISOString(),
    }));
  if (rows.length) {
    const { error } = await supabase.from("admin_settings").upsert(rows, { onConflict: "key" });
    if (error) throw error;
  }
  await registrarActividad(actorId, "admin.settings.updated", settings);
  return leerConfiguracion();
}
export async function leerAviso() {
  const settings = await leerConfiguracion();
  return settings.announcement || null;
}
export async function guardarAviso(announcement, actorId) {
  const title = String(announcement.title || "")
      .trim()
      .slice(0, 120),
    body = String(announcement.body || "")
      .trim()
      .slice(0, 1000);
  if (!title || !body)
    throw Object.assign(new Error("El título y el mensaje del aviso son obligatorios."), {
      status: 400,
    });
  const value = { title, body, updatedAt: new Date().toISOString() };
  const { error } = await supabase
    .from("admin_settings")
    .upsert(
      { key: "announcement", value, updated_by: actorId, updated_at: value.updatedAt },
      { onConflict: "key" },
    );
  if (error) throw error;
  await registrarActividad(actorId, "admin.announcement.updated", { title });
  return value;
}
export async function borrarAviso(actorId) {
  const { error } = await supabase.from("admin_settings").delete().eq("key", "announcement");
  if (error) throw error;
  await registrarActividad(actorId, "admin.announcement.deleted", {});
}
export async function registrarActividad(actorId, action, details = {}) {
  const { error } = await supabase
    .from("admin_activity")
    .insert({ actor_id: actorId, action, details });
  if (error) throw error;
}
export async function listarActividad(query = {}) {
  const { page, pageSize } = pageArgs(query);
  const { data, error, count } = await supabase
    .from("admin_activity")
    .select("id,actor_id,action,details,created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);
  if (error) throw error;
  return { data: data || [], total: count || 0, page, pageSize };
}
export async function obtenerMetricas() {
  const now = new Date().toISOString().slice(0, 10);
  const [events, places, tickets, reports] = await Promise.all([
    supabase.from("events").select("id", { count: "exact", head: true }).gte("date_start", now),
    supabase.from("places").select("id", { count: "exact", head: true }),
    supabase
      .from("support_tickets")
      .select("id", { count: "exact", head: true })
      .in("status", ["open", "in_progress"]),
    supabase.from("comentarios_reportados").select("id", { count: "exact", head: true }),
  ]);
  for (const result of [events, places, tickets, reports]) if (result.error) throw result.error;
  return {
    events: events.count || 0,
    places: places.count || 0,
    tickets: tickets.count || 0,
    review: reports.count || 0,
  };
}
