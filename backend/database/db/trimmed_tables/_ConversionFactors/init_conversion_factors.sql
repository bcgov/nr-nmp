CREATE TABLE IF NOT EXISTS conversion_factors (
  id INT PRIMARY KEY,
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
  SoilTestPPMToPoundPerAcreConversion FLOAT NOT NULL
);
\copy conversion_factors (id, NitrogenProteinConversion, UnitConversion, DefaultSoilTestKelownaPhosphorous, DefaultSoilTestKelownaPotassium, KilogramPerHectareToPoundPerAcreConversion, PotassiumAvailabilityFirstYear, PotassiumAvailabilityLongTerm, PotassiumKtoK2OConversion, PhosphorousAvailabilityFirstYear, PhosphorousAvailabilityLongTerm, PhosphorousPtoP2O5Conversion, PoundPerTonConversion, PoundPer1000FtSquaredToPoundPerAcreConversion, DefaultApplicationOfManureInPrevYears, SoilTestPPMToPoundPerAcreConversion) from 'docker-entrypoint-initdb.d/conversion_factors_202503030526.csv' with header delimiter ',' CSV ;
