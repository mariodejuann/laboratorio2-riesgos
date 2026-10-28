# Laboratorio de gestión de riesgos

Aplicación web para identificar, evaluar y comunicar riesgos de una organización
ficticia (**caso académico con datos ficticios**: Academia Horizonte), de modo que la
dirección entienda qué puede ocurrir, qué objetivos se verían afectados y qué medidas
conviene priorizar. Funciona sin IA integrada.

## Qué hace

- Describe la organización, el proceso de matrícula, el objetivo y las condiciones del caso.
- Formulación guiada del riesgo (condición, amenaza, evento, activo, consecuencia, objetivo,
  supuestos) con vista previa y aviso de campos pendientes.
- Evaluación de probabilidad e impacto (1–3) con justificación obligatoria; puntuación
  = probabilidad × impacto; clasificación bajo 1–2, medio 3–4 y alto 6–9.
- Medida de protección con prioridad, estado y forma de comprobar su eficacia.
- Resumen para dirección (con la medida a aprobar primero) y detalle técnico; exportación CSV.
- Persistencia en PostgreSQL: los registros se recuperan al recargar.
- Lectura del detalle y escrituras protegidas por sesión, comprobada en el servidor.

## Estructura

```
app/                 páginas y API (Next.js App Router)
  api/riesgos        GET (con sesión), POST (con sesión)
  api/riesgos/[id]   PUT, DELETE (con sesión)
  api/login|logout|sesion|resumen
lib/                 reglas de evaluación, validación, acceso a datos y autenticación
db/                  001_crear_riesgos.sql (migración), roles.sql (cuentas), seed.sql (datos ficticios)
scripts/             generación de secretos y pruebas de la API
tests/               pruebas unitarias (Vitest)
docs/                documentación del laboratorio
```

## Ejecución local

Requisitos: Node.js 20 o superior, npm y una base de datos PostgreSQL 13 o superior.

1. `npm install`
2. Base de datos, con la **cuenta administradora** (`DATABASE_URL_ADMIN`):
   ejecutar `db/001_crear_riesgos.sql`, después `db/roles.sql` (crea `app_riesgos` con mínimo privilegio)
   y, opcionalmente, `db/seed.sql`. Ver instrucciones completas en `docs/base-de-datos.md`.
3. `cp .env.example .env.local` y rellenar (ver `docs/gestion-secretos.md`):
   - `DATABASE_URL`: cadena de `app_riesgos` (desde Bitwarden).
   - `ADMIN_PASSWORD_HASH`: `node scripts/hash-password.mjs`.
   - `SESSION_SECRET`: `node scripts/session-secret.mjs`.
4. `npm run dev` y abrir http://localhost:3000

Otros comandos: `npm run build`, `npm test`, `npm run lint`.

## Despliegue (Preview en Vercel)

1. `npx vercel login` (autenticación personal en el navegador).
2. `npx vercel link` y elegir o crear el proyecto `laboratorio2-riesgos` (Next.js, configuración estándar).
3. Configurar las tres variables en Vercel → Settings → Environment Variables, con valores
   distintos para **Preview** y **Development**.
4. `npx vercel` (Preview; **no** usar `--prod`).
5. Registrar URL, fecha, commit y comprobación en `docs/despliegue.md`.

## Cómo comprobar la entrega

1. Abrir la URL Preview: se ven el título, la descripción y el aviso de datos ficticios.
2. Iniciar sesión, guardar un riesgo, recargar y comprobar que sigue ahí.
3. `bash scripts/pruebas-api.sh <URL>`: todas las pruebas deben pasar (escritura no
   autorizada, validación, persistencia y clasificación).
4. Revisar `docs/pruebas.md`, `docs/despliegue.md` y el commit indicado en la entrega.

## Documentación

- [Fuentes oficiales](docs/fuentes.md)
- [Requisitos de seguridad](docs/requisitos-seguridad.md)
- [Caso de trabajo](docs/caso.md)
- [Reglas de evaluación](docs/evaluacion-riesgos.md)
- [Formulación guiada del riesgo](docs/formulacion-riesgo.md)
- [Riesgos analizados y medida prioritaria](docs/riesgos.md)
- [Base de datos: modelo, cuentas y migración](docs/base-de-datos.md)
- [Gestión de secretos](docs/gestion-secretos.md)
- [Resultados de las pruebas](docs/pruebas.md)
- [Despliegue](docs/despliegue.md)
- [Registro del grupo](docs/registro-grupo.md)
- [Incidencias](docs/incidencias.md)
- [Decisiones de la IA revisadas](docs/decisiones-ia.md)

La selección de requisitos es una adaptación didáctica y **no acredita conformidad** con el
ENS ni con NIST SP 800-53.
