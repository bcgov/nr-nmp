CREATE TABLE IF NOT EXISTS temp_regions (
  Id INT NOT NULL,
  Name VARCHAR(100) NOT NULL,
  SoilTestPhosphorousRegionCd INT NOT NULL,
  SoilTestPotassiumRegionCd INT NOT NULL,
  LocationId INT NOT NULL,
  SortOrder INT NOT NULL,
  StaticDataVersionId INT NOT NULL,
  PRIMARY KEY (Id, StaticDataVersionId)
);
\copy temp_regions (Id, Name, SoilTestPhosphorousRegionCd, SoilTestPotassiumRegionCd, LocationId, SortOrder, StaticDataVersionId) from 'docker-entrypoint-initdb.d/_Regions__20241212.csv' with header delimiter ',' CSV ;
SELECT * INTO regions
FROM temp_regions
WHERE StaticDataVersionId=14;
ALTER TABLE regions
DROP COLUMN StaticDataVersionId;
