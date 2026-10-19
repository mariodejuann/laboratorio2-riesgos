import { NextResponse } from "next/server";
import { error, ipCliente, leerJson, origenPermitido } from "@/lib/api";
import { bloqueado, iniciarSesion, limpiarFallos, registrarFallo, verificarContrasena } from "@/lib/auth";


export async function POST(req: Request) {
  if (!origenPermitido(req)) return error(403, "Origen no permitido.");
  const ip = ipCliente(req);
  if (bloqueado(ip)) return error(429, "Demasiados intentos. Espera unos minutos.");
  const leido = await leerJson(req);
  if (!leido.ok) return leido.respuesta;
  const c = (leido.cuerpo as { contrasena?: unknown })?.contrasena;
  if (typeof c !== "string" || c.length === 0 || c.length > 200) {
    registrarFallo(ip);
    return error(401, "Credenciales incorrectas.");
  }
  let ok = false;
  try {
    ok = verificarContrasena(c);
  } catch {
    ok = false;
  }
  if (!ok) {
    registrarFallo(ip);
    return error(401, "Credenciales incorrectas.");
  }
  try {
    await iniciarSesion();
  } catch {
    console.error("[POST /api/login] configuración de sesión incompleta");
    return error(503, "Servicio no disponible.");
  }
  limpiarFallos(ip);
  return NextResponse.json({ ok: true });
}
