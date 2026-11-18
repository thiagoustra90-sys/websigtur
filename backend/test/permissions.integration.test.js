import test from "node:test";
import assert from "node:assert/strict";
import express from "express";

process.env.SUPABASE_URL ||= "https://example.supabase.co";
process.env.SUPABASE_SERVICE_KEY ||= "test-service-role-key";

const { requiereSesion, requiereAdmin } = await import("../servicios/verificacion.js");

test("protege las rutas privadas y aplica el permiso administrativo", async (t) => {
  const app = express();
  app.get("/privado", requiereSesion, (_req, res) => res.json({ ok: true }));
  app.get(
    "/admin",
    (req, _res, next) => {
      const role = req.get("x-test-role");
      req.authUser = { app_metadata: { role } };
      req.user = { rol: "usuario" };
      next();
    },
    requiereAdmin,
    (_req, res) => res.json({ ok: true }),
  );
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(
    () =>
      new Promise((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      ),
  );
  const base = `http://127.0.0.1:${server.address().port}`;

  const missingSession = await fetch(`${base}/privado`);
  assert.equal(missingSession.status, 401);
  const denied = await fetch(`${base}/admin`, { headers: { "x-test-role": "usuario" } });
  assert.equal(denied.status, 403);
  const allowed = await fetch(`${base}/admin`, { headers: { "x-test-role": "admin" } });
  assert.equal(allowed.status, 200);
  assert.deepEqual(await allowed.json(), { ok: true });
});
