import { NextResponse } from "next/server";
import { haySesion } from "@/lib/auth";

// Indica si hay sesión válida. No devuelve el token ni ningún dato secreto.
export async function GET() {
  return NextResponse.json({ autenticado: await haySesion() }, { headers: { "Cache-Control": "no-store" } });
}
