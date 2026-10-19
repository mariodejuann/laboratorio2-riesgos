-- Esquema de la aplicación. Ejecutar con la cuenta ADMINISTRADORA (no con la de la aplicación).
-- Requiere PostgreSQL 13 o superior (gen_random_uuid incluido).

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
  medida_descripcion          varchar(400) NOT NULL,
  medida_prioridad            varchar(10)  NOT NULL CHECK (medida_prioridad IN ('alta', 'media', 'baja')),
  medida_responsable          varchar(120) NOT NULL DEFAULT '',
  medida_verificacion         varchar(400) NOT NULL,
  medida_estado               varchar(12)  NOT NULL CHECK (medida_estado IN ('propuesta', 'implantada', 'verificada')),
  creado_en                   timestamptz  NOT NULL DEFAULT now(),
  actualizado_en              timestamptz  NOT NULL DEFAULT now()
);
