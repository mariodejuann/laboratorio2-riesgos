import "server-only";
import { NextResponse } from "next/server";
import { ConfiguracionError } from "./db";

const TAM_MAX = 16 * 1024; // 16 KB

/** Respuesta de error pública: mensaje genérico, sin detalles internos (SEG-07). */
export function error(estado: number, mensaje: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: mensaje, ...extra }, { status: estado });
}

/** Registra en el servidor solo el tipo y el código del error, nunca valores secretos. */
export function fallo(contexto: string, e: unknown) {
  const codigo = (e as { code?: string })?.code;
  const tipo = e instanceof Error ? e.constructor.name : typeof e;
  console.error(`[${contexto}] ${tipo}${codigo ? ` código=${codigo}` : ""}`);
  if (e instanceof ConfiguracionError) return error(503, "Servicio no disponible.");
  return error(500, "No se pudo completar la operación.");
}

/** Lee un cuerpo JSON con límite de tamaño y tipo de contenido obligatorio. */
export async function leerJson(req: Request): Promise<{ ok: true; cuerpo: unknown } | { ok: false; respuesta: NextResponse }> {
  if (!(req.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json")) {
    return { ok: false, respuesta: error(415, "Se requiere application/json.") };
  }
  const texto = await req.text();
  if (texto.length > TAM_MAX) return { ok: false, respuesta: error(413, "Petición demasiado grande.") };
  try {
    return { ok: true, cuerpo: JSON.parse(texto) };
  } catch {
    return { ok: false, respuesta: error(400, "JSON no válido.") };
  }
}

/** Rechaza peticiones de escritura desde otro origen (defensa adicional a SameSite). */
export function origenPermitido(req: Request): boolean {
  const origen = req.headers.get("origin");
  if (!origen) return true; // peticiones sin navegador (curl); siguen necesitando sesión
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    return new URL(origen).host === host;
  } catch {
    return false;
  }
}

export function ipCliente(req: Request): string {
  return (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "local";
}
