CREATE TABLE IF NOT EXISTS fertilizer_units (
  Id INT NOT NULL,
  Name VARCHAR(100) NOT NULL,
  DryLiquid VARCHAR(100) NOT NULL,
  ConversionToImperialGallonsPerAcre DECIMAL(10, 9) NOT NULL,
  FarmRequiredNutrientsStdUnitsConversion DECIMAL(10, 9) NOT NULL,
  FarmRequiredNutrientsStdUnitsAreaConversion DECIMAL(12, 9) NOT NULL,
);
\copy fertilizer_units (Id, Name, DryLiquid, ConversionToImperialGallonsPerAcre, FarmRequiredNutrientsStdUnitsConversion, FarmRequiredNutrientsStdUnitsAreaConversion) from 'docker-entrypoint-initdb.d/_FertilizerUnits_202502110920.csv' with header delimiter ',' CSV ;
