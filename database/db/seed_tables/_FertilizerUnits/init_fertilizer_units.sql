CREATE TABLE IF NOT EXISTS temp_fertilizer_units (
  Id INT NOT NULL,
  Name VARCHAR(100) NOT NULL,
  DryLiquid VARCHAR(100) NOT NULL,
  ConversionToImperialGallonsPerAcre DECIMAL(10, 9) NOT NULL,
  FarmRequiredNutrientsStdUnitsConversion DECIMAL(10, 9) NOT NULL,
  FarmRequiredNutrientsStdUnitsAreaConversion DECIMAL(12, 9) NOT NULL,
  StaticDataVersionId INT NOT NULL,
  PRIMARY KEY (Id, StaticDataVersionId)
);
\copy temp_fertilizer_units (Id, Name, DryLiquid, ConversionToImperialGallonsPerAcre, FarmRequiredNutrientsStdUnitsConversion, FarmRequiredNutrientsStdUnitsAreaConversion, StaticDataVersionId) from 'docker-entrypoint-initdb.d/_FertilizerUnits__20241212.csv' with header delimiter ',' CSV ;
SELECT * INTO fertilizer_units
FROM temp_fertilizer_units
WHERE StaticDataVersionId=14;
ALTER TABLE fertilizer_units
DROP COLUMN StaticDataVersionId;
