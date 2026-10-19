# Resultados de las pruebas

Todas las pruebas se hicieron con **datos ficticios**.

## Entorno local (19/10/2026)

- Base de datos: PostgreSQL 16 local de prueba, con la cuenta `app_riesgos` creada con
  `db/permisos.sql` (credenciales de prueba desechables, no versionadas).
- Aplicación: `npm run build` + `next start` (Next.js 16.4.2, Node 22).

### Pruebas unitarias (`npm test`)

| Suite | Resultado |
|---|---|
| `tests/scoring.test.ts`: 9 combinaciones de probabilidad × impacto, puntuaciones imposibles, valores de escala | 12/12 pasan |
| `tests/validacion.test.ts`: escala, longitudes, listas cerradas, obligatorios, tipos, caracteres de control, campos desconocidos, UUID | 10/10 pasan |

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

Total: **22 pasan, 0 fallan**.

### Pruebas adicionales

| Prueba | Requisito | Resultado |
|---|---|---|
| 6 logins fallidos desde la misma IP → el 6.º devuelve 429 | SEG-03 | Pasa (401×5, 429) |
| Base de datos inaccesible: respuesta `{"error":"No se pudo completar la operación."}` (500); el registro solo muestra `Error código=ECONNREFUSED`, sin la contraseña de la cadena de conexión | SEG-07 / SEG-02 | Pasa |
| Búsqueda de `DATABASE_URL`, `SESSION_SECRET`, `ADMIN_PASSWORD_HASH` y contraseñas de prueba en `.next/static` (código del navegador) | SEG-02 | Sin coincidencias |
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
