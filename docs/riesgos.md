# Riesgos analizados (caso ficticio: Academia Horizonte)

Escalas y reglas: `docs/evaluacion-riesgos.md`. Los dos riesgos se pueden cargar con
`db/seed.sql` o crear desde la aplicación.

## Riesgo 1 · Pérdida de registros por copias no probadas

**Formulación:** Debido a que hay una única instancia de base de datos y no se ha probado la
restauración de las copias, un fallo del almacenamiento podría provocar la pérdida de acceso a
los registros confirmados sobre la base de datos, causando la imposibilidad de reconstruir parte
de las matrículas y afectando al objetivo de conservar y recuperar registros, en el proceso de
matrícula.

| Elemento | Contenido |
|---|---|
| Condición conocida | Única instancia de BD; restauración nunca probada (dato del caso) |
| Supuesto | Se desconoce si las copias permiten recuperar todos los registros |
| Probabilidad | **2 Media**: con una única instancia el fallo es plausible y nada permite considerarlo poco probable, pero no hay indicios concretos de que vaya a ocurrir en la campaña. La falta de información sobre las copias se registra como supuesto, no sube la probabilidad. |
| Impacto | **3 Grave**: si las copias no se pueden restaurar, la pérdida de registros confirmados no sería recuperable. |
| Puntuación | 2 × 3 = **6 → Alto** |
| Medida | Prueba de restauración de la última copia en un entorno separado antes de la campaña, con procedimiento documentado. Prioridad **alta**. |
| Comprobación | La restauración termina sin errores, el recuento de matrículas restauradas coincide con el original y el tiempo de recuperación cabe en el plazo de la campaña. |

## Riesgo 2 · Daño masivo por permisos administrativos de la aplicación

**Formulación:** Debido a que la cuenta que utiliza la aplicación tiene permisos administrativos
sobre la base de datos, un error de la aplicación o una credencial expuesta podría provocar la
modificación o el borrado masivo de registros de matrícula sobre la base de datos, causando la
corrupción de solicitudes y la interrupción de la plataforma mientras se recuperan y afectando al
objetivo de completar solicitudes en plazo, en el proceso de matrícula.

| Elemento | Contenido |
|---|---|
| Condición conocida | La cuenta de la aplicación es administradora (dato del caso) |
| Supuesto | No hay otros controles que limiten operaciones destructivas |
| Probabilidad | **2 Media**: los permisos excesivos hacen plausible el daño ante cualquier fallo, pero no hay indicios concretos de ataque ni de credencial expuesta. |
| Impacto | **3 Grave**: sin restauración probada, un borrado masivo podría impedir completar solicitudes en plazo y perder registros confirmados. |
| Puntuación | 2 × 3 = **6 → Alto** |
| Medida | Cuenta de aplicación con permisos mínimos sobre las tablas que usa; la administradora solo para migraciones. Prioridad **alta**. |
| Comprobación | Con la cuenta de la aplicación, `CREATE TABLE` y `DROP TABLE` devuelven «permission denied» y la aplicación sigue funcionando. |

> Nota: si se justifica que la recuperación sería posible con trabajo relevante, el impacto del
> riesgo 2 podría ser **2 Significativo** (2 × 2 = 4, medio). La valoración depende de la
> justificación; ambas son defendibles si se argumentan.

Las medidas están en estado **propuesta**: no reducen el riesgo hasta implantarse y verificarse.

## Pregunta de cierre: ¿qué medida aprobar primero?

**La prueba de restauración de las copias (riesgo 1).**

- **Por qué primero:** es lo que decide si cualquier incidente (fallo de almacenamiento, error,
  borrado malicioso, incluido el del riesgo 2) acaba en una interrupción recuperable o en una
  pérdida irrecuperable. Reduce el impacto de los dos riesgos a la vez.
- **Efecto esperado:** el impacto del riesgo 1 pasaría de 3 a 2 (recuperable con trabajo), es
  decir, de 6 (alto) a 4 (medio), **solo después** de verificarla.
- **Cómo comprobar que protege el objetivo:** restaurar la copia en un entorno separado,
  comparar el número de matrículas confirmadas y una muestra de registros con el original, y
  cronometrar la recuperación para confirmar que cabe dentro de los siete días de campaña.
  Si la prueba falla, se ha descubierto el problema antes de la campaña, que también es valor.
