import "dotenv/config";
import express from "express";
import cors from "cors";
import supabase from "./config/supabase.js";

import authRutas from "./rutas/auth rutas.js";
import mapaRutas from "./rutas/rutas mapa.js";
import companiasRutas from "./rutas/rutas companias.js";
import eventosRutas from "./rutas/rutas eventos.js";
import interaccionesRutas, { likesRouter, guardadosRouter, mensajesRouter } from "./rutas/rutas interacciones.js";
import adminRutas from "./rutas/rutas admin.js";

const app = express();

const configuredFrontendOrigins = (process.env.FRONTEND_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const developmentOrigins = process.env.NODE_ENV === "production"
  ? []
  : ["http://localhost", "http://127.0.0.1", /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/];
const allowedOrigins = [...configuredFrontendOrigins, ...developmentOrigins];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      const allowed = allowedOrigins.some((entry) =>
        entry instanceof RegExp ? entry.test(origin) : entry === origin
      );
      callback(null, allowed);
    },
  })
);
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => res.json({ status: "ok" }));

// Rutas de la app
app.use("/api/auth", authRutas);
app.use("/mapa", mapaRutas); // compatibilidad con frontend/html/mapa.php (fetch a /mapa)
app.use("/api/mapa", mapaRutas);
app.use("/api/companias", companiasRutas);
app.use("/api/eventos", eventosRutas);
app.use("/api/comentarios", interaccionesRutas);
app.use("/api/likes", likesRouter);
app.use("/api/guardados", guardadosRouter);
app.use("/api/mensajes", mensajesRouter);
app.use("/api/admin", adminRutas);

app.get("/", async (req, res) => {
  const { data, error } = await supabase.from("busines").select("*");
  if (error) return res.status(500).json(error);
  res.json(data);
});

app.use((req, res) => res.status(404).json({ error: "Ruta no encontrada." }));

const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Servidor iniciado en el puerto ${port}`);
});
