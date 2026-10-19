import "server-only";
import { Pool } from "pg";
import type { Nivel } from "./escalas";
import { clasificar } from "./scoring";
import type { RiesgoValido } from "./validacion";

// La cadena de conexión solo existe en el servidor (SEG-02). Nunca se registra.
let pool: Pool | null = null;

export class ConfiguracionError extends Error {}

function obtenerPool(): Pool {
  const url = process.env.DATABASE_URL;
  if (!url) throw new ConfiguracionError("Falta DATABASE_URL");
  if (!pool) pool = new Pool({ connectionString: url, max: 3, idleTimeoutMillis: 10_000 });
  return pool;
}

export type Riesgo = RiesgoValido & {
  id: string;
  puntuacion: number;
  nivel: Nivel;
  creadoEn: string;
  actualizadoEn: string;
};

const COLUMNAS: [keyof RiesgoValido, string][] = [
  ["proceso", "proceso"],
  ["activo", "activo"],
  ["objetivo", "objetivo"],
  ["condicion", "condicion"],
  ["amenaza", "amenaza"],
  ["evento", "evento"],
  ["consecuencia", "consecuencia"],
  ["supuesto", "supuesto"],
  ["probabilidad", "probabilidad"],
  ["justificacionProbabilidad", "justificacion_probabilidad"],
  ["impacto", "impacto"],
  ["justificacionImpacto", "justificacion_impacto"],
  ["medidaDescripcion", "medida_descripcion"],
  ["medidaPrioridad", "medida_prioridad"],
  ["medidaResponsable", "medida_responsable"],
  ["medidaVerificacion", "medida_verificacion"],
  ["medidaEstado", "medida_estado"],
];

const SELECT = `SELECT id, ${COLUMNAS.map(([, c]) => c).join(", ")}, puntuacion, creado_en, actualizado_en FROM riesgos`;

function aRiesgo(fila: Record<string, unknown>): Riesgo {
  const r: Record<string, unknown> = { id: fila.id };
  for (const [prop, col] of COLUMNAS) r[prop] = fila[col];
  const puntuacion = Number(fila.puntuacion);
  r.puntuacion = puntuacion;
  r.nivel = clasificar(puntuacion);
  r.creadoEn = new Date(fila.creado_en as string).toISOString();
  r.actualizadoEn = new Date(fila.actualizado_en as string).toISOString();
  return r as Riesgo;
}

// Todas las consultas son parametrizadas: los textos nunca se concatenan en el SQL.
export async function listarRiesgos(): Promise<Riesgo[]> {
  const { rows } = await obtenerPool().query(`${SELECT} ORDER BY puntuacion DESC, creado_en ASC`);
  return rows.map(aRiesgo);
}

export async function crearRiesgo(d: RiesgoValido): Promise<Riesgo> {
  const cols = COLUMNAS.map(([, c]) => c);
  const vals = COLUMNAS.map(([p]) => d[p]);
  const marcas = cols.map((_, i) => `$${i + 1}`).join(", ");
  const { rows } = await obtenerPool().query(
    `INSERT INTO riesgos (${cols.join(", ")}) VALUES (${marcas}) RETURNING id, ${cols.join(", ")}, puntuacion, creado_en, actualizado_en`,
    vals,
  );
  return aRiesgo(rows[0]);
}

export async function actualizarRiesgo(id: string, d: RiesgoValido): Promise<Riesgo | null> {
  const asignaciones = COLUMNAS.map(([, c], i) => `${c} = $${i + 2}`).join(", ");
  const vals = [id, ...COLUMNAS.map(([p]) => d[p])];
  const { rows } = await obtenerPool().query(
    `UPDATE riesgos SET ${asignaciones}, actualizado_en = now() WHERE id = $1 RETURNING id, ${COLUMNAS.map(([, c]) => c).join(", ")}, puntuacion, creado_en, actualizado_en`,
    vals,
  );
  return rows[0] ? aRiesgo(rows[0]) : null;
}

export async function borrarRiesgo(id: string): Promise<boolean> {
  const { rowCount } = await obtenerPool().query("DELETE FROM riesgos WHERE id = $1", [id]);
  return (rowCount ?? 0) > 0;
}

export async function contarPorNivel(): Promise<Record<Nivel, number>> {
  const { rows } = await obtenerPool().query(
    `SELECT CASE WHEN puntuacion <= 2 THEN 'bajo' WHEN puntuacion <= 4 THEN 'medio' ELSE 'alto' END AS nivel,
            count(*)::int AS total
       FROM riesgos GROUP BY 1`,
  );
  const r: Record<Nivel, number> = { bajo: 0, medio: 0, alto: 0 };
  for (const f of rows) r[f.nivel as Nivel] = f.total;
  return r;
}
