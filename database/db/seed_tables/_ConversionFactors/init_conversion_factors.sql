CREATE TABLE IF NOT EXISTS temp_conversion_factors (
  id INT NOT NULL,
  NitrogenProteinConversion FLOAT NOT NULL,
  UnitConversion FLOAT NOT NULL,
  DefaultSoilTestKelownaPhosphorous FLOAT NOT NULL,
  DefaultSoilTestKelownaPotassium FLOAT NOT NULL,
  KilogramPerHectareToPoundPerAcreConversion FLOAT NOT NULL,
  PotassiumAvailabilityFirstYear FLOAT NOT NULL,
  PotassiumAvailabilityLongTerm FLOAT NOT NULL,
  PotassiumKtoK2OConversion FLOAT NOT NULL,
  PhosphorousAvailabilityFirstYear FLOAT NOT NULL,
  PhosphorousAvailabilityLongTerm FLOAT NOT NULL,
  PhosphorousPtoP2O5Conversion FLOAT NOT NULL,
  PoundPerTonConversion FLOAT NOT NULL,
  PoundPer1000FtSquaredToPoundPerAcreConversion FLOAT NOT NULL,
  DefaultApplicationOfManureInPrevYears FLOAT NOT NULL,
  SoilTestPPMToPoundPerAcreConversion FLOAT NOT NULL,
  StaticDataVersionId INT NOT NULL,
  PRIMARY KEY (Id, StaticDataVersionId)
);
\copy temp_conversion_factors (id, NitrogenProteinConversion, UnitConversion, DefaultSoilTestKelownaPhosphorous, DefaultSoilTestKelownaPotassium, KilogramPerHectareToPoundPerAcreConversion, PotassiumAvailabilityFirstYear, PotassiumAvailabilityLongTerm, PotassiumKtoK2OConversion, PhosphorousAvailabilityFirstYear, PhosphorousAvailabilityLongTerm, PhosphorousPtoP2O5Conversion, PoundPerTonConversion, PoundPer1000FtSquaredToPoundPerAcreConversion, DefaultApplicationOfManureInPrevYears, SoilTestPPMToPoundPerAcreConversion, StaticDataVersionId) from 'docker-entrypoint-initdb.d/_ConversionFactors__20241212(in).csv' with header delimiter ',' CSV ;
SELECT * INTO conversion_factors
FROM temp_conversion_factors
WHERE StaticDataVersionId=14;
ALTER TABLE conversion_factors
DROP COLUMN StaticDataVersionId;
