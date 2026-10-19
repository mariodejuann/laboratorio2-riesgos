// Estado de la evaluación en el formulario (valores como texto, "" = sin elegir).
export type Evaluacion = {
  probabilidad: string;
  justificacionProbabilidad: string;
  impacto: string;
  justificacionImpacto: string;
};

export const EVALUACION_VACIA: Evaluacion = {
  probabilidad: "",
  justificacionProbabilidad: "",
  impacto: "",
  justificacionImpacto: "",
};
