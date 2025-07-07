CREATE TABLE IF NOT EXISTS temp_density_units (
  Id INT NOT NULL,
  Name VARCHAR(100) NOT NULL,
  ConvFactor FLOAT NOT NULL,
  PRIMARY KEY (Id)
);
\copy temp_density_units (Id, Name, ConvFactor) from 'docker-entrypoint-initdb.d/_DensityUnits.csv' with header delimiter ',' CSV ;
SELECT * INTO density_units
FROM temp_density_units
ALTER TABLE density_units
DROP COLUMN StaticDataVersionId;
