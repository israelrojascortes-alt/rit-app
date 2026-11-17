-- Esquema RIT (PostgreSQL 13+). Idempotente: puede ejecutarse varias veces.

CREATE TABLE IF NOT EXISTS rit (
  id               SERIAL PRIMARY KEY,
  creado_en        TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha            DATE        NOT NULL,
  centro_trabajo   TEXT        NOT NULL DEFAULT 'División Radomiro Tomic',
  gerencia         TEXT        NOT NULL,
  superintendencia TEXT        NOT NULL DEFAULT '',
  area             TEXT        NOT NULL,
  supervisor       TEXT        NOT NULL,
  n_asistentes     INTEGER     NOT NULL CHECK (n_asistentes >= 0),
  eecc             TEXT        NOT NULL DEFAULT '',
  n_contrato       TEXT        NOT NULL DEFAULT '',
  nombre_contrato  TEXT        NOT NULL DEFAULT '',
  rfs              TEXT[]      NOT NULL DEFAULT '{}'
);
ALTER TABLE rit ADD COLUMN IF NOT EXISTS turno CHAR(1) NOT NULL DEFAULT 'A';
CREATE INDEX IF NOT EXISTS rit_fecha_idx ON rit (fecha);
CREATE INDEX IF NOT EXISTS rit_eecc_idx ON rit (eecc);

CREATE TABLE IF NOT EXISTS actividad (
  id            SERIAL PRIMARY KEY,
  rit_id        INTEGER NOT NULL REFERENCES rit(id) ON DELETE CASCADE,
  turno         CHAR(1) NOT NULL CHECK (turno IN ('A', 'B')),
  orden         INTEGER NOT NULL,
  descripcion   TEXT    NOT NULL,
  instructivos  BOOLEAN,
  materiales    BOOLEAN,
  herramientas  BOOLEAN,
  epp           BOOLEAN
);
CREATE INDEX IF NOT EXISTS actividad_rit_idx ON actividad (rit_id);

CREATE TABLE IF NOT EXISTS analisis (
  id            SERIAL PRIMARY KEY,
  actividad_id  INTEGER NOT NULL REFERENCES actividad(id) ON DELETE CASCADE,
  orden         INTEGER NOT NULL,
  rf            TEXT    NOT NULL DEFAULT '',
  riesgo        TEXT    NOT NULL DEFAULT '',
  consecuencia  TEXT    NOT NULL DEFAULT '',
  controles     TEXT[]  NOT NULL DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS analisis_actividad_idx ON analisis (actividad_id);

CREATE TABLE IF NOT EXISTS aporte (
  id           SERIAL PRIMARY KEY,
  rit_id       INTEGER NOT NULL REFERENCES rit(id) ON DELETE CASCADE,
  propuesta    TEXT NOT NULL,
  responsable  TEXT NOT NULL DEFAULT '',
  fecha        DATE
);

CREATE TABLE IF NOT EXISTS reconocimiento (
  id      SERIAL PRIMARY KEY,
  rit_id  INTEGER NOT NULL REFERENCES rit(id) ON DELETE CASCADE,
  quien   TEXT NOT NULL,
  motivo  TEXT NOT NULL DEFAULT ''
);

-- Proyección en vivo: borrador que se está llenando desde un celular y se muestra en una pantalla grande.
CREATE TABLE IF NOT EXISTS rit_vivo (
  codigo       TEXT        PRIMARY KEY,
  datos        JSONB       NOT NULL,
  foco         TEXT        NOT NULL DEFAULT '',
  version      INTEGER     NOT NULL DEFAULT 1,
  actualizado  TIMESTAMPTZ NOT NULL DEFAULT now()
);
