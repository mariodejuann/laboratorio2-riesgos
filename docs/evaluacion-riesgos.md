# Reglas de evaluación de riesgos

Escalas didácticas del laboratorio. **No se atribuyen a ENS ni a NIST.**

**Horizonte:** la próxima campaña de matrícula.

## Probabilidad

| Valor | Nivel | Descriptor |
|---|---|---|
| 1 | Baja | Existen razones justificadas para considerar poco probable el evento. |
| 2 | Media | El evento es plausible y las condiciones disponibles no permiten considerarlo poco probable. |
| 3 | Alta | Hay indicios concretos de que el evento es probable durante la campaña. |

## Impacto

| Valor | Nivel | Descriptor |
|---|---|---|
| 1 | Menor | Incidencia limitada, sin comprometer el plazo ni perder registros confirmados. |
| 2 | Significativo | Interrupción o trabajo de recuperación relevante, pero el objetivo todavía puede alcanzarse. |
| 3 | Grave | Impide completar solicitudes en plazo o provoca pérdida no recuperable de registros confirmados. |

## Puntuación y clasificación

Puntuación = probabilidad × impacto.

| Puntuación | Clasificación |
|---|---|
| 1–2 | Bajo |
| 3–4 | Medio |
| 6–9 | Alto |

Las puntuaciones posibles son 1, 2, 3, 4, 6 y 9.

## Reglas de justificación

- Cada valoración exige una justificación escrita.
- La falta de información se registra como **supuesto o información pendiente**; no
  convierte automáticamente la probabilidad en alta.
- Una medida propuesta no reduce el riesgo hasta que se implanta y se verifica. Solo
  entonces se revisa la valoración.

## Cómo lo aplica la aplicación

- El bloque «Evaluar el riesgo» ofrece probabilidad (1–3) e impacto (1–3) mostrando el
  descriptor de cada valor, y exige una justificación para cada uno.
- La puntuación se calcula como probabilidad × impacto (`lib/scoring.ts`) y se muestra con su
  clasificación en texto (no depende solo del color).
- La lógica está cubierta por pruebas unitarias para las 9 combinaciones (`tests/scoring.test.ts`).
- Si faltan datos, la información pendiente se registra en el campo de supuestos y la
  probabilidad no sube automáticamente.

### Medidas de protección

Cada riesgo puede llevar una medida concreta con prioridad (alta, media, baja), responsable
ficticio, forma de comprobar su eficacia y estado (propuesta, implantada, verificada). La
aplicación no recalcula el riesgo por el hecho de proponer una medida: hay que implantarla y
verificarla antes de revisar la valoración.
