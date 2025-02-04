CREATE TABLE IF NOT EXISTS temp_animals_subtype (
  Id INT NOT NULL,
  Name VARCHAR(100) NOT NULL,
  LiquidPerGalPerAnimalPerDay FLOAT NOT NULL,
  SolidPerGalPerAnimalPerDay FLOAT NOT NULL,
  SolidPerPoundPerAnimalPerDay FLOAT NOT NULL,
  SolidLiquidSeparationPercentage INT NOT NULL,
  WashWater FLOAT NOT NULL,
  MilkProduction FLOAT NOT NULL,
  AnimalId INT NOT NULL,
  SortOrder INT NOT NULL,
  StaticDataVersionId INT NOT NULL,
  PRIMARY KEY (Id, StaticDataVersionId)
);
\copy temp_animals_subtype (Id, Name, LiquidPerGalPerAnimalPerDay, SolidPerGalPerAnimalPerDay, SolidPerPoundPerAnimalPerDay, SolidLiquidSeparationPercentage, WashWater, MilkProduction, AnimalId, SortOrder, StaticDataVersionId) from 'docker-entrypoint-initdb.d/_AnimalSubType__20241212.csv' with header delimiter ',' CSV ;
SELECT * INTO animal_subtype
FROM temp_animals_subtype
WHERE StaticDataVersionId=14;
ALTER TABLE animal_subtype
DROP COLUMN StaticDataVersionId;
