import supabase from "../config/supabase.js";

export async function crearEvento(evento) {
  const title = String(evento.title || evento.titulo || '').trim();
  if (!title) throw Object.assign(new Error('El título del evento es obligatorio.'), { status: 400 });
  const description = String(evento.description || '').trim() || null;
  const location = String(evento.location || '').trim();
  const latitude = Number(evento.latitude);
  const longitude = Number(evento.longitude);
  const dateStart = String(evento.date_start || '').trim();
  const dateEnd = String(evento.date_end || '').trim() || null;
  const price = Number(evento.price || 0);
  const color = /^#[0-9a-f]{6}$/i.test(String(evento.color || '')) ? String(evento.color) : '#16b3a3';
  if (!location || !dateStart || !Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    throw Object.assign(new Error('Completá título, lugar, fecha de inicio y ubicación en el mapa.'), { status: 400 });
  }
  if (dateEnd && dateEnd < dateStart) {
    throw Object.assign(new Error('La fecha de finalización no puede ser anterior a la fecha de inicio.'), { status: 400 });
  }
  if (!Number.isFinite(price) || price < 0) {
    throw Object.assign(new Error('El precio debe ser un número mayor o igual a cero.'), { status: 400 });
  }
  const eventPayload = {
    title,
    description,
    date_start: dateStart,
    date_end: dateEnd,
    event_time: String(evento.event_time || '').trim() || null,
    location,
    latitude,
    longitude,
    price,
    categories: Array.isArray(evento.categories) ? evento.categories : [],
    image_url: String(evento.image_url || '').trim() || null,
    color,
  };
  let { data, error } = await supabase.from('events').insert(eventPayload).select().single();
  if (error?.code === 'PGRST204' || /column .*color.*does not exist/i.test(error?.message || '')) {
    delete eventPayload.color;
    ({ data, error } = await supabase.from('events').insert(eventPayload).select().single());
  }
  if (error) throw error;
  return data;
}

export async function listarEventosAdmin() {
  const { data, error } = await supabase.from('events')
    .select('id,title,categories,date_start,date_end,event_time,location,image_url,price')
    .order('date_start', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function listarUsuarios() {
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (authError) throw authError;
  const authUsers = authData?.users || [];
  const { data: profiles, error: profilesError } = await supabase.from('usuarios').select('id,nombre,apellido,correo,rol,created_at');
  if (profilesError) throw profilesError;
  const profileById = new Map((profiles || []).map(profile => [profile.id, profile]));
  const missingProfiles = authUsers
    .filter(user => !profileById.has(user.id))
    .map(user => ({
      id: user.id,
      nombre: String(user.user_metadata?.nombre || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario').trim(),
      apellido: String(user.user_metadata?.apellido || '').trim() || null,
      correo: user.email || `${user.id}@sin-correo.local`,
      rol: 'usuario',
    }));
  if (missingProfiles.length) {
    const { data: createdProfiles, error: createError } = await supabase.from('usuarios').upsert(missingProfiles, { onConflict: 'id' }).select('id,nombre,apellido,correo,rol,created_at');
    if (createError) throw createError;
    for (const profile of createdProfiles || []) profileById.set(profile.id, profile);
  }
  const data = authUsers.map(user => profileById.get(user.id)).filter(Boolean).sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')));
  return data;
}

export async function cambiarBaneo(userId, duration = '24h') {
  const { data, error } = await supabase.auth.admin.updateUserById(userId, { ban_duration: duration === 'none' ? 'none' : duration });
  if (error) throw error;
  return { id: data.user.id, banned: duration !== 'none', duration };
}

export async function eliminarEvento(eventId) {
  const { error } = await supabase.from('events').delete().eq('id', eventId);
  if (error) throw error;
}
