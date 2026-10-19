import { describe, expect, it } from "vitest";
import { clasificar, esValor, puntuacion, type Valor } from "../lib/scoring";

const valores: Valor[] = [1, 2, 3];

describe("puntuación y clasificación", () => {
  const esperado: Record<string, string> = {
    "1x1": "bajo", "1x2": "bajo", "2x1": "bajo",
    "1x3": "medio", "3x1": "medio", "2x2": "medio",
    "2x3": "alto", "3x2": "alto", "3x3": "alto",
  };
  for (const p of valores) {
    for (const i of valores) {
      it(`probabilidad ${p} × impacto ${i}`, () => {
        expect(clasificar(puntuacion(p, i))).toBe(esperado[`${p}x${i}`]);
      });
    }
  }

  it("2×3 = 6 es alto y 2×2 = 4 es medio", () => {
    expect(puntuacion(2, 3)).toBe(6);
    expect(clasificar(6)).toBe("alto");
    expect(puntuacion(2, 2)).toBe(4);
    expect(clasificar(4)).toBe("medio");
  });

  it("rechaza puntuaciones imposibles", () => {
    for (const x of [0, 5, 7, 8, 10, 2.5, NaN]) expect(() => clasificar(x)).toThrow();
  });

  it("solo acepta 1, 2 y 3 como valores de escala", () => {
    expect(esValor(2)).toBe(true);
    for (const x of [0, 4, "2", null, undefined, 1.5]) expect(esValor(x)).toBe(false);
  });
});
