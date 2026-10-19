-- Mínimo privilegio para la cuenta de la aplicación (SEG-04).
-- Ejecutar con la cuenta ADMINISTRADORA después de db/schema.sql.
--
-- 1) Crea antes el rol de la aplicación SIN escribir la contraseña en este archivo:
--    - Neon:      consola → Branch → Roles → New role → nombre «app_riesgos»
--                 (la contraseña la genera Neon; guárdala en Bitwarden).
--    - Supabase u otro PostgreSQL: en el editor SQL ejecuta
--        CREATE ROLE app_riesgos LOGIN PASSWORD '<pega aquí la generada en Bitwarden>';
--      y no guardes esa línea en ningún archivo del repositorio.
--
-- 2) Después ejecuta este archivo:

REVOKE CREATE ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM app_riesgos;
GRANT USAGE ON SCHEMA public TO app_riesgos;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE riesgos TO app_riesgos;

-- Comprobación (debe fallar con «permission denied» si se ejecuta como app_riesgos):
--   CREATE TABLE prueba (x int);
--   DROP TABLE riesgos;
