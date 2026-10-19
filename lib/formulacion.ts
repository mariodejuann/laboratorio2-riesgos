// Formulación guiada del riesgo: campos, límites, vista previa y ejemplo.

export const LIMITE_CORTO = 120;
export const LIMITE_LARGO = 400;

export const ACTIVOS = ["plataforma web", "base de datos", "copias de seguridad"] as const;
export const OBJETIVOS = ["completar solicitudes en plazo", "conservar y recuperar registros"] as const;

export type Formulacion = {
  proceso: string;
  activo: string;
  objetivo: string;
  condicion: string;
  amenaza: string;
  evento: string;
  consecuencia: string;
  supuesto: string; // opcional
};

export const FORMULACION_VACIA: Formulacion = {
  proceso: "",
  activo: "",
  objetivo: "",
  condicion: "",
  amenaza: "",
  evento: "",
  consecuencia: "",
  supuesto: "",
};

export const EJEMPLO: Formulacion = {
  proceso: "matrícula",
  activo: "base de datos",
  objetivo: "conservar y recuperar registros",
  condicion: "no se ha probado la restauración de las copias",
  amenaza: "fallo del almacenamiento",
  evento: "pérdida de acceso a los registros confirmados",
  consecuencia: "imposibilidad de reconstruir parte de las matrículas",
  supuesto: "se desconoce si las copias disponibles permiten recuperar todos los registros",
};

/** Campos obligatorios (el supuesto es opcional) con su etiqueta legible. */
export const OBLIGATORIOS: { clave: keyof Formulacion; etiqueta: string }[] = [
  { clave: "proceso", etiqueta: "proceso o servicio" },
  { clave: "activo", etiqueta: "activo afectado" },
  { clave: "objetivo", etiqueta: "objetivo afectado" },
  { clave: "condicion", etiqueta: "condición o debilidad" },
  { clave: "amenaza", etiqueta: "amenaza" },
  { clave: "evento", etiqueta: "evento" },
  { clave: "consecuencia", etiqueta: "consecuencia" },
];

export function camposFaltantes(f: Formulacion): string[] {
  return OBLIGATORIOS.filter(({ clave }) => f[clave].trim() === "").map((c) => c.etiqueta);
}

/** Devuelve las partes de la frase; las vacías se marcan como pendientes. */
export function partesFrase(f: Formulacion): { texto: string; falta: boolean }[] {
  const v = (valor: string, etiqueta: string) =>
    valor.trim() ? { texto: valor.trim(), falta: false } : { texto: `[falta: ${etiqueta}]`, falta: true };
  return [
    { texto: "Debido a ", falta: false },
    v(f.condicion, "condición"),
    { texto: ", ", falta: false },
    v(f.amenaza, "amenaza"),
    { texto: " podría provocar ", falta: false },
    v(f.evento, "evento"),
    { texto: " sobre ", falta: false },
    v(f.activo, "activo"),
    { texto: ", causando ", falta: false },
    v(f.consecuencia, "consecuencia"),
    { texto: " y afectando al objetivo de ", falta: false },
    v(f.objetivo, "objetivo"),
    { texto: ", en el proceso de ", falta: false },
    v(f.proceso, "proceso"),
    { texto: ".", falta: false },
  ];
}

export function fraseTexto(f: Formulacion): string {
  return partesFrase(f).map((p) => p.texto).join("");
}
