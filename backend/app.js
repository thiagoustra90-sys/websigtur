import path from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRutas from "./rutas/auth_rutas.js";
import mapaRutas from "./rutas/rutas_mapa.js";
import companiasRutas from "./rutas/rutas_companias.js";
import eventosRutas from "./rutas/rutas_eventos.js";
import interaccionesRutas, {
  likesRouter,
  guardadosRouter,
  mensajesRouter,
} from "./rutas/rutas_interacciones.js";
import adminRutas from "./rutas/rutas_admin.js";
import soporteRutas from "./rutas/rutas_soporte.js";
import publicasRutas from "./rutas/rutas_publicas.js";
import reservasRutas from "./rutas/rutas_reservas.js";
import { errorMiddleware } from "./servicios/errores.js";
import { validarConfiguracionInicio } from "./servicios/configuracion.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendDir = path.resolve(__dirname, "../frontend");
const htmlDir = path.join(frontendDir, "html");
const app = express();

app.disable("x-powered-by");
app.use((req, res, next) => {
  const started = process.hrtime.bigint();
  res.on("finish", () => {
    const elapsedMs = Number(process.hrtime.bigint() - started) / 1e6;
    if (req.originalUrl.startsWith("/api/") || elapsedMs > 500) {
      console.log(
        JSON.stringify({
          level: "http",
          timestamp: new Date().toISOString(),
          method: req.method,
          path: req.originalUrl,
          status: res.statusCode,
          durationMs: Math.round(elapsedMs),
        }),
      );
    }
  });
  next();
});
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
  }),
);

const production = process.env.NODE_ENV === "production";
const allowedOrigins = new Set(
  (process.env.ALLOWED_ORIGINS || process.env.FRONTEND_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean),
);

if (!production) {
  allowedOrigins.add("http://localhost");
  allowedOrigins.add("http://localhost:80");
  allowedOrigins.add("http://127.0.0.1");
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin.replace(/\/$/, ""))) return callback(null, true);
      return callback(Object.assign(new Error("Origin no permitido."), { status: 403 }));
    },
    credentials: false,
  }),
);
app.use(express.json({ limit: "2mb", strict: true }));
app.use(express.urlencoded({ extended: false, limit: "2mb" }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: production ? 30 : 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error: "Demasiados intentos. Esperá unos minutos antes de volver a intentar.",
  },
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: production ? 120 : 600,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error: "Demasiadas solicitudes. Intentá nuevamente en un minuto.",
  },
});

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/refresh", authLimiter);
app.use("/api/auth/recuperar", authLimiter);
app.use("/api/admin", apiLimiter);
app.use("/api/mensajes", apiLimiter);
app.use("/api/soporte", apiLimiter);
app.use("/api/reservas", apiLimiter);

// Evitar que se intenten abrir páginas PHP antiguas.
app.use((req, res, next) => {
  if (/\.php$/i.test(req.path)) {
    return res.status(404).json({
      error: "Esta página PHP no está disponible desde este servidor.",
      code: "NOT_FOUND",
    });
  }
  next();
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/ready", (req, res) => {
  res.json({ status: "ready", timestamp: new Date().toISOString() });
});

// Rutas de la API.
app.use("/api/auth", authRutas);
app.use("/api/soporte", soporteRutas);
app.use("/api/reservas", reservasRutas);
app.use("/api/public", publicasRutas);
app.use("/mapa", mapaRutas);
app.use("/api/mapa", mapaRutas);
app.use("/api/companias", companiasRutas);
app.use("/api/eventos", eventosRutas);
app.use("/api/comentarios", interaccionesRutas);
app.use("/api/likes", likesRouter);
app.use("/api/guardados", guardadosRouter);
app.use("/api/mensajes", mensajesRouter);
app.use("/api/admin", adminRutas);

// Archivos estáticos: CSS, JavaScript e imágenes.
app.use(express.static(frontendDir));
app.use(express.static(htmlDir));

app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada." });
});

app.use(errorMiddleware);

validarConfiguracionInicio();

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor SIGTUR iniciado en el puerto ${PORT}`);
});
