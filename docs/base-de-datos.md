# Base de datos

## Proveedor y tecnología

PostgreSQL a través de Neon (añadido desde el Marketplace de Vercel, plan gratuito).  
La cadena de conexión se lee de la variable de entorno `DATABASE_URL` en el servidor; el navegador nunca la recibe.

---

## Modelo de datos — tabla `riesgos`

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | `uuid` PK | Generado automáticamente con `gen_random_uuid()` |
| `proceso` | `varchar(120)` NOT NULL | Proceso o actividad donde se identifica el riesgo |
| `activo` | `varchar(40)` NOT NULL | Activo afectado (lista cerrada) |
| `objetivo` | `varchar(60)` NOT NULL | Objetivo en riesgo (lista cerrada) |
| `condicion` | `varchar(120)` NOT NULL | Debilidad o condición que facilita el daño |
| `amenaza` | `varchar(120)` NOT NULL | Amenaza que puede provocar el daño |
| `evento` | `varchar(120)` NOT NULL | Evento de riesgo |
| `consecuencia` | `varchar(120)` NOT NULL | Efecto sobre el objetivo |
| `supuesto` | `varchar(400)` NOT NULL | Supuestos o información pendiente que afectan a la evaluación |
| `probabilidad` | `smallint` NOT NULL | 1 (baja), 2 (media), 3 (alta) |
| `justificacion_probabilidad` | `varchar(400)` NOT NULL | Argumento que justifica el valor de probabilidad |
| `impacto` | `smallint` NOT NULL | 1 (menor), 2 (significativo), 3 (grave) |
| `justificacion_impacto` | `varchar(400)` NOT NULL | Argumento que justifica el valor de impacto |
| `puntuacion` | `smallint` GENERATED | `probabilidad × impacto` (calculado en BD) |
| `nivel` | `varchar(5)` GENERATED | `bajo` (1–2), `medio` (3–4), `alto` (6–9) (calculado en BD) |
| `medida_descripcion` | `varchar(400)` NOT NULL | Descripción concreta de la medida propuesta |
| `medida_prioridad` | `varchar(10)` NOT NULL | `alta`, `media` o `baja` |
| `medida_responsable` | `varchar(120)` | Responsable de implantarla (opcional) |
| `medida_verificacion` | `varchar(400)` NOT NULL | Cómo se comprueba la eficacia |
| `medida_estado` | `varchar(12)` NOT NULL | `propuesta`, `implantada` o `verificada` |
| `creado_en` | `timestamptz` NOT NULL | Fecha de creación (por defecto `now()`) |
| `actualizado_en` | `timestamptz` NOT NULL | Fecha de última modificación |

`puntuacion` y `nivel` son columnas generadas (`GENERATED ALWAYS AS … STORED`): la base de datos las calcula a partir de `probabilidad` e `impacto`. La aplicación no puede enviarlas; solo las lee. Esto garantiza que la clasificación es siempre coherente y no puede manipularse desde el cliente.

---

## Cuentas de base de datos

Se usan dos roles para aplicar el principio de mínimo privilegio:

| Cuenta | Variable de entorno | Permisos | Dónde se usa |
|---|---|---|---|
| `admin_migraciones` | `DATABASE_URL_ADMIN` | Propietario del esquema; puede crear y borrar tablas | Solo en local, para aplicar migraciones |
| `app_riesgos` | `DATABASE_URL` | `SELECT`, `INSERT`, `UPDATE`, `DELETE` sobre `riesgos`; sin `CREATE` ni `DROP` | Aplicación en todos los entornos |

Las contraseñas **no aparecen en ningún archivo del repositorio**. Se generan en la consola de Neon (Branch → Roles → New role) y se guardan en Bitwarden.

---

## Archivos de base de datos

| Archivo | Propósito |
|---|---|
| `db/001_crear_riesgos.sql` | Migración 001: crea la tabla `riesgos` con todos sus campos y restricciones |
| `db/roles.sql` | Instrucciones para crear las dos cuentas y asignar permisos mínimos a `app_riesgos` |
| `db/seed.sql` | Datos de prueba para desarrollo local |

---

## Cómo aplicar la migración

**Requisito:** tener `psql` instalado y `DATABASE_URL_ADMIN` configurada en `.env.local`.

```bash
# Cargar las variables de entorno locales
source .env.local   # o en Windows: set /p < .env.local

# Aplicar la migración
psql "$DATABASE_URL_ADMIN" -f db/001_crear_riesgos.sql

# Asignar permisos mínimos a la cuenta de la aplicación
psql "$DATABASE_URL_ADMIN" -f db/roles.sql
```

En Neon también se puede copiar el contenido de cada archivo en el editor SQL de la consola (Branch → SQL Editor), ejecutando primero `001_crear_riesgos.sql` y después `roles.sql`.

La cuenta de la aplicación (`app_riesgos`, `DATABASE_URL`) **no tiene permisos para crear ni borrar tablas**, por lo que no puede ejecutar migraciones por error.
