import { NextResponse, connection } from "next/server";
import { fallo } from "@/lib/api";
import { contarPorNivel } from "@/lib/db";


// Público: solo recuentos agregados por nivel, sin el contenido de los registros.
export async function GET() {
  await connection(); // siempre en tiempo de petición, nunca en la compilación
  try {
    return NextResponse.json({ niveles: await contarPorNivel() });
  } catch (e) {
    return fallo("GET /api/resumen", e);
  }
}
