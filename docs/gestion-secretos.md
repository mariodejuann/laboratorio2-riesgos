# Gestión de secretos

No hay valores reales en este repositorio. La plantilla es `.env.example`.

| Variable | Finalidad | Dónde se usa | Dónde se guarda | Cómo se sustituye |
|---|---|---|---|---|
| `DATABASE_URL` | Conexión a PostgreSQL con la **cuenta de la aplicación** (`app_riesgos`), nunca la administradora | `lib/db.ts` (solo servidor) | Bitwarden; `.env.local`; Vercel (por entorno) | Cambiar la contraseña del rol en el proveedor y actualizar Vercel y `.env.local` |
| `ADMIN_PASSWORD_HASH` | Hash scrypt de la contraseña de administración de la app | `lib/auth.ts` | Contraseña en Bitwarden; hash en `.env.local` y Vercel | `node scripts/hash-password.mjs` y reemplazar el valor |
| `SESSION_SECRET` | Firma de la cookie de sesión (≥ 32 caracteres) | `lib/auth.ts` | Bitwarden; `.env.local`; Vercel | `node scripts/session-secret.mjs`; invalida todas las sesiones |

## Reglas

- Bitwarden **custodia** las credenciales, pero no configura la aplicación: los valores se
  copian a `.env.local` (excluido de Git) o a las variables de entorno de Vercel.
- La **cuenta administradora** de la base de datos solo se usa para `db/schema.sql` y
  `db/permisos.sql`. La aplicación usa `app_riesgos` (SEG-04).
- Ninguna variable lleva el prefijo `NEXT_PUBLIC_`, así que no se incluyen en el código del
  navegador (SEG-02).
- **Entornos separados (SEG-06):** valores distintos en Vercel para Development, Preview y
  Production; idealmente una rama o base de datos distinta para Preview.
- **Si una credencial se expone:** revocarla o cambiarla en el proveedor de inmediato.
  Borrarla del último archivo o commit no elimina la exposición, porque sigue en el historial y
  en cualquier copia.
- No se pegan contraseñas ni tokens en el chat de la IA.
