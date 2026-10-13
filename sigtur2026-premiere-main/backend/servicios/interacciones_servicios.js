import supabase from "../config/supabase.js";

const TIPOS = new Set(["company", "event", "place"]);

export function validarEntidad({ entidad_tipo, entidad_id }) {
  if (!TIPOS.has(String(entidad_tipo)) || !String(entidad_id || '').trim()) {
    throw Object.assign(new Error("entidad_tipo y entidad_id son obligatorios y válidos."), { status: 400 });
  }
  return { entidad_tipo: String(entidad_tipo), entidad_id: String(entidad_id).trim() };
}

export async function listarComentarios(entidad) {
  const { data, error } = await supabase.from("comentarios")
    .select("id, usuario_id, parent_id, entidad_tipo, entidad_id, contenido, fijado, created_at, updated_at")
    .match(validarEntidad(entidad)).order("fijado", { ascending: false }).order("created_at", { ascending: false });
  if (error) throw error;
  return agregarAutores(data);
}

// comentarios.usuario_id referencia auth.users, por eso el perfil público se
// obtiene en una segunda consulta a public.usuarios.
async function agregarAutores(comentarios = []) {
  const ids = [...new Set(comentarios.map(({ usuario_id }) => usuario_id).filter(Boolean))];
  if (!ids.length) return comentarios;
  const { data: usuarios, error } = await supabase
    .from("usuarios")
    .select("id, nombre, apellido, rol, avatar_url")
    .in("id", ids);
  if (error) throw error;
  const autores = new Map((usuarios || []).map(usuario => [usuario.id, usuario]));
  return comentarios.map(comentario => ({ ...comentario, autor: autores.get(comentario.usuario_id) || null }));
}

export async function crearComentario(usuarioId, entidad, contenido) {
  const text = String(contenido || '').trim();
  if (!text || text.length > 2000) throw Object.assign(new Error("El comentario debe tener entre 1 y 2000 caracteres."), { status: 400 });
  const { data, error } = await supabase.from("comentarios").insert({
    usuario_id: usuarioId, ...validarEntidad(entidad), contenido: text
  }).select().single();
  if (error) throw error;
  return data;
}

export async function editarComentario(usuarioId, id, contenido) {
  const text = String(contenido || '').trim();
  if (!text || text.length > 2000) throw Object.assign(new Error("El comentario debe tener entre 1 y 2000 caracteres."), { status: 400 });
  const { data, error } = await supabase.from("comentarios").update({ contenido: text, updated_at: new Date().toISOString() })
    .eq("id", id).eq("usuario_id", usuarioId).select().single();
  if (error) throw error;
  return data;
}

export async function eliminarComentario(usuarioId, id) {
  const { error } = await supabase.from("comentarios").delete().eq("id", id).eq("usuario_id", usuarioId);
  if (error) throw error;
}

export async function reportarComentario(usuarioId, comentarioId, motivo) {
  const { data, error } = await supabase.from("comentarios_reportados").insert({ comentario_id: comentarioId, usuario_id: usuarioId, motivo: String(motivo || '').trim() }).select().single();
  if (error) throw error;
  return data;
}

async function cambiarRecurso(tabla, usuarioId, entidad, activo) {
  const key = { usuario_id: usuarioId, ...validarEntidad(entidad) };
  const result = activo ? await supabase.from(tabla).upsert(key).select().single() : await supabase.from(tabla).delete().match(key);
  if (result.error) throw result.error;
  return { activo };
}

export async function cambiarLike(usuarioId, entidad, activo) { return cambiarRecurso("likes", usuarioId, entidad, activo); }
export async function cambiarGuardado(usuarioId, entidad, activo) { return cambiarRecurso("guardados", usuarioId, entidad, activo); }

export async function estadoInteracciones(usuarioId, entidad) {
  const key = validarEntidad(entidad);
  const likes = await supabase.from("likes").select("usuario_id", { count: "exact", head: true }).match(key);
  if (likes.error) throw likes.error;
  const guardados = usuarioId ? await supabase.from("guardados").select("usuario_id", { count: "exact", head: true }).match({ usuario_id: usuarioId, ...key }) : { count: 0, error: null };
  if (guardados.error) throw guardados.error;
  const ownLike = usuarioId ? await supabase.from("likes").select("usuario_id").match({ usuario_id: usuarioId, ...key }).maybeSingle() : { data: null };
  if (ownLike.error) throw ownLike.error;
  return { likes: likes.count || 0, liked: Boolean(ownLike.data), saved: Boolean(guardados.count) };
}

export async function listarGuardados(usuarioId) {
  const { data, error } = await supabase.from("guardados").select("entidad_tipo, entidad_id, created_at").eq("usuario_id", usuarioId).order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
