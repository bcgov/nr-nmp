CREATE TABLE IF NOT EXISTS temp_liquid_fertilizer_densities (
  Id INT NOT NULL,
  FertilizerId INT NOT NULL,
  DensityUnitId INT NOT NULL,
  "Value" FLOAT NOT NULL,
  StaticDataVersionId INT NOT NULL,
  PRIMARY KEY (Id, StaticDataVersionId)
);
\copy temp_liquid_fertilizer_densities (Id, FertilizerId, DensityUnitId, "Value", StaticDataVersionId ) from 'docker-entrypoint-initdb.d/_LiquidFertilizerDensities.csv' with header delimiter ',' CSV ;
SELECT * INTO liquid_fertilizer_densities
FROM temp_liquid_fertilizer_densities
WHERE StaticDataVersionId=14;
ALTER TABLE liquid_fertilizer_densities
DROP COLUMN StaticDataVersionId;
