import { ZodError } from "zod";

export function crearErrorHttp(estado, mensaje, codigo = "HTTP_ERROR", detalles) {
  const fallo = new Error(mensaje);
  fallo.status = estado;
  fallo.code = codigo;
  if (detalles !== undefined) fallo.details = detalles;
  return fallo;
}

export function recursoNoEncontrado(mensaje = "Recurso no encontrado.") {
  return crearErrorHttp(404, mensaje, "NOT_FOUND");
}

export function solicitudInvalida(mensaje = "Solicitud inválida.", detalles) {
  return crearErrorHttp(400, mensaje, "BAD_REQUEST", detalles);
}

export function envolverControladorAsync(controlador) {
  return (req, res, next) => Promise.resolve(controlador(req, res, next)).catch(next);
}

export function gestionarErrorHttp(fallo, req, res, next) {
  if (res.headersSent) return next(fallo);

  if (fallo instanceof ZodError) {
    return res.status(400).json({
      error: "Los datos enviados no son válidos.",
      code: "VALIDATION_ERROR",
      details: fallo.issues.map((incidencia) => ({
        field: incidencia.path.join(".") || "body",
        message: incidencia.message,
      })),
    });
  }

  if (fallo.type === "entity.too.large") {
    return res.status(413).json({
      error: "El cuerpo de la solicitud es demasiado grande.",
      code: "PAYLOAD_TOO_LARGE",
    });
  }

  if (fallo instanceof SyntaxError && fallo.status === 400) {
    return res.status(400).json({ error: "JSON inválido.", code: "INVALID_JSON" });
  }

  const estado = Number.isInteger(fallo.status)
    ? fallo.status
    : fallo.code === "PGRST205"
      ? 503
      : 500;

  if (estado >= 500) {
    console.error(
      JSON.stringify({
        level: "error",
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.originalUrl,
        code: fallo.code || "INTERNAL_ERROR",
        message: fallo.message,
      }),
    );
  }

  res.status(estado).json({
    error: estado >= 500 ? "Ocurrió un error interno. Intentá nuevamente." : fallo.message,
    code: fallo.code || (estado === 503 ? "SERVICE_UNAVAILABLE" : "HTTP_ERROR"),
    ...(fallo.details ? { details: fallo.details } : {}),
  });
}

// Alias de compatibilidad temporal para imports antiguos.
export {
  crearErrorHttp as httpError,
  recursoNoEncontrado as notFound,
  solicitudInvalida as badRequest,
  envolverControladorAsync as asyncHandler,
  gestionarErrorHttp as errorMiddleware,
};
