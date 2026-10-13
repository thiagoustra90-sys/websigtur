import * as servicio from "../servicios/interacciones_servicios.js";

function error(res, problem) {
	const missingTables = problem?.code === 'PGRST205';
	res.status(problem.status || (missingTables ? 503 : 500)).json({
		error: missingTables ? 'Faltan las tablas de interacciones. Ejecutá database/migration_interacciones.sql en Supabase.' : problem.status ? problem.message : 'No se pudo completar la operación.'
	});
}
export async function comentarios(req, res) { try { res.json({ data: await servicio.listarComentarios(req.query) }); } catch (problem) { error(res, problem); } }
export async function crearComentario(req, res) { try { res.status(201).json(await servicio.crearComentario(req.user.id, req.body, req.body.contenido)); } catch (problem) { error(res, problem); } }
export async function editarComentario(req, res) { try { res.json(await servicio.editarComentario(req.user.id, req.params.id, req.body.contenido)); } catch (problem) { error(res, problem); } }
export async function eliminarComentario(req, res) { try { await servicio.eliminarComentario(req.user.id, req.params.id); res.status(204).end(); } catch (problem) { error(res, problem); } }
export async function reportarComentario(req, res) { try { res.status(201).json(await servicio.reportarComentario(req.user.id, req.params.id, req.body.motivo)); } catch (problem) { error(res, problem); } }
export async function estado(req, res) { try { res.json(await servicio.estadoInteracciones(req.user?.id, req.query)); } catch (problem) { error(res, problem); } }
export async function like(req, res) { try { res.json(await servicio.cambiarLike(req.user.id, req.body, Boolean(req.body.activo))); } catch (problem) { error(res, problem); } }
export async function guardado(req, res) { try { res.json(await servicio.cambiarGuardado(req.user.id, req.body, Boolean(req.body.activo))); } catch (problem) { error(res, problem); } }
export async function listarGuardados(req, res) { try { res.json({ data: await servicio.listarGuardados(req.user.id) }); } catch (problem) { error(res, problem); } }