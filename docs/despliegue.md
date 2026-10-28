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

| Fecha | Commit (`entrega-l2`) | URL Preview | Prueba 3 persistencia | Prueba 4 escritura no autorizada |
|---|---|---|---|---|
| 28/10/2026 | `fad334d` | https://laboratorio2-riesgos-1zt6r5jta-personal-projects-6ffb.vercel.app | pasa | pasa |

Resultado global de `scripts/pruebas-api.sh` en esta Preview: **23 pasan, 0 fallan**. La protección de despliegue de Vercel (Vercel Authentication) se desactivó para poder ejecutar las pruebas con `curl`; el despliegue contiene solo datos ficticios. Las ejecuciones previas con 308 (URL con barra final) y 401 (protección de Vercel) no son válidas y no se usan como evidencia.

### Pasos para el despliegue Preview y la entrega

```bash
# 1. Hacer el commit final y crear la etiqueta
git tag entrega-l2
git push origin entrega-l2

# 2. Desplegar en Preview (nunca --prod)
npx vercel

# 3. Anotar la URL que imprime Vercel y ejecutar las pruebas 3 y 4
bash scripts/pruebas-api.sh https://<url>.vercel.app

# 4. Obtener el identificador del commit de la etiqueta para la PDU
git rev-list -n 1 entrega-l2
```

Registrar en la tabla: fecha, hash corto del commit, URL Preview y resultado de las pruebas 3 y 4.
