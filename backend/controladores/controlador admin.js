import * as servicio from '../servicios/admin_servicios.js';
import { eliminarComentarioAdmin, fijarComentarioAdmin, listarComentariosAdmin } from '../servicios/foro_servicios.js';

function fail(res, error) { res.status(error.status || (error.code === 'PGRST205' ? 503 : 500)).json({ error: error.status ? error.message : error.code === 'PGRST205' ? 'La tabla events no existe en Supabase.' : 'No se pudo completar la operación de administrador.' }); }
export async function crearEvento(req, res) { try { res.status(201).json(await servicio.crearEvento(req.body)); } catch (error) { fail(res, error); } }
export async function listarEventos(req, res) { try { res.json({ data: await servicio.listarEventosAdmin() }); } catch (error) { fail(res, error); } }
export async function listarUsuarios(req, res) { try { res.json({ data: await servicio.listarUsuarios() }); } catch (error) { fail(res, error); } }
export async function banearUsuario(req, res) { try { res.json(await servicio.cambiarBaneo(req.params.id, req.body.duration)); } catch (error) { fail(res, error); } }
export async function eliminarEvento(req, res) { try { await servicio.eliminarEvento(req.params.id); res.status(204).end(); } catch (error) { fail(res, error); } }
export async function eliminarComentario(req, res) { try { await eliminarComentarioAdmin(req.params.id); res.status(204).end(); } catch (error) { fail(res, error); } }
export async function listarComentarios(req, res) { try { res.json({ data: await listarComentariosAdmin() }); } catch (error) { fail(res, error); } }
export async function fijarComentario(req, res) { try { res.json(await fijarComentarioAdmin(req.params.id, req.body.fijado)); } catch (error) { fail(res, error); } }
