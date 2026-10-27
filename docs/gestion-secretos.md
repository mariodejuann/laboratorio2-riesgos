# Gestión de secretos

No hay valores reales en este repositorio. La plantilla es `.env.example`.

| Variable | Finalidad | Dónde se usa (código) | Entorno | Dónde se custodia | Cómo se cambia si se expone |
|---|---|---|---|---|---|
| `DATABASE_URL` | Conexión a PostgreSQL con la cuenta de la aplicación (`app_riesgos`), con mínimo privilegio (SEG-04) | `lib/db.ts` (solo servidor) | Development, Preview y Production (valor distinto en cada uno) | Bitwarden (contraseña del rol); `.env.local`; Vercel por entorno | Cambiar la contraseña del rol en la consola de Neon, actualizar el valor en Vercel (cada entorno) y en `.env.local` |
| `DATABASE_URL_ADMIN` | Conexión a PostgreSQL con la cuenta administradora (`admin_migraciones`), solo para aplicar migraciones | Scripts de migración en local (`psql "$DATABASE_URL_ADMIN" -f db/…`) | **Solo Development (local)**; no se configura en Vercel ni en ningún otro entorno | Bitwarden (contraseña del rol); `.env.local` | Cambiar la contraseña del rol en la consola de Neon y actualizar `.env.local` |
| `ADMIN_PASSWORD_HASH` | Hash scrypt de la contraseña del perfil «gestor» de la aplicación | `lib/auth.ts` (solo servidor) | Development, Preview y Production | Contraseña en Bitwarden; hash en `.env.local` y en Vercel por entorno | Generar nuevo hash con `node scripts/hash-password.mjs`, actualizar Vercel y `.env.local`; las sesiones antiguas caducan solas (o cambiar también `SESSION_SECRET` para invalidarlas) |
| `SESSION_SECRET` | Secreto para firmar y verificar la cookie de sesión HMAC-SHA256 (≥ 32 caracteres) | `lib/auth.ts` (solo servidor) | Development, Preview y Production (valor distinto en cada uno) | Bitwarden; `.env.local`; Vercel por entorno | Generar nuevo valor con `node scripts/session-secret.mjs`; **invalida todas las sesiones abiertas** |

## Reglas

- Bitwarden **custodia** las credenciales, pero no configura la aplicación: los valores se
  copian a `.env.local` (excluido de Git) o a las variables de entorno de Vercel.
- `DATABASE_URL_ADMIN` **nunca se configura en Vercel** ni en ningún entorno remoto. Solo
  existe en `.env.local` de quien aplica migraciones. La aplicación desplegada usa únicamente
  `DATABASE_URL` con la cuenta `app_riesgos` (SEG-04).
- Ninguna variable lleva el prefijo `NEXT_PUBLIC_`, así que ninguna se incluye en el código
  del navegador (SEG-02).
- **Entornos separados (SEG-06):** cada entorno de Vercel (Development, Preview, Production)
  tiene su propio valor de `DATABASE_URL`, `ADMIN_PASSWORD_HASH` y `SESSION_SECRET`. Con
  Neon desde Vercel, las ramas de Preview pueden apuntar a una rama de la base de datos
  distinta de la de producción (ver SEG-06 en `requisitos-seguridad.md`).
- **Si una credencial se expone:** revocarla o cambiarla en el proveedor de inmediato y
  anotarlo en `docs/incidencias.md`. Borrarla del último archivo no elimina la exposición,
  porque sigue en el historial de Git y en cualquier copia del repositorio.
- No se pegan contraseñas ni tokens en el chat de la IA.
