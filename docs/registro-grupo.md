# Registro del grupo

## 1. Quién hizo qué

| Integrante | Tareas | Commits de referencia |
|---|---|---|
| mario | Creación de la aplicación base (Next.js, TypeScript). Documentación del caso y las reglas de evaluación. Formulación guiada del riesgo. Evaluación de probabilidad e impacto. Medidas de protección. Persistencia en BD y validación en servidor. Autenticación y resumen para dirección. Script de comprobación de permisos mínimos. Corrección del formato del hash de contraseña. | `6b160a9`, `9bfde20`, `8a967ac`, `fdeb282`, `b04e37e`, `b34f40a`, `573f2b8`, `87cca3e`, `7227cc1`, `14721ef`, `ae68796` |
| fernando | Securización completa (Parte 2): base de datos y persistencia (migración, roles, `.env.example`, `docs/base-de-datos.md`). Campo efecto esperado de la medida y tabla de las 9 combinaciones. Renombramiento del perfil a «gestor» y justificación de `node:crypto`. Actualización de SEG-05 y SEG-07 con implementación real. Separación de entornos y documentación de secretos. Mejora del script de pruebas (verificación de BD tras escritura no autorizada, prueba de secretos). Preparación de la entrega (README, SEG-01–SEG-08, `incidencias.md`, `registro-grupo.md`). | `675ca50`, `5464577`, `2d527da`, `66d7926`, `5456e86`, `a785536`, `5c06137` |

## 2. Decisión de la IA revisada o corregida por cada integrante

### mario

**Qué propuso la IA:** Para el hash de la contraseña de la cuenta gestora, la IA generó el formato `scrypt$<sal>$<hash>`, usando el signo `$` como separador entre las partes.

**Qué cambiamos y por qué:** Ese formato no funciona bien con Next.js, porque al leer `.env.local` interpreta `$<sal>` como una variable de entorno y la sustituye por una cadena vacía, corrompiendo el hash. Cambiamos el separador a `:` (formato `scrypt:<sal>:<hash>`), de forma que Next.js no lo modifique al cargarlo. Mantuvimos compatibilidad con el formato antiguo para que los valores ya configurados en Vercel no dejaran de funcionar de inmediato. Lo verificamos escribiendo el nuevo hash en un archivo `.env.local` temporal y comprobando que `loadEnvConfig` de Next.js lo lee sin modificarlo (prueba en `tests/password.test.ts`, caso «el formato actual sobrevive a la lectura de .env.local»).

### fernando

**Qué propuso la IA:** Para la gestión de sesiones, la IA propuso instalar una biblioteca externa (`jose` o `iron-session`) para firmar y verificar las cookies de sesión del perfil gestor.

**Qué cambiamos y por qué:** Decidimos no añadir esa dependencia. Node.js ya incluye `node:crypto` con `scryptSync` para el hash de contraseña y `createHmac` con HMAC-SHA256 para la firma del token de sesión. Añadir una biblioteca externa introduce un riesgo de cadena de suministro (una actualización maliciosa o una vulnerabilidad en esa librería afectaría a la autenticación) y, para un único usuario con contraseña almacenada como hash en una variable de entorno, el código resultante con `node:crypto` es más pequeño, más directo y más fácil de auditar. La decisión quedó documentada en SEG-03 de `docs/requisitos-seguridad.md`.

## 3. Pregunta de cierre

> Si dirección solo pudiera aprobar una medida, ¿cuál y cómo comprobaríais que protege el objetivo afectado?

Elegiríamos la **prueba periódica de restauración de copias de seguridad** (el riesgo de mayor puntuación identificado: pérdida de acceso a los registros confirmados por fallo del almacenamiento, 2 × 3 = 6, nivel alto, objetivo «conservar y recuperar registros»).

Es la más prioritaria porque, sin restauración probada, una interrupción del almacenamiento impediría recuperar registros de matrícula confirmados de forma permanente, lo que haría imposible cumplir el objetivo aunque existieran copias técnicas. Las demás medidas del registro tienen puntuación igual o inferior y afectan a activos con mayor capacidad de recuperación.

Para comprobar que la medida protege el objetivo: realizaríamos una restauración completa en un entorno separado, compararíamos el recuento de registros restaurados con el original y verificaríamos que los datos de matrícula son coherentes. La prueba debería ejecutarse antes de cada campaña de matrícula, no solo una vez, y documentar cuánto tiempo tarda la restauración (tiempo de recuperación) para saber si es compatible con el plazo de solicitudes.
