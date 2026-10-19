import { NextResponse } from "next/server";
import { error, fallo, leerJson, origenPermitido } from "@/lib/api";
import { haySesion } from "@/lib/auth";
import { crearRiesgo, listarRiesgos } from "@/lib/db";
import { validarRiesgo } from "@/lib/validacion";


// GET: detalle de los registros, solo con sesión.
export async function GET() {
  if (!(await haySesion())) return error(401, "Autenticación requerida.");
  try {
    return NextResponse.json({ riesgos: await listarRiesgos() });
  } catch (e) {
    return fallo("GET /api/riesgos", e);
  }
}

// POST: crear. Autorización comprobada en el servidor (SEG-03) y validación (SEG-05).
export async function POST(req: Request) {
  if (!origenPermitido(req)) return error(403, "Origen no permitido.");
  if (!(await haySesion())) return error(401, "Autenticación requerida.");
  const leido = await leerJson(req);
  if (!leido.ok) return leido.respuesta;
  const v = validarRiesgo(leido.cuerpo);
  if (!v.ok) return error(400, "Datos no válidos.", { campos: v.errores });
  try {
    return NextResponse.json({ riesgo: await crearRiesgo(v.datos) }, { status: 201 });
  } catch (e) {
    return fallo("POST /api/riesgos", e);
  }
}
