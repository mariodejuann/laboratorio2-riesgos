// Medida de protección asociada a un riesgo.
export const PRIORIDADES = ["alta", "media", "baja"] as const;
export const ESTADOS_MEDIDA = ["propuesta", "implantada", "verificada"] as const;

export type Medida = {
  descripcion: string;
  prioridad: string;
  responsable: string;
  verificacion: string;
  estado: string;
};

export const MEDIDA_VACIA: Medida = {
  descripcion: "",
  prioridad: "",
  responsable: "",
  verificacion: "",
  estado: "propuesta",
};
