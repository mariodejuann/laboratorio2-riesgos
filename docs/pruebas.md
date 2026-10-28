# Resultados de las pruebas

Todas las pruebas se hicieron con **datos ficticios**.

## Entorno local (28/10/2026) — commit `5456e86`

- Base de datos: PostgreSQL (Neon), rama `production`, cuenta `app_riesgos`.
- Aplicación: `npm run dev` (Next.js, Node 22).

### Prueba 1 · Clasificación — `npm test` (`tests/scoring.test.ts`)

Las 9 combinaciones de probabilidad × impacto, puntuaciones imposibles y valores de escala.

| Suite | Fecha | Commit | Resultado |
|---|---|---|---|
| `tests/scoring.test.ts` (12 casos) | 28/10/2026 | `5456e86` | 12/12 pasan |
| `tests/validacion.test.ts` (9 casos) | 28/10/2026 | `5456e86` | 9/9 pasan |
| `tests/password.test.ts` (5 casos) | 28/10/2026 | `5456e86` | 5/5 pasan |
| **Total** | 28/10/2026 | `5456e86` | **26/26 pasan** |

Ejecutar: `npm test`

### Prueba 2 · Validación — `tests/validacion.test.ts`

Cubre: escala fuera de rango, texto demasiado largo, valores fuera de lista cerrada, campos obligatorios vacíos, tipos incorrectos, caracteres de control, cuerpos no-objeto, campos desconocidos ignorados, HTML tratado como texto plano. Incluido en el total anterior (9/9).

### Prueba 3 · Persistencia

Cubierta por `scripts/pruebas-api.sh`: «Lectura tras crear (persistencia)» y «El riesgo creado se recupera» crean un riesgo, recargan la lista y verifican que el ID sigue presente. También cubierta en la prueba de interfaz (ver más abajo).

### Prueba 4 · Escritura no autorizada

Cubierta por `scripts/pruebas-api.sh`: se captura `/api/resumen` antes de los intentos sin sesión, se realizan POST/PUT/DELETE (todos deben devolver 401), y se vuelve a capturar `/api/resumen` para verificar que el conteo no cambió. Esto confirma que los intentos fueron rechazados **y** que la base de datos no fue modificada.

### Prueba 5 · Secretos

**Búsqueda en el historial de Git** (28/10/2026, commit `5456e86`):

```bash
# Comprobar que no hay archivos .env con valores en el repositorio
git ls-files | grep -iE "\.env"
# Solo debe aparecer .env.example

# Buscar valores reales de variables de entorno en el historial
git log -p --all | grep -iE "^[+](DATABASE_URL|SESSION_SECRET|ADMIN_PASSWORD_HASH)\s*=\s*.+" | grep -v "=$"
# Sin salida = sin valores reales encontrados
```

Resultado: solo `.env.example` está versionado (sin valores). La búsqueda en el historial no encontró ninguna línea con valor real en `DATABASE_URL`, `SESSION_SECRET` ni `ADMIN_PASSWORD_HASH`.

**Búsqueda en el código del cliente** (build de Next.js):

```bash
grep -r "DATABASE_URL\|SESSION_SECRET\|ADMIN_PASSWORD_HASH\|scrypt:" .next/static/
# Sin coincidencias
```

Resultado documentado en la sección de pruebas adicionales (pendiente de repetir tras el build de Preview).

> gitleaks no está disponible en el entorno de desarrollo. La búsqueda manual con `git log -p` es equivalente para este conjunto de secretos conocidos.

### Pruebas de aceptación de la API (`bash scripts/pruebas-api.sh http://localhost:3100`)

