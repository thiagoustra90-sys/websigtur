import * as servicio from "../servicios/foro_servicios.js";

function fail(res, error) { res.status(error.status || (error.code === "PGRST205" ? 503 : 500)).json({ error: error.status ? error.message : error.code === "PGRST205" ? "Ejecutá database/migration_interacciones.sql en Supabase." : "No se pudo completar la operación." }); }
export async function listarComentariosForo(req, res) { try { res.json({ data: await servicio.listarComentariosForo(req.query) }); } catch (error) { fail(res, error); } }
export async function responderComentario(req, res) { try { res.status(201).json(await servicio.responderComentario(req.user.id, req.params.id, req.body.contenido)); } catch (error) { fail(res, error); } }
export async function likeComentario(req, res) { try { res.json(await servicio.cambiarLikeComentario(req.user.id, req.params.id, Boolean(req.body.activo))); } catch (error) { fail(res, error); } }
export async function estadoLikeComentario(req, res) { try { res.json(await servicio.estadoLikeComentario(req.user?.id, req.params.id)); } catch (error) { fail(res, error); } }
export async function subirAudioMensaje(req, res) { try { res.status(201).json(await servicio.subirAudioMensaje(req.user.id, req.headers["content-type"], req.body)); } catch (error) { fail(res, error); } }
export async function enviarMensaje(req, res) { try { res.status(201).json(await servicio.enviarMensaje(req.user.id, req.body.destinatario_id, req.body.contenido, req.body)); } catch (error) { fail(res, error); } }
export async function subirAdjuntoMensaje(req, res) { try { res.status(201).json(await servicio.subirAdjuntoMensaje(req.user.id, req.headers["content-type"], req.body)); } catch (error) { fail(res, error); } }
export async function listarMensajes(req, res) { try { res.json({ data: await servicio.listarMensajes(req.user.id, req.query.usuario_id) }); } catch (error) { fail(res, error); } }
export async function listarUsuariosParaMensajes(req, res) { try { res.json({ data: await servicio.listarUsuariosParaMensajes(req.user.id) }); } catch (error) { fail(res, error); } }
export async function marcarMensajesLeidos(req, res) { try { res.json(await servicio.marcarMensajesComoLeidos(req.user.id, req.body?.usuario_id)); } catch (error) { fail(res, error); } }
export async function listarConversaciones(req, res) { try { res.json({ data: await servicio.listarConversaciones(req.user.id) }); } catch (error) { fail(res, error); } }