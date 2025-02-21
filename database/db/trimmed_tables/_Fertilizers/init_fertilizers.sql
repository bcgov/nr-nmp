CREATE TABLE IF NOT EXISTS fertilizers (
  Id INT PRIMARY KEY,
  Name VARCHAR(100) NOT NULL,
  DryLiquid VARCHAR(100) NOT NULL,
  Nitrogen FLOAT NOT NULL,
  Phosphorous FLOAT NOT NULL,
  Potassium FLOAT NOT NULL,
  SortNum FLOAT NOT NULL
);
\copy fertilizers (Id, Name, DryLiquid, Nitrogen, Phosphorous, Potassium, SortNum) from 'docker-entrypoint-initdb.d/_Fertilizers_202501311344.csv' with header delimiter ',' CSV ;