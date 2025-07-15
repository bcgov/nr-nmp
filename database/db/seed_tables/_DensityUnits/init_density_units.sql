CREATE TABLE IF NOT EXISTS temp_density_units (
  Id INT NOT NULL,
  Name VARCHAR(100) NOT NULL,
  ConvFactor FLOAT NOT NULL,
  StaticDataVersionId INT NOT NULL,
  PRIMARY KEY (Id, StaticDataVersionId)
);
\copy temp_density_units (Id, Name, ConvFactor, StaticDataVersionId ) from 'docker-entrypoint-initdb.d/_DensityUnits.csv' with header delimiter ',' CSV ;
SELECT * INTO density_units
FROM temp_density_units
WHERE StaticDataVersionId=14;
ALTER TABLE density_units
DROP COLUMN StaticDataVersionId;
