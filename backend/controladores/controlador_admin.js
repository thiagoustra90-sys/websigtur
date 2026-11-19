import * as servicio from "../servicios/admin_servicios.js";
import {
  eliminarComentarioAdmin,
  fijarComentarioAdmin,
  listarComentariosAdmin,
} from "../servicios/foro_servicios.js";

function gestionarFallo(res, fallo) {
  res.status(fallo.status || (fallo.code === "PGRST205" ? 503 : 500)).json({
    error: fallo.status
      ? fallo.message
      : fallo.code === "PGRST205"
        ? "La tabla events no existe en Supabase."
        : "No se pudo completar la operación de administrador.",
  });
}
export async function crearEvento(req, res) {
  try {
    const evento = await servicio.crearEvento(req.validatedBody || req.body);
    await servicio.registrarActividad(req.user.id, "event.created", {
      eventId: evento.id,
      title: evento.title,
    });
    res.status(201).json(evento);
  } catch (error) {
    gestionarFallo(res, error);
  }
}
export async function listarEventos(req, res) {
  try {
    res.json(await servicio.listarEventosAdmin(req.query));
  } catch (error) {
    gestionarFallo(res, error);
  }
}
export async function actualizarEvento(req, res) {
  try {
    const evento = await servicio.actualizarEvento(req.params.id, req.validatedBody || req.body);
    await servicio.registrarActividad(req.user.id, "event.updated", {
      eventId: evento.id,
      title: evento.title,
    });
    res.json(evento);
  } catch (error) {
    gestionarFallo(res, error);
  }
}
export async function listarUsuarios(req, res) {
  try {
    res.json(await servicio.listarUsuarios(req.query));
  } catch (error) {
    gestionarFallo(res, error);
  }
}
export async function banearUsuario(req, res) {
  try {
    const result = await servicio.cambiarBaneo(req.params.id, req.body.duration);
    await servicio.registrarActividad(req.user.id, "user.ban.changed", {
      userId: req.params.id,
      duration: req.body.duration,
    });
    res.json(result);
  } catch (error) {
    gestionarFallo(res, error);
  }
}
export async function eliminarEvento(req, res) {
  try {
    await servicio.eliminarEvento(req.params.id);
    await servicio.registrarActividad(req.user.id, "event.deleted", { eventId: req.params.id });
    res.status(204).end();
  } catch (error) {
    gestionarFallo(res, error);
  }
}
export async function eliminarComentario(req, res) {
  try {
    await eliminarComentarioAdmin(req.params.id);
    await servicio.registrarActividad(req.user.id, "comment.deleted", { commentId: req.params.id });
    res.status(204).end();
  } catch (error) {
    gestionarFallo(res, error);
  }
}
export async function listarComentarios(req, res) {
  try {
    res.json(await listarComentariosAdmin(req.query));
  } catch (error) {
    gestionarFallo(res, error);
  }
}
export async function fijarComentario(req, res) {
  try {
    const result = await fijarComentarioAdmin(req.params.id, req.body.fijado);
    await servicio.registrarActividad(req.user.id, "comment.pin.changed", {
      commentId: req.params.id,
      pinned: Boolean(req.body.fijado),
    });
    res.json(result);
  } catch (error) {
    gestionarFallo(res, error);
  }
}
export async function metricas(req, res) {
  try {
    res.json(await servicio.obtenerMetricas());
  } catch (error) {
    gestionarFallo(res, error);
  }
}
export async function configuracion(req, res) {
  try {
    if (req.method === "GET") return res.json(await servicio.leerConfiguracion());
    res.json(await servicio.guardarConfiguracion(req.body, req.user.id));
  } catch (error) {
    gestionarFallo(res, error);
  }
}
export async function aviso(req, res) {
  try {
    if (req.method === "GET") return res.json({ data: await servicio.leerAviso() });
    if (req.method === "DELETE") {
      await servicio.borrarAviso(req.user.id);
      return res.status(204).end();
    }
    res.json({ data: await servicio.guardarAviso(req.body, req.user.id) });
  } catch (error) {
    gestionarFallo(res, error);
  }
}
export async function actividad(req, res) {
  try {
    res.json(await servicio.listarActividad(req.query));
  } catch (error) {
    gestionarFallo(res, error);
  }
}
export async function registrarActividad(req, res) {
  try {
    const action = String(req.body.action || "admin.action").slice(0, 100);
    await servicio.registrarActividad(req.user.id, action, req.body.details || {});
    res.status(201).json({ ok: true });
  } catch (error) {
    gestionarFallo(res, error);
  }
}
export async function tickets(req, res) {
  try {
    res.json(await servicio.listarTickets(req.query));
  } catch (error) {
    gestionarFallo(res, error);
  }
}
export async function estadoTicket(req, res) {
  try {
    res.json(await servicio.cambiarEstadoTicket(req.params.id, req.body.status, req.user.id));
  } catch (error) {
    gestionarFallo(res, error);
  }
}
