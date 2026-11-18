import { ZodError } from "zod";

export function httpError(status, message, code = "HTTP_ERROR", details) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  if (details !== undefined) error.details = details;
  return error;
}

export function notFound(message = "Recurso no encontrado.") {
  return httpError(404, message, "NOT_FOUND");
}

export function badRequest(message = "Solicitud inválida.", details) {
  return httpError(400, message, "BAD_REQUEST", details);
}

export function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

export function errorMiddleware(error, req, res, next) {
  if (res.headersSent) return next(error);

  if (error instanceof ZodError) {
    return res.status(400).json({
      error: "Los datos enviados no son válidos.",
      code: "VALIDATION_ERROR",
      details: error.issues.map((issue) => ({
        field: issue.path.join(".") || "body",
        message: issue.message,
      })),
    });
  }

  if (error.type === "entity.too.large") {
    return res.status(413).json({
      error: "El cuerpo de la solicitud es demasiado grande.",
      code: "PAYLOAD_TOO_LARGE",
    });
  }

  if (error instanceof SyntaxError && error.status === 400) {
    return res.status(400).json({ error: "JSON inválido.", code: "INVALID_JSON" });
  }

  const status = Number.isInteger(error.status)
    ? error.status
    : error.code === "PGRST205"
      ? 503
      : 500;

  if (status >= 500) {
    console.error(
      JSON.stringify({
        level: "error",
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.originalUrl,
        code: error.code || "INTERNAL_ERROR",
        message: error.message,
      }),
    );
  }

  res.status(status).json({
    error: status >= 500 ? "Ocurrió un error interno. Intentá nuevamente." : error.message,
    code: error.code || (status === 503 ? "SERVICE_UNAVAILABLE" : "HTTP_ERROR"),
    ...(error.details ? { details: error.details } : {}),
  });
}
