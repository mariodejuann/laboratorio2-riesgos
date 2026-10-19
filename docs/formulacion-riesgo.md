# Formulación guiada del riesgo

Plantilla de redacción:

> Debido a [condición o debilidad], [amenaza] podría provocar [evento] sobre [activo],
> causando [consecuencia] y afectando al objetivo de [objetivo], en el proceso de [proceso].

## Campos

| Bloque | Campo | Obligatorio | Tipo / límite |
|---|---|---|---|
| A. Qué queremos proteger | Proceso o servicio | Sí | Texto, máx. 120 |
| A | Activo afectado | Sí | Lista cerrada: plataforma web, base de datos, copias de seguridad |
| A | Objetivo afectado | Sí | Lista cerrada: completar solicitudes en plazo, conservar y recuperar registros |
| B. Qué podría ocurrir y por qué | Condición o debilidad conocida | Sí | Texto, máx. 120 |
| B | Amenaza | Sí | Texto, máx. 120 |
| B | Evento | Sí | Texto, máx. 120 |
| C. Qué consecuencias tendría | Consecuencia | Sí | Texto, máx. 120 |
| D. Qué estamos suponiendo | Supuestos o información pendiente | No | Texto, máx. 400 |

Conceptos (ayuda en pantalla): debilidad facilita el daño; amenaza puede provocarlo;
evento es lo que sucede; consecuencia es el efecto sobre la actividad y sus objetivos.

## Comportamiento

- La vista previa no muestra campos vacíos como si el enunciado estuviera completo: marca
  cada parte pendiente con «[falta: …]», lista lo que falta y recuerda revisar la coherencia.
- «Cargar ejemplo» rellena el escenario de la copia de seguridad sin probar.
- «Limpiar formulario» vacía todos los campos.
- El borrador vive solo en memoria y se muestra el aviso «Borrador temporal. No se guarda al recargar».
- Los textos se muestran como texto plano (React los escapa; no se usa HTML en bruto).

## Validación

La validación del navegador (límites de longitud, listas cerradas) es **provisional**:
ayuda a la persona usuaria pero no es una barrera de seguridad. **SEG-05 no se marca como
cumplido**; requiere validación en el servidor.

## Comprobaciones realizadas

Ver `docs/pruebas.md`.
