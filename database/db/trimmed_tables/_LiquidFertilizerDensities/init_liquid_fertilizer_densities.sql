CREATE TABLE IF NOT EXISTS temp_liquid_fertilizer_densities (
  Id INT NOT NULL,
  FertilizerId INT NOT NULL,
  DensityUnitId INT NOT NULL,
  "Value" FLOAT NOT NULL,
  PRIMARY KEY (Id, StaticDataVersionId)
);
\copy temp_liquid_fertilizer_densities (Id, FertilizerId, DensityUnitId, "Value" ) from 'docker-entrypoint-initdb.d/_LiquidFertilizerDensities.csv' with header delimiter ',' CSV ;
SELECT * INTO liquid_fertilizer_densities
FROM temp_liquid_fertilizer_densities
ALTER TABLE liquid_fertilizer_densities
DROP COLUMN StaticDataVersionId;
