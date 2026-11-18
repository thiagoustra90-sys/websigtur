import * as servicio from "../servicios/interacciones_servicios.js";

function gestionarFallo(res, fallo) {
  const faltanTablas = fallo?.code === "PGRST205";
  res.status(fallo.status || (faltanTablas ? 503 : 500)).json({
    error: faltanTablas
      ? "Faltan las tablas de interacciones. Ejecutá supabase db push (revisa database/README.md antes si ya existe la base) en Supabase."
      : fallo.status
        ? fallo.message
        : "No se pudo completar la operación.",
  });
}
export async function listarComentarios(req, res) {
  try {
    res.json({ data: await servicio.listarComentarios(req.query) });
  } catch (fallo) {
    gestionarFallo(res, fallo);
  }
}
export async function subirMediaComentario(req, res) {
  try {
    res
      .status(201)
      .json(
        await servicio.subirMediaComentario(req.user.id, req.headers["content-type"], req.body),
      );
  } catch (fallo) {
    gestionarFallo(res, fallo);
  }
}
export async function crearComentario(req, res) {
  try {
    res
      .status(201)
      .json(
        await servicio.crearComentario(
          req.user.id,
          req.body,
          req.body.contenido,
          req.body.media_paths || [],
        ),
      );
  } catch (fallo) {
    gestionarFallo(res, fallo);
  }
}
export async function editarComentario(req, res) {
  try {
    res.json(await servicio.editarComentario(req.user.id, req.params.id, req.body.contenido));
  } catch (fallo) {
    gestionarFallo(res, fallo);
  }
}
export async function eliminarComentario(req, res) {
  try {
    await servicio.eliminarComentario(req.user.id, req.params.id);
    res.status(204).end();
  } catch (fallo) {
    gestionarFallo(res, fallo);
  }
}
export async function reportarComentario(req, res) {
  try {
    res
      .status(201)
      .json(await servicio.reportarComentario(req.user.id, req.params.id, req.body.motivo));
  } catch (fallo) {
    gestionarFallo(res, fallo);
  }
}
export async function obtenerEstadoInteracciones(req, res) {
  try {
    res.json(await servicio.estadoInteracciones(req.user?.id, req.query));
  } catch (fallo) {
    gestionarFallo(res, fallo);
  }
}
export async function cambiarLike(req, res) {
  try {
    res.json(await servicio.cambiarLike(req.user.id, req.body, Boolean(req.body.activo)));
  } catch (fallo) {
    gestionarFallo(res, fallo);
  }
}
export async function cambiarGuardado(req, res) {
  try {
    res.json(await servicio.cambiarGuardado(req.user.id, req.body, Boolean(req.body.activo)));
  } catch (fallo) {
    gestionarFallo(res, fallo);
  }
}
export async function listarGuardados(req, res) {
  try {
    res.json({ data: await servicio.listarGuardados(req.user.id) });
  } catch (fallo) {
    gestionarFallo(res, fallo);
  }
}

// Alias temporales para mantener compatibles las rutas que importan los nombres antiguos.
export {
  listarComentarios as comentarios,
  obtenerEstadoInteracciones as estado,
  cambiarLike as like,
  cambiarGuardado as guardado,
};
