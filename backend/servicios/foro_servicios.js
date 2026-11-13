import supabase from "../config/supabase.js";
import { randomUUID } from "node:crypto";

const AUDIO_BUCKET = "message-audio";
const MESSAGE_FILES_BUCKET = "message-files";
const signedAudioUrlCache = new Map();
const AUDIO_TYPES = new Map([
  ["audio/webm", { extension: "webm", matches: buffer => buffer.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3])) }],
  ["audio/ogg", { extension: "ogg", matches: buffer => buffer.subarray(0, 4).toString("ascii") === "OggS" }],
  ["audio/mp4", { extension: "m4a", matches: buffer => buffer.length > 12 && buffer.subarray(4, 8).toString("ascii") === "ftyp" }],
  ["audio/mpeg", { extension: "mp3", matches: buffer => buffer.subarray(0, 3).toString("ascii") === "ID3" || (buffer.length > 1 && buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0) }],
  ["audio/wav", { extension: "wav", matches: buffer => buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WAVE" }],
]);
const MESSAGE_FILE_TYPES = new Map([
  ["image/jpeg", { extension: "jpg", matches: buffer => buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff }],
  ["image/png", { extension: "png", matches: buffer => buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) }],
  ["image/gif", { extension: "gif", matches: buffer => ["GIF87a", "GIF89a"].includes(buffer.subarray(0, 6).toString("ascii")) }],
  ["image/webp", { extension: "webp", matches: buffer => buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP" }],
  ["application/pdf", { extension: "pdf", matches: buffer => buffer.subarray(0, 5).toString("ascii") === "%PDF-" }],
]);

function badRequest(message) {
  return Object.assign(new Error(message), { status: 400 });
}

export async function subirAudioMensaje(usuarioId, contentType, file) {
  if (!Buffer.isBuffer(file) || !file.length) throw badRequest("No se recibió una grabación válida.");
  if (file.length > 10 * 1024 * 1024) throw badRequest("El audio puede pesar como máximo 10 MB.");
  const mimeType = String(contentType || "").split(";")[0].trim().toLowerCase();
  const audioType = AUDIO_TYPES.get(mimeType);
  if (!audioType || !audioType.matches(file)) throw badRequest("El formato de audio no es compatible.");

  const path = `${usuarioId}/${randomUUID()}.${audioType.extension}`;
  const { error } = await supabase.storage.from(AUDIO_BUCKET).upload(path, file, {
    contentType: mimeType,
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  return { path };
}

export async function subirAdjuntoMensaje(usuarioId, contentType, file) {
  if (!Buffer.isBuffer(file) || !file.length) throw badRequest("Seleccioná un archivo válido.");
  if (file.length > 10 * 1024 * 1024) throw badRequest("Cada archivo puede pesar como máximo 10 MB.");
  const mimeType = String(contentType || "").split(";")[0].trim().toLowerCase();
  const fileType = MESSAGE_FILE_TYPES.get(mimeType);
  if (!fileType || !fileType.matches(file)) throw badRequest("Solo se permiten imágenes JPG, PNG, WebP, GIF o archivos PDF válidos.");

  const path = `${usuarioId}/${randomUUID()}.${fileType.extension}`;
  const { error } = await supabase.storage.from(MESSAGE_FILES_BUCKET).upload(path, file, {
    contentType: mimeType,
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  return { path, mime: mimeType, size: file.length };
}

function validarAdjuntosMensaje(usuarioId, attachments = []) {
  if (!Array.isArray(attachments) || attachments.length > 3) throw badRequest("Adjuntá hasta 3 archivos por mensaje.");
  const ownerId = String(usuarioId || "");
  if (!/^[0-9a-f-]{36}$/i.test(ownerId)) throw badRequest("La sesión no es válida.");
  return attachments.map(file => {
    if (!file || typeof file !== "object") throw badRequest("Uno de los adjuntos no es válido.");
    const mime = String(file.mime || "").toLowerCase();
    const spec = MESSAGE_FILE_TYPES.get(mime);
    const path = String(file.path || "");
    const expectedPath = new RegExp(`^${ownerId}/[0-9a-f-]{36}\\.${spec?.extension || "invalid"}$`, "i");
    const name = String(file.name || "Archivo adjunto").replace(/[\\/\x00-\x1f\x7f]/g, "_").trim().slice(0, 180);
    const size = Number(file.size);
    if (!spec || !expectedPath.test(path) || !name || !Number.isInteger(size) || size < 1 || size > 10 * 1024 * 1024) {
      throw badRequest("Uno de los adjuntos no es válido.");
    }
    return { path, name, mime, size };
  });
}

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

export async function enviarMensaje(remitenteId, destinatarioId, contenido, options = {}) {
  const tipo = options.tipo || "texto";
  if (!destinatarioId || destinatarioId === remitenteId) throw badRequest("Elegí un destinatario válido.");
  const attachments = validarAdjuntosMensaje(remitenteId, options.attachments || []);

  if (tipo === "audio") {
    if (attachments.length) throw badRequest("Enviá la nota de voz y los archivos en mensajes separados.");
    const audioPath = String(options.audio_path || "");
    const ownerId = String(remitenteId || "");
    if (!/^[0-9a-f-]{36}$/i.test(ownerId) || !new RegExp(`^${ownerId}/[0-9a-f-]{36}\\.(webm|ogg|m4a|mp3|wav)$`, "i").test(audioPath)) {
      throw badRequest("La grabación no pertenece a esta cuenta o no es válida.");
    }
    const duration = Number(options.duration_seconds);
    if (!Number.isInteger(duration) || duration < 1 || duration > 120) throw badRequest("El audio debe durar entre 1 segundo y 2 minutos.");
    const { data, error } = await supabase.from("mensajes").insert({
      remitente_id: remitenteId,
      destinatario_id: destinatarioId,
      contenido: "Mensaje de voz",
      tipo: "audio",
      audio_path: audioPath,
      duration_seconds: duration,
    }).select().single();
    if (error) throw error;
    return data;
  }

  const text = String(contenido || "").trim();
  if (!['texto', 'archivo'].includes(tipo) || text.length > 5000 || (!text && !attachments.length)) {
    throw badRequest("Escribí un mensaje o adjuntá un archivo (máximo 5000 caracteres)." );
  }
  const messageType = text ? "texto" : "archivo";
  const { data, error } = await supabase.from("mensajes").insert({
    remitente_id: remitenteId,
    destinatario_id: destinatarioId,
    contenido: text || "Archivos adjuntos",
    tipo: messageType,
    attachments,
  }).select().single();
  if (error) throw error;
  return data;
}

export async function listarMensajes(usuarioId, otroUsuarioId) {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidPattern.test(String(usuarioId || ""))) throw badRequest("La sesión no es válida.");
  if (otroUsuarioId && (!uuidPattern.test(String(otroUsuarioId)) || String(otroUsuarioId).toLowerCase() === String(usuarioId).toLowerCase())) {
    throw badRequest("La conversación seleccionada no es válida.");
  }
  const filter = otroUsuarioId
    ? `and(remitente_id.eq.${usuarioId},destinatario_id.eq.${otroUsuarioId}),and(remitente_id.eq.${otroUsuarioId},destinatario_id.eq.${usuarioId})`
    : `remitente_id.eq.${usuarioId},destinatario_id.eq.${usuarioId}`;
  const { data, error } = await supabase.from("mensajes").select("id, remitente_id, destinatario_id, contenido, tipo, audio_path, duration_seconds, attachments, leido, created_at").or(filter).order("created_at", { ascending: true });
  if (error) throw error;
  return Promise.all((data || []).map(async message => {
    const { audio_path, ...safeMessage } = message;
    const attachments = await Promise.all((message.attachments || []).map(async file => ({
      name: file.name,
      mime: file.mime,
      size: file.size,
      url: await getSignedPrivateUrl(MESSAGE_FILES_BUCKET, file.path),
    })));
    const { attachments: _storedAttachments, ...safeMessageWithoutPaths } = safeMessage;
    const audioUrl = message.tipo === "audio" && audio_path
      ? await getSignedPrivateUrl(AUDIO_BUCKET, audio_path)
      : null;
    return { ...safeMessageWithoutPaths, audio_url: audioUrl, attachments };
  }));
}

async function getSignedPrivateUrl(bucket, path) {
  const key = `${bucket}:${path}`;
  const cached = signedAudioUrlCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.url;
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 900);
  if (error) throw error;
  signedAudioUrlCache.set(key, { url: data.signedUrl, expiresAt: Date.now() + 840_000 });
  if (signedAudioUrlCache.size > 500) {
    for (const [cachedPath, value] of signedAudioUrlCache) {
      if (value.expiresAt <= Date.now()) signedAudioUrlCache.delete(cachedPath);
    }
  }
  return data.signedUrl;
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
    .select("id, remitente_id, destinatario_id, contenido, tipo, leido, created_at")
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
