import path from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";
import express from "express";
import cors from "cors";

import authRutas from "./rutas/auth rutas.js";
import mapaRutas from "./rutas/rutas mapa.js";
import companiasRutas from "./rutas/rutas companias.js";
import eventosRutas from "./rutas/rutas eventos.js";
import interaccionesRutas, {
  likesRouter,
  guardadosRouter,
  mensajesRouter,
} from "./rutas/rutas interacciones.js";
import adminRutas from "./rutas/rutas admin.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendDir = path.resolve(__dirname, "../frontend");
const htmlDir = path.join(frontendDir, "html");

const allowedOrigins = [
  "http://localhost",
  "http://localhost:80",
  "http://127.0.0.1",
  /^http:\/\/localhost:\d+$/,
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: "2mb" }));

// Evitar que se intenten abrir páginas PHP antiguas.
app.use((req, res, next) => {
  if (/\.php$/i.test(req.path)) {
    return res.status(404).json({
      error: "Esta página PHP debe adaptarse para funcionar en Render.",
    });
  }

  next();
});

// Rutas de la API.
app.use("/api/auth", authRutas);

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

// Páginas HTML: index.html, eventos.html, login.html, etc.
app.use(express.static(htmlDir));

// Esta respuesta debe estar al final.
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada." });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor SIGTUR iniciado en el puerto ${PORT}`);
});