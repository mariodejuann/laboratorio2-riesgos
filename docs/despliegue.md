# Despliegue

Despliegues **Preview** en Vercel (sin `--prod`), proyecto `laboratorio2-riesgos`.
No se registran secretos en este documento.

## Configuración (evidencia sin valores)

Vercel → Project → Settings → Environment Variables:

| Variable | Development | Preview | Production |
|---|---|---|---|
| `DATABASE_URL` | valor propio | valor propio (BD o rama de Preview) | no configurado todavía |
| `ADMIN_PASSWORD_HASH` | valor propio | valor propio | no configurado todavía |
| `SESSION_SECRET` | valor propio | valor propio | no configurado todavía |

Adjuntar captura de esta pantalla **con los valores ocultos** como evidencia (SEG-06).

## Estado de ramas de Neon (SEG-06)

Neon solo tiene una rama: **`production` (Default)**. Las ramas de Preview **no están activadas**.

Consecuencia: los despliegues Preview de Vercel usan la misma base de datos que producción. Los datos de prueba creados en Preview aparecerán en producción y viceversa. Para este laboratorio se acepta esta limitación (plan gratuito de Neon); en un proyecto real habría que activar «Database Branching» en Neon para aislar Preview.

Mientras no se activen ramas de Preview, se recomienda:
- No crear riesgos con datos reales en el despliegue Preview.
- Limpiar los datos de prueba antes de la entrega final.

## Registro de despliegues

| Fecha | Commit de origen | URL Preview | Comprobación |
|---|---|---|---|
| _(rellenar)_ | _(git rev-parse --short HEAD)_ | _(https://…vercel.app)_ | _(textos visibles, login, persistencia, `scripts/pruebas-api.sh`)_ |
