CREATE TABLE IF NOT EXISTS animal_subtype (
  Id INT PRIMARY KEY,
  Name VARCHAR(100) NOT NULL,
  LiquidPerGalPerAnimalPerDay FLOAT NOT NULL,
  SolidPerGalPerAnimalPerDay FLOAT NOT NULL,
  SolidPerPoundPerAnimalPerDay FLOAT NOT NULL,
  SolidLiquidSeparationPercentage INT NOT NULL,
  WashWater FLOAT NOT NULL,
  MilkProduction FLOAT NOT NULL,
  AnimalId INT NOT NULL,
  SortOrder INT NOT NULL
);
\copy animal_subtype (Id, Name, LiquidPerGalPerAnimalPerDay, SolidPerGalPerAnimalPerDay, SolidPerPoundPerAnimalPerDay, SolidLiquidSeparationPercentage, WashWater, MilkProduction, AnimalId, SortOrder) from 'docker-entrypoint-initdb.d/_AnimalSubType_202501271401.csv' with header delimiter ',' CSV ;
