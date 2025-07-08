CREATE TABLE IF NOT EXISTS density_units (
  Id INT NOT NULL,
  Name VARCHAR(100) NOT NULL,
  ConvFactor FLOAT NOT NULL,
  PRIMARY KEY (Id)
);
\copy density_units (Id, Name, ConvFactor) from 'docker-entrypoint-initdb.d/_DensityUnits.csv' with header delimiter ',' CSV ;