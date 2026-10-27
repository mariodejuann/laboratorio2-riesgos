-- Migración 001: crea la tabla riesgos.
-- Ejecutar con la cuenta ADMINISTRADORA (DATABASE_URL_ADMIN), nunca con la de la aplicación.
-- Requiere PostgreSQL 13 o superior (gen_random_uuid incluido).
--
-- Cómo aplicar:
--   psql "$DATABASE_URL_ADMIN" -f db/001_crear_riesgos.sql
-- En Neon también se puede pegar en el editor SQL de la consola (Branch → SQL Editor).

CREATE TABLE IF NOT EXISTS riesgos (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proceso                     varchar(120) NOT NULL,
  activo                      varchar(40)  NOT NULL CHECK (activo IN ('plataforma web', 'base de datos', 'copias de seguridad')),
  objetivo                    varchar(60)  NOT NULL CHECK (objetivo IN ('completar solicitudes en plazo', 'conservar y recuperar registros')),
  condicion                   varchar(120) NOT NULL,
  amenaza                     varchar(120) NOT NULL,
  evento                      varchar(120) NOT NULL,
  consecuencia                varchar(120) NOT NULL,
  supuesto                    varchar(400) NOT NULL DEFAULT '',
  probabilidad                smallint     NOT NULL CHECK (probabilidad BETWEEN 1 AND 3),
  justificacion_probabilidad  varchar(400) NOT NULL,
  impacto                     smallint     NOT NULL CHECK (impacto BETWEEN 1 AND 3),
  justificacion_impacto       varchar(400) NOT NULL,
  puntuacion                  smallint GENERATED ALWAYS AS (probabilidad * impacto) STORED,
  nivel                       varchar(5) GENERATED ALWAYS AS (
                                CASE WHEN probabilidad * impacto >= 6 THEN 'alto'
                                     WHEN probabilidad * impacto >= 3 THEN 'medio'
                                     ELSE 'bajo' END
                              ) STORED,
  medida_descripcion          varchar(400) NOT NULL,
  medida_prioridad            varchar(10)  NOT NULL CHECK (medida_prioridad IN ('alta', 'media', 'baja')),
  medida_responsable          varchar(120) NOT NULL DEFAULT '',
  medida_verificacion         varchar(400) NOT NULL,
  medida_estado               varchar(12)  NOT NULL CHECK (medida_estado IN ('propuesta', 'implantada', 'verificada')),
  creado_en                   timestamptz  NOT NULL DEFAULT now(),
  actualizado_en              timestamptz  NOT NULL DEFAULT now()
);
