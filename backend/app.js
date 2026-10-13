import path from "node:path";
import { fileURLToPath } from "node:url";
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendDir = path.resolve(__dirname, "../frontend");

// Servir archivos estáticos del frontend
app.use(express.static(frontendDir));

// Página principal de SIGTUR
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendDir, "html", "index.html"));
});
// El front vive en XAMPP (http://localhost/sigtur2026-premiere/...) y el
// backend en http://localhost:3000: son orígenes distintos, así que sin
// CORS el navegador bloquea todos los fetch() del mapa y del login.
app.use(
  cors({
    origin: [
      "http://localhost",
      "http://localhost:80",
      "http://127.0.0.1",
      /^http:\/\/localhost:\d+$/,
    ],
  })
);
app.use(express.json({ limit: "2mb" }));

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

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor SIGTUR iniciado en el puerto ${PORT}`);
});