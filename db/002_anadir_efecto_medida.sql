-- Migración 002: añade el campo «efecto esperado» de la medida (prompt 8, punto 3).
-- Ejecutar con la cuenta ADMINISTRADORA (DATABASE_URL_ADMIN) después de 001_crear_riesgos.sql.
--
-- Cómo aplicar:
--   psql "$DATABASE_URL_ADMIN" -f db/002_anadir_efecto_medida.sql

ALTER TABLE riesgos
  ADD COLUMN IF NOT EXISTS medida_efecto varchar(400) NOT NULL DEFAULT '';
