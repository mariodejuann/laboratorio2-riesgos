// Medida de protección asociada a un riesgo.
export const PRIORIDADES = ["alta", "media", "baja"] as const;
export const ESTADOS_MEDIDA = ["propuesta", "implantada", "verificada"] as const;

export type Medida = {
  descripcion: string;
  prioridad: string;
  responsable: string;
  efecto: string;
  verificacion: string;
  estado: string;
};

export const MEDIDA_VACIA: Medida = {
  descripcion: "",
  prioridad: "",
  responsable: "",
  efecto: "",
  verificacion: "",
  estado: "propuesta",
};
