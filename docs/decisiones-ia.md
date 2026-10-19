# Decisiones de la IA revisadas o corregidas

La IA se usó como consultora y asistente de desarrollo. Estas son propuestas o resultados que
se revisaron y corrigieron. **Antes de entregar, revísalas tú y deja al menos una explicada con
tus palabras.**

## 1. Referencias ENS/NIST: no forzar asociaciones

- **Propuesta inicial habitual:** asignar una referencia ENS o NIST a los 8 requisitos.
- **Revisión:** se leyeron en los documentos oficiales op.acc.4 (4.2.4), op.exp.2 (4.3.2),
  mp.sw.1 (5.6.1), IA-5, AC-6 y SI-10. Ninguna trata los mensajes de error públicos (SEG-07) ni
  la trazabilidad de despliegues (SEG-08) con la claridad suficiente.
- **Decisión:** SEG-07 y SEG-08 quedan como **requisitos propios del laboratorio**. Además se
  verificó que mp.sw.1 es «n.a.» en categoría BÁSICA y así se indica en `docs/fuentes.md`.

## 2. Configuración de Next.js incompatible

- **Propuesta inicial:** marcar las rutas de la API con `export const dynamic = "force-dynamic"`.
- **Resultado:** la compilación falló, porque la plantilla de Next.js 16 usa `cacheComponents`,
  que no admite esa opción.
- **Corrección:** se eliminó la opción. La ruta pública de resumen usa `connection()` para no
  consultar la base de datos durante la compilación, y la sesión se consulta desde la API.

## 3. Error de interfaz detectado por las pruebas

- **Propuesta inicial:** tras guardar, mostrar «Riesgo guardado» y después limpiar el formulario.
- **Resultado:** la prueba automatizada del navegador no encontró el mensaje, porque limpiar el
  formulario borraba también el mensaje.
- **Corrección:** se cambió el orden (primero limpiar, después mostrar el mensaje) y se repitió
  la prueba, que pasó.

## 4. La validación del navegador no cuenta como control

- **Revisión:** `maxLength` y las listas del formulario se pueden saltar con `curl`.
- **Decisión:** SEG-05 solo se marcó cumplido tras validar en el servidor (`lib/validacion.ts`)
  y probarlo con peticiones directas (`scripts/pruebas-api.sh`).
