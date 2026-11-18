import test from "node:test";
import assert from "node:assert/strict";
import { loginSchema, registerSchema, refreshSchema } from "../servicios/validacion.js";

test("normaliza correo y datos de registro", () => {
  const user = registerSchema.parse({
    nombre: "  Ana ",
    correo: " ANA@EXAMPLE.COM ",
    password: "password123",
  });

  assert.deepEqual(user, {
    nombre: "Ana",
    apellido: "",
    correo: "ana@example.com",
    password: "password123",
  });
});

test("rechaza contraseñas débiles y propiedades inesperadas", () => {
  assert.equal(
    registerSchema.safeParse({ nombre: "Ana", correo: "ana@example.com", password: "123" }).success,
    false,
  );
  assert.equal(
    loginSchema.safeParse({ correo: "ana@example.com", password: "ok", admin: true }).success,
    false,
  );
});

test("exige un refresh token válido en cualquiera de los formatos admitidos", () => {
  assert.equal(refreshSchema.safeParse({ refreshToken: "x".repeat(24) }).success, true);
  assert.equal(refreshSchema.safeParse({ refresh_token: "x".repeat(24) }).success, true);
  assert.equal(refreshSchema.safeParse({}).success, false);
});
