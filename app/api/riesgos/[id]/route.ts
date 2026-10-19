import { NextResponse } from "next/server";
import { error, fallo, leerJson, origenPermitido } from "@/lib/api";
import { haySesion } from "@/lib/auth";
import { actualizarRiesgo, borrarRiesgo } from "@/lib/db";
import { esUuid, validarRiesgo } from "@/lib/validacion";


type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  if (!origenPermitido(req)) return error(403, "Origen no permitido.");
  if (!(await haySesion())) return error(401, "Autenticación requerida.");
  const { id } = await params;
  if (!esUuid(id)) return error(400, "Identificador no válido.");
  const leido = await leerJson(req);
  if (!leido.ok) return leido.respuesta;
  const v = validarRiesgo(leido.cuerpo);
  if (!v.ok) return error(400, "Datos no válidos.", { campos: v.errores });
  try {
    const r = await actualizarRiesgo(id, v.datos);
    return r ? NextResponse.json({ riesgo: r }) : error(404, "No encontrado.");
  } catch (e) {
    return fallo("PUT /api/riesgos/[id]", e);
  }
}

export async function DELETE(req: Request, { params }: Ctx) {
  if (!origenPermitido(req)) return error(403, "Origen no permitido.");
  if (!(await haySesion())) return error(401, "Autenticación requerida.");
  const { id } = await params;
  if (!esUuid(id)) return error(400, "Identificador no válido.");
  try {
    return (await borrarRiesgo(id)) ? new NextResponse(null, { status: 204 }) : error(404, "No encontrado.");
  } catch (e) {
    return fallo("DELETE /api/riesgos/[id]", e);
  }
}
