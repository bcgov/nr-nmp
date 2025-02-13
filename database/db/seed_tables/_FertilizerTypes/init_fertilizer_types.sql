CREATE TABLE IF NOT EXISTS temp_fertilizer_types (
  Id INT NOT NULL,
  Name VARCHAR(100) NOT NULL,
  DryLiquid VARCHAR(100) NOT NULL,
  Custom BOOLEAN NOT NULL,
  StaticDataVersionId INT NOT NULL,
  PRIMARY KEY (Id, StaticDataVersionId)
);
\copy temp_fertilizer_types (Id, Name, DryLiquid, Custom, StaticDataVersionId) from 'docker-entrypoint-initdb.d/_FertilizerTypes_20241212.csv' with header delimiter ',' CSV ;
SELECT * INTO fertilizer_types
FROM temp_fertilizer_types
WHERE StaticDataVersionId=14;
ALTER TABLE fertilizer_types
DROP COLUMN StaticDataVersionId;
