import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  baneoSchema,
  comentarioSchema,
  entidadSchema,
  eventSchema,
  likeSchema,
  mensajeSchema,
  profileSchema,
} from "../servicios/validacion.js";

const raizBackend = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const leerBackend = (ruta) => readFile(path.join(raizBackend, ruta), "utf8");

test("eventos: conserva el cuerpo público actual de creación y edición", () => {
  const evento = eventSchema.parse({
    title: "  Fiesta del Río ",
    description: " Música y gastronomía ",
    date_start: "2026-12-10",
    date_end: "",
    event_time: "18:30",
    location: "Costanera Norte",
    latitude: "-31.383",
    longitude: "-57.964",
    price: "150",
    categories: ["Cultura"],
  });

  assert.equal(evento.title, "Fiesta del Río");
  assert.equal(evento.description, "Música y gastronomía");
  assert.equal(evento.location, "Costanera Norte");
  assert.equal(evento.date_end, null);
  assert.equal(evento.latitude, -31.383);
  assert.equal(evento.price, 150);
  assert.equal(eventSchema.safeParse({ ...evento, campoInesperado: true }).success, false);
});

test("comentarios y likes: conserva los campos públicos y tipos de entidad", () => {
  const comentario = comentarioSchema.parse({
    entidad_tipo: "event",
    entidad_id: "evento-25",
    contenido: "  Muy recomendable  ",
    media_paths: [],
  });
  const like = likeSchema.parse({ entidad_tipo: "place", entidad_id: "lugar-4", activo: true });

  assert.equal(comentario.contenido, "Muy recomendable");
  assert.deepEqual(comentario.media_paths, []);
  assert.equal(like.activo, true);
  assert.equal(entidadSchema.safeParse({ entidad_tipo: "company", entidad_id: "empresa-1" }).success, true);
  assert.equal(entidadSchema.safeParse({ entidad_tipo: "event", entidad_id: "" }).success, false);
});

test("mensajes: conserva destinatario, tipo y metadatos de adjuntos actuales", () => {
  const mensaje = mensajeSchema.parse({
    destinatario_id: "123e4567-e89b-42d3-a456-426614174000",
    contenido: "  Hola  ",
    tipo: "archivo",
    attachments: [{ path: "usuario/archivo.pdf", name: "archivo.pdf", mime: "application/pdf", size: 512 }],
  });

  assert.equal(mensaje.contenido, "Hola");
  assert.equal(mensaje.destinatario_id, "123e4567-e89b-42d3-a456-426614174000");
  assert.equal(mensaje.attachments[0].mime, "application/pdf");
  assert.equal(mensajeSchema.safeParse({ ...mensaje, destinatario_id: "invalido" }).success, false);
});

test("perfil y administración: fija campos editables y duraciones de baneo públicas", async () => {
  const perfil = profileSchema.parse({ nombre: "  Ana  ", biografia: "Turismo", ubicacion: "Salto" });
  assert.equal(perfil.nombre, "Ana");
  assert.equal(perfil.ubicacion, "Salto");
  assert.equal(profileSchema.safeParse({ rol: "admin" }).success, false);
  assert.equal(baneoSchema.safeParse({ duration: "24h" }).success, true);
  assert.equal(baneoSchema.safeParse({ duration: "90d" }).success, false);

  const rutasAdmin = await leerBackend("rutas/rutas_admin.js");
  assert.match(rutasAdmin, /router\.use\(requiereSesion, requiereAdmin\)/);
  assert.match(rutasAdmin, /router\.patch\("\/usuarios\/:id\/baneo"/);
});

test("mapa: mantiene endpoint y estructura pública de puntos", async () => {
  const ruta = await leerBackend("rutas/rutas_mapa.js");
  const controlador = await leerBackend("controladores/controlador_mapa.js");
  assert.match(ruta, /router\.get\("\/", listarPuntos\)/);
  assert.match(controlador, /res\.json\(\{ data: puntos, total: puntos\.length \}\)/);
});

test("chatbot: conserva la función SQL pública usada para recuperar conocimiento", async () => {
  const migracion = await readFile(
    path.join(raizBackend, "..", "supabase", "migrations", "20261117000100_base_turismart.sql"),
    "utf8",
  );
  assert.match(migracion, /FUNCTION public\.match_chatbot_knowledge\(query_embedding VECTOR\(1536\), match_count INT DEFAULT 5\)/);
  assert.match(migracion, /RETURNS TABLE \([\s\S]*similarity DOUBLE PRECISION/);
});
