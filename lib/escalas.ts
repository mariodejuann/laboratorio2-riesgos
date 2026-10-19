// Escalas didácticas del laboratorio (docs/evaluacion-riesgos.md).
// No se atribuyen a ENS ni a NIST.

export type Nivel = "bajo" | "medio" | "alto";

export const PROBABILIDAD = [
  { valor: 1, nombre: "Baja", descriptor: "Existen razones justificadas para considerar poco probable el evento." },
  { valor: 2, nombre: "Media", descriptor: "El evento es plausible y las condiciones disponibles no permiten considerarlo poco probable." },
  { valor: 3, nombre: "Alta", descriptor: "Hay indicios concretos de que el evento es probable durante la campaña." },
] as const;

export const IMPACTO = [
  { valor: 1, nombre: "Menor", descriptor: "Incidencia limitada, sin comprometer el plazo ni perder registros confirmados." },
  { valor: 2, nombre: "Significativo", descriptor: "Interrupción o trabajo de recuperación relevante, pero el objetivo todavía puede alcanzarse." },
  { valor: 3, nombre: "Grave", descriptor: "Impide completar solicitudes en plazo o provoca pérdida no recuperable de registros confirmados." },
] as const;

export const CLASIFICACION = [
  { nivel: "bajo", rango: "1–2" },
  { nivel: "medio", rango: "3–4" },
  { nivel: "alto", rango: "6–9" },
] as const;
