CREATE TABLE IF NOT EXISTS liquid_fertilizer_densities (
  Id INT NOT NULL,
  FertilizerId INT NOT NULL,
  DensityUnitId INT NOT NULL,
  "Value" FLOAT NOT NULL,
  PRIMARY KEY (Id, StaticDataVersionId)
);
\copy liquid_fertilizer_densities (Id, FertilizerId, DensityUnitId, "Value" ) from 'docker-entrypoint-initdb.d/_LiquidFertilizerDensities.csv' with header delimiter ',' CSV ;