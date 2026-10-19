import "server-only";
import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

// Autenticación sencilla de una persona administradora.
// - La contraseña nunca se guarda: solo su hash scrypt en ADMIN_PASSWORD_HASH.
// - La sesión es una cookie httpOnly firmada con HMAC-SHA256 (SESSION_SECRET).
// Ninguno de estos valores se envía al navegador ni se registra (SEG-02).

export const COOKIE = "sesion";
const DURACION_S = 8 * 60 * 60; // 8 horas

function secreto(): Buffer {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET ausente o demasiado corto");
  return Buffer.from(s, "utf8");
}

/** Formato: scrypt$<sal hex>$<hash hex> (generado con scripts/hash-password.mjs). */
export function verificarContrasena(contrasena: string, almacenado = process.env.ADMIN_PASSWORD_HASH): boolean {
  if (!almacenado) return false;
  const partes = almacenado.split("$");
  if (partes.length !== 3 || partes[0] !== "scrypt") return false;
  const sal = Buffer.from(partes[1], "hex");
  const esperado = Buffer.from(partes[2], "hex");
  if (sal.length < 16 || esperado.length !== 64) return false;
  const calculado = scryptSync(contrasena, sal, 64);
  return timingSafeEqual(calculado, esperado);
}

function firmar(datos: string): string {
  return createHmac("sha256", secreto()).update(datos).digest("base64url");
}

export function crearToken(ahora = Date.now()): string {
  const expira = ahora + DURACION_S * 1000;
  const datos = `admin.${expira}`;
  return `${datos}.${firmar(datos)}`;
}

export function tokenValido(token: string | undefined, ahora = Date.now()): boolean {
  if (!token) return false;
  const partes = token.split(".");
  if (partes.length !== 3 || partes[0] !== "admin") return false;
  const expira = Number(partes[1]);
  if (!Number.isFinite(expira) || expira < ahora) return false;
  const esperado = Buffer.from(firmar(`${partes[0]}.${partes[1]}`));
  const recibido = Buffer.from(partes[2]);
  return esperado.length === recibido.length && timingSafeEqual(esperado, recibido);
}

export async function haySesion(): Promise<boolean> {
  try {
    const almacen = await cookies();
    return tokenValido(almacen.get(COOKIE)?.value);
  } catch {
    return false;
  }
}

export async function iniciarSesion(): Promise<void> {
  const almacen = await cookies();
  almacen.set(COOKIE, crearToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: DURACION_S,
  });
}

export async function cerrarSesion(): Promise<void> {
  const almacen = await cookies();
  almacen.delete(COOKIE);
}

// Limitación de intentos fallidos por IP. En Vercel la memoria es por instancia,
// así que es una protección básica, no una garantía (documentado en docs).
const INTENTOS_MAX = 5;
const VENTANA_MS = 15 * 60 * 1000;
const fallos = new Map<string, { n: number; desde: number }>();

export function bloqueado(ip: string, ahora = Date.now()): boolean {
  const f = fallos.get(ip);
  if (!f) return false;
  if (ahora - f.desde > VENTANA_MS) {
    fallos.delete(ip);
    return false;
  }
  return f.n >= INTENTOS_MAX;
}

export function registrarFallo(ip: string, ahora = Date.now()): void {
  const f = fallos.get(ip);
  if (!f || ahora - f.desde > VENTANA_MS) fallos.set(ip, { n: 1, desde: ahora });
  else f.n += 1;
}

export function limpiarFallos(ip: string): void {
  fallos.delete(ip);
}
