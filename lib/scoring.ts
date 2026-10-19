// Cálculo de la puntuación y clasificación (reglas didácticas del laboratorio).
import type { Nivel } from "./escalas";

export type Valor = 1 | 2 | 3;

export function esValor(n: unknown): n is Valor {
  return n === 1 || n === 2 || n === 3;
}

/** Puntuación = probabilidad × impacto. Valores posibles: 1, 2, 3, 4, 6 y 9. */
export function puntuacion(probabilidad: Valor, impacto: Valor): number {
  return probabilidad * impacto;
}

/** Clasificación: bajo 1–2, medio 3–4, alto 6–9. */
export function clasificar(puntos: number): Nivel {
  if (!Number.isInteger(puntos) || puntos < 1 || puntos > 9 || puntos === 5 || puntos === 7 || puntos === 8) {
    throw new RangeError("Puntuación fuera de las reglas del laboratorio");
  }
  if (puntos <= 2) return "bajo";
  if (puntos <= 4) return "medio";
  return "alto";
}
