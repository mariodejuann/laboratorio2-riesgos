-- Crea las dos cuentas de base de datos. NO incluye contraseñas.
-- Las contraseñas se generan en el proveedor (Neon: Branch → Roles → New role)
-- y se guardan en Bitwarden. Nunca se escriben en este archivo ni en el repositorio.
--
-- Ejecutar con el superusuario del proveedor (cuenta de administración de Neon).
--
-- Cuenta 1 — administradora (solo para aplicar migraciones):
--   Crear en Neon: Branch → Roles → New role → nombre «admin_migraciones»
--   La contraseña la genera Neon; guárdala en Bitwarden.
--   Asignar como propietaria de la base de datos (o darle CREATETABLE) para poder
--   ejecutar las migraciones.
--
-- Cuenta 2 — aplicación (mínimo privilegio):
--   Crear en Neon: Branch → Roles → New role → nombre «app_riesgos»
--   La contraseña la genera Neon; guárdala en Bitwarden.

-- Permisos mínimos para la cuenta de la aplicación sobre la tabla riesgos.
-- Ejecutar como admin_migraciones (o el superusuario) después de 001_crear_riesgos.sql.
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM app_riesgos;
GRANT USAGE ON SCHEMA public TO app_riesgos;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE riesgos TO app_riesgos;

-- Comprobación: ejecutando como app_riesgos, esto debe fallar con «permission denied»:
--   CREATE TABLE prueba (x int);
--   DROP TABLE riesgos;
