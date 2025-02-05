CREATE TABLE IF NOT EXISTS fertilizer_types (
  Id INT PRIMARY KEY,
  Name VARCHAR(100) NOT NULL,
  DryLiquid VARCHAR(100) NOT NULL,
  Custom BOOLEAN NOT NULL,
);
\copy fertilizer_types (Id, Name, DryLiquid, Custom) from 'docker-entrypoint-initdb.d/fertilizer_types_202502051401.csv' with header delimiter ',' CSV ;