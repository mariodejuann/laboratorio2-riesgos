// Validación de entradas en el servidor (SEG-05, orientativo NIST SI-10).
// Solo se aceptan los campos conocidos, con tipo, longitud y valores permitidos.
import { ACTIVOS, LIMITE_CORTO, LIMITE_LARGO, OBJETIVOS } from "./formulacion";
import { ESTADOS_MEDIDA, PRIORIDADES } from "./medida";
import { esValor, type Valor } from "./scoring";

export type RiesgoValido = {
  proceso: string;
  activo: string;
  objetivo: string;
  condicion: string;
  amenaza: string;
  evento: string;
  consecuencia: string;
  supuesto: string;
  probabilidad: Valor;
  justificacionProbabilidad: string;
  impacto: Valor;
  justificacionImpacto: string;
  medidaDescripcion: string;
  medidaPrioridad: string;
  medidaResponsable: string;
  medidaVerificacion: string;
  medidaEstado: string;
};

export type Resultado =
  | { ok: true; datos: RiesgoValido }
  | { ok: false; errores: Record<string, string> };

// Caracteres de control (excepto salto de línea y tabulador) no se admiten.
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

type Regla =
  | { tipo: "texto"; max: number; obligatorio: boolean }
  | { tipo: "lista"; valores: readonly string[] }
  | { tipo: "escala" };

const REGLAS: Record<keyof RiesgoValido, Regla> = {
  proceso: { tipo: "texto", max: LIMITE_CORTO, obligatorio: true },
  activo: { tipo: "lista", valores: ACTIVOS },
  objetivo: { tipo: "lista", valores: OBJETIVOS },
  condicion: { tipo: "texto", max: LIMITE_CORTO, obligatorio: true },
  amenaza: { tipo: "texto", max: LIMITE_CORTO, obligatorio: true },
  evento: { tipo: "texto", max: LIMITE_CORTO, obligatorio: true },
  consecuencia: { tipo: "texto", max: LIMITE_CORTO, obligatorio: true },
  supuesto: { tipo: "texto", max: LIMITE_LARGO, obligatorio: false },
  probabilidad: { tipo: "escala" },
  justificacionProbabilidad: { tipo: "texto", max: LIMITE_LARGO, obligatorio: true },
  impacto: { tipo: "escala" },
  justificacionImpacto: { tipo: "texto", max: LIMITE_LARGO, obligatorio: true },
  medidaDescripcion: { tipo: "texto", max: LIMITE_LARGO, obligatorio: true },
  medidaPrioridad: { tipo: "lista", valores: PRIORIDADES },
  medidaResponsable: { tipo: "texto", max: LIMITE_CORTO, obligatorio: false },
  medidaVerificacion: { tipo: "texto", max: LIMITE_LARGO, obligatorio: true },
  medidaEstado: { tipo: "lista", valores: ESTADOS_MEDIDA },
};

export const CAMPOS = Object.keys(REGLAS) as (keyof RiesgoValido)[];

export function validarRiesgo(entrada: unknown): Resultado {
  if (typeof entrada !== "object" || entrada === null || Array.isArray(entrada)) {
    return { ok: false, errores: { _: "El cuerpo debe ser un objeto JSON." } };
  }
  const obj = entrada as Record<string, unknown>;
  const errores: Record<string, string> = {};
  const datos: Record<string, unknown> = {};

  for (const campo of CAMPOS) {
    const regla = REGLAS[campo];
    const valor = obj[campo];

    if (regla.tipo === "escala") {
      if (!esValor(valor)) errores[campo] = "Debe ser un número entero 1, 2 o 3.";
      else datos[campo] = valor;
      continue;
    }

    if (valor !== undefined && typeof valor !== "string") {
      errores[campo] = "Debe ser texto.";
      continue;
    }
    const texto = (valor ?? "").trim();

    if (regla.tipo === "lista") {
      if (!regla.valores.includes(texto)) errores[campo] = `Valor no permitido. Opciones: ${regla.valores.join(", ")}.`;
      else datos[campo] = texto;
      continue;
    }

    if (regla.obligatorio && texto === "") errores[campo] = "Campo obligatorio.";
    else if (texto.length > regla.max) errores[campo] = `Máximo ${regla.max} caracteres.`;
    else if (CONTROL.test(texto)) errores[campo] = "Contiene caracteres no permitidos.";
    else datos[campo] = texto;
  }

  if (Object.keys(errores).length > 0) return { ok: false, errores };
  return { ok: true, datos: datos as RiesgoValido };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function esUuid(x: unknown): x is string {
  return typeof x === "string" && UUID.test(x);
}
