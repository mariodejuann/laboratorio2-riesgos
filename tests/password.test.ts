import { randomBytes, scryptSync } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import { verificarContrasena } from "../lib/password";

const sal = randomBytes(16);
const hex = scryptSync("ContrasenaPrueba123", sal, 64).toString("hex");
const nuevo = `scrypt:${sal.toString("hex")}:${hex}`;
const antiguo = `scrypt$${sal.toString("hex")}$${hex}`;

describe("verificación de contraseña", () => {
  it("acepta la contraseña correcta (formato actual y antiguo)", () => {
    expect(verificarContrasena("ContrasenaPrueba123", nuevo)).toBe(true);
    expect(verificarContrasena("ContrasenaPrueba123", antiguo)).toBe(true);
  });
  it("rechaza contraseñas incorrectas", () => {
    expect(verificarContrasena("otra", nuevo)).toBe(false);
    expect(verificarContrasena("", nuevo)).toBe(false);
  });
  it("rechaza hashes ausentes o mal formados (p. ej. «scrypt» a secas)", () => {
    for (const h of [undefined, "", "scrypt", "scrypt:", "scrypt:abc:def", "md5:aa:bb"]) {
      expect(verificarContrasena("ContrasenaPrueba123", h)).toBe(false);
    }
  });
  it("el formato actual sobrevive a la lectura de .env.local por Next.js", async () => {
    const { loadEnvConfig } = await import("@next/env");
    const fs = await import("node:fs");
    const os = await import("node:os");
    const path = await import("node:path");
    vi.stubEnv("NODE_ENV", "development"); // Next no lee .env.local cuando NODE_ENV=test
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "envtest-"));
    fs.writeFileSync(path.join(dir, ".env.local"), `ADMIN_PASSWORD_HASH=${nuevo}\n`);
    delete process.env.ADMIN_PASSWORD_HASH;
    loadEnvConfig(dir, false, { info() {}, error() {} });
    expect(process.env.ADMIN_PASSWORD_HASH).toBe(nuevo);
    expect(verificarContrasena("ContrasenaPrueba123", process.env.ADMIN_PASSWORD_HASH)).toBe(true);
    fs.rmSync(dir, { recursive: true });
    vi.unstubAllEnvs();
  });
});
