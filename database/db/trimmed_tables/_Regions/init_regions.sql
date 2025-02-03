CREATE TABLE IF NOT EXISTS regions (
  Id INT PRIMARY KEY,
  Name VARCHAR(100) NOT NULL,
  SoilTestPhosphorousRegionCd INT NOT NULL,
  SoilTestPotassiumRegionCd INT NOT NULL,
  LocationId INT NOT NULL,
  SortOrder INT NOT NULL
);
\copy regions (Id, Name, SoilTestPhosphorousRegionCd, SoilTestPotassiumRegionCd, LocationId, SortOrder) from 'docker-entrypoint-initdb.d/_Regions_202501271401.csv' with header delimiter ',' CSV ;
