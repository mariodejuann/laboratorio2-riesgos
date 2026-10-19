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

## Registro de despliegues

| Fecha | Commit de origen | URL Preview | Comprobación |
|---|---|---|---|
| _(rellenar)_ | _(git rev-parse --short HEAD)_ | _(https://…vercel.app)_ | _(textos visibles, login, persistencia, `scripts/pruebas-api.sh`)_ |
