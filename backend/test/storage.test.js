import test from "node:test";
import assert from "node:assert/strict";

process.env.SUPABASE_URL ||= "https://example.supabase.co";
process.env.SUPABASE_SERVICE_KEY ||= "test-service-role-key";
const { validarMediaPaths } = await import("../servicios/interacciones_servicios.js");

const owner = "123e4567-e89b-42d3-a456-426614174000";

test("acepta adjuntos de comentario bajo el directorio del usuario", () => {
  const media = `${owner}/123e4567-e89b-42d3-a456-426614174001.webp`;
  assert.deepEqual(validarMediaPaths(owner, [media]), [media]);
});

test("rechaza rutas ajenas, extensiones no admitidas y más de tres adjuntos", () => {
  assert.throws(() => validarMediaPaths(owner, ["otro/archivo.webp"]), { status: 400 });
  assert.throws(() => validarMediaPaths(owner, [`${owner}/archivo.svg`]), { status: 400 });
  assert.throws(() => validarMediaPaths(owner, ["a.webp", "b.webp", "c.webp", "d.webp"]), {
    status: 400,
  });
});
