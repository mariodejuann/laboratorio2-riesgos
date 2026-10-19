import { NextResponse } from "next/server";
import { error, origenPermitido } from "@/lib/api";
import { cerrarSesion } from "@/lib/auth";

export async function POST(req: Request) {
  if (!origenPermitido(req)) return error(403, "Origen no permitido.");
  await cerrarSesion();
  return NextResponse.json({ ok: true });
}