| Prueba | Requisito | Esperado | Resultado |
|---|---|---|---|
| GET /api/riesgos sin sesión | SEG-03 | 401 | Pasa |
| POST, PUT y DELETE sin sesión | SEG-03 | 401 | Pasa |
| POST con cookie falsificada | SEG-03 | 401 | Pasa |
| Login con contraseña incorrecta | SEG-03 | 401 | Pasa |
| Login correcto | — | 200 | Pasa |
| Probabilidad 5 / como texto | SEG-05 | 400 | Pasa |
| Texto de 121 caracteres | SEG-05 | 400 | Pasa |
| Activo fuera de lista | SEG-05 | 400 | Pasa |
| Cuerpo que no es JSON | SEG-05 | 415 | Pasa |
| Identificador no UUID (`1 OR 1=1`) | SEG-05 | 400 | Pasa |
| Petición desde otro origen | SEG-03 | 403 | Pasa |
| Crear riesgo y clasificación 1×2 = 2 bajo calculada en servidor | Clasificación | 201 | Pasa |
| Recuperar el riesgo creado | Persistencia | 200 + presente | Pasa |
| Editar a 3×3 = 9 alto | Clasificación | 200 | Pasa |
| Borrar | — | 204 | Pasa |
| Respuesta sin detalles internos | SEG-07 | Sin SQL/trazas | Pasa |

Total: **23 pasan, 0 fallan** (se añadió «BD sin cambios tras escrituras no autorizadas»; pendiente de re-ejecutar con la versión actual que incluye `medidaEfecto`).

### Pruebas adicionales

| Prueba | Requisito | Resultado |
|---|---|---|
| 6 logins fallidos desde la misma IP → el 6.º devuelve 429 | SEG-03 | Pasa (401×5, 429) |
| Base de datos inaccesible: respuesta `{"error":"No se pudo completar la operación."}` (500); el registro solo muestra `Error código=ECONNREFUSED`, sin la contraseña de la cadena de conexión | SEG-07 / SEG-02 | Pasa |
| Búsqueda de `DATABASE_URL`, `SESSION_SECRET`, `ADMIN_PASSWORD_HASH` y contraseñas de prueba en `.next/static` (código del navegador) | SEG-02 | Sin coincidencias |
| `scripts/probar-permisos.mjs` con `app_riesgos` (local): SELECT permitido; CREATE TABLE, DROP TABLE, ALTER TABLE, TRUNCATE y CREATE ROLE denegados (6/6). Repetir contra Neon y anotar el resultado aquí | SEG-04 | Pasa en local; pendiente en Neon |
| Con `app_riesgos`: `CREATE TABLE prueba` → `permission denied for schema public`; `DROP TABLE riesgos` → `must be owner of table riesgos` | SEG-04 | Pasa |
| Inserción con probabilidad 5 directamente en BD → rechazada por restricciones | SEG-05 (defensa en profundidad) | Pasa |
| `git ls-files` solo contiene `.env.example`; búsqueda en `git log -p` de contraseñas y cadenas de conexión | SEG-01 | Sin coincidencias |

### Prueba de interfaz (navegador Chromium automatizado)

Textos de cabecera presentes; formulario incompleto detectado; «Cargar ejemplo», edición y
«Limpiar formulario» funcionan; 2 × 3 muestra «Riesgo alto»; «Guardar» deshabilitado sin
sesión; tras iniciar sesión, un riesgo guardado **sigue presente después de recargar**; borrado
correcto; sin errores en la consola.

## Entorno Preview (Vercel)

Pendiente de ejecutar por la persona responsable tras el despliegue:

```bash
bash scripts/pruebas-api.sh https://<url-preview>.vercel.app
```

| Fecha | Commit | URL | Resultado |
|---|---|---|---|
| _(rellenar)_ | _(rellenar)_ | _(rellenar)_ | _(n pasan, n fallan)_ |

> Si la Preview tiene activada la **protección de despliegue de Vercel** (Vercel
> Authentication), las peticiones de `curl` reciben 401 de Vercel antes de llegar a la app.
> En ese caso, ejecuta las pruebas en local o desactiva temporalmente esa protección.
