import supabase from "../config/supabase.js";

export async function listarComentariosForo(entidad) {
  const { data, error } = await supabase.from("comentarios")
    .select("id, usuario_id, parent_id, entidad_tipo, entidad_id, contenido, fijado, created_at, updated_at")
    .match({ entidad_tipo: entidad.entidad_tipo, entidad_id: String(entidad.entidad_id || "") })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return agregarAutores(data);
}

async function agregarAutores(comentarios = []) {
  const ids = [...new Set(comentarios.map(({ usuario_id }) => usuario_id).filter(Boolean))];
  if (!ids.length) return comentarios;
  const { data: usuarios, error } = await supabase.from("usuarios")
    .select("id, nombre, apellido, rol, avatar_url").in("id", ids);
  if (error) throw error;
  const autores = new Map((usuarios || []).map(usuario => [usuario.id, usuario]));
  return comentarios.map(comentario => ({ ...comentario, autor: autores.get(comentario.usuario_id) || null }));
}

export async function responderComentario(usuarioId, parentId, contenido) {
  const text = String(contenido || "").trim();
  if (!text || text.length > 2000) throw Object.assign(new Error("La respuesta debe tener entre 1 y 2000 caracteres."), { status: 400 });
  const { data: parent, error: parentError } = await supabase.from("comentarios").select("entidad_tipo, entidad_id").eq("id", parentId).single();
  if (parentError) throw parentError;
  const { data, error } = await supabase.from("comentarios").insert({ usuario_id: usuarioId, parent_id: parentId, ...parent, contenido: text }).select().single();
  if (error) throw error;
  return data;
}

export async function cambiarLikeComentario(usuarioId, comentarioId, activo) {
  const key = { usuario_id: usuarioId, comentario_id: comentarioId };
  const result = activo ? await supabase.from("comentarios_likes").upsert(key) : await supabase.from("comentarios_likes").delete().match(key);
  if (result.error) throw result.error;
  return { activo };
}

export async function estadoLikeComentario(usuarioId, comentarioId) {
  const { count, error } = await supabase.from("comentarios_likes").select("usuario_id", { count: "exact", head: true }).eq("comentario_id", comentarioId);
  if (error) throw error;
  const own = usuarioId ? await supabase.from("comentarios_likes").select("usuario_id").match({ usuario_id: usuarioId, comentario_id: comentarioId }).maybeSingle() : { data: null };
  if (own.error) throw own.error;
  return { likes: count || 0, liked: Boolean(own.data) };
}

export async function enviarMensaje(remitenteId, destinatarioId, contenido) {
  const text = String(contenido || "").trim();
  if (!destinatarioId || destinatarioId === remitenteId || !text || text.length > 5000) throw Object.assign(new Error("Destinatario y mensaje válidos son obligatorios."), { status: 400 });
  const { data, error } = await supabase.from("mensajes").insert({ remitente_id: remitenteId, destinatario_id: destinatarioId, contenido: text }).select().single();
  if (error) throw error;
  return data;
}

export async function listarMensajes(usuarioId, otroUsuarioId) {
  const filter = otroUsuarioId
    ? `and(remitente_id.eq.${usuarioId},destinatario_id.eq.${otroUsuarioId}),and(remitente_id.eq.${otroUsuarioId},destinatario_id.eq.${usuarioId})`
    : `remitente_id.eq.${usuarioId},destinatario_id.eq.${usuarioId}`;
  const { data, error } = await supabase.from("mensajes").select("id, remitente_id, destinatario_id, contenido, leido, created_at").or(filter).order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function listarUsuariosParaMensajes(usuarioId) {
  const { data, error } = await supabase.from("usuarios").select("id, nombre, apellido, correo, rol").neq("id", usuarioId).order("nombre");
  if (error) throw error;
  return data;
}

export async function marcarMensajesComoLeidos(usuarioId, otroUsuarioId) {
  if (!otroUsuarioId) return { updated: 0 };
  const { count, error } = await supabase.from("mensajes")
    .update({ leido: true })
    .eq("remitente_id", otroUsuarioId)
    .eq("destinatario_id", usuarioId)
    .eq("leido", false)
    .select("id", { count: "exact", head: true });
  if (error) throw error;
  return { updated: count || 0 };
}

export async function listarConversaciones(usuarioId) {
  const { data, error } = await supabase.from("mensajes")
    .select("id, remitente_id, destinatario_id, contenido, leido, created_at")
    .or(`remitente_id.eq.${usuarioId},destinatario_id.eq.${usuarioId}`)
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw error;

  const conversations = new Map();
  (data || []).forEach((mensaje) => {
    const contactoId = mensaje.remitente_id === usuarioId ? mensaje.destinatario_id : mensaje.remitente_id;
    const current = conversations.get(contactoId) || {
      usuario_id: contactoId,
      last_message: null,
      unread_count: 0,
    };

    if (!current.last_message || new Date(mensaje.created_at) > new Date(current.last_message.created_at)) {
      current.last_message = mensaje;
    }

    if (mensaje.destinatario_id === usuarioId && !mensaje.leido) {
      current.unread_count += 1;
    }

    conversations.set(contactoId, current);
  });

  const ids = [...conversations.keys()];
  if (!ids.length) return [];

  const { data: usuarios, error: usuariosError } = await supabase.from("usuarios")
    .select("id, nombre, apellido, correo, rol")
    .in("id", ids);
  if (usuariosError) throw usuariosError;

  const mapaUsuarios = new Map((usuarios || []).map((usuario) => [usuario.id, usuario]));

  return [...conversations.values()].map((entry) => {
    const usuario = mapaUsuarios.get(entry.usuario_id) || null;
    return {
      usuario_id: entry.usuario_id,
      usuario,
      last_message: entry.last_message,
      unread_count: entry.unread_count,
      updated_at: entry.last_message?.created_at || null,
    };
  }).sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0));
}

export async function eliminarComentarioAdmin(comentarioId) {
  const { error } = await supabase.from("comentarios").delete().eq("id", comentarioId);
  if (error) throw error;
}

export async function fijarComentarioAdmin(comentarioId, fijado) {
  const { data, error } = await supabase.from("comentarios")
    .update({ fijado: Boolean(fijado) }).eq("id", comentarioId).select("id, fijado").single();
  if (error) throw error;
  return data;
}

export async function listarComentariosAdmin() {
  const { data, error } = await supabase.from("comentarios").select("id, usuario_id, entidad_tipo, entidad_id, contenido, created_at").order("created_at", { ascending: false }).limit(100);
  if (error) throw error;
  return data;
}
