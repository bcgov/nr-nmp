CREATE TABLE IF NOT EXISTS temp_subregions (
  Id INT NOT NULL,
  Name VARCHAR(100) NOT NULL,
  AnnualPrecipitation INT NOT NULL,
  AnnualPrecipitationOctToMar INT NOT NULL,
  RegionId INT NOT NULL,
  StaticDataVersionId INT NOT NULL,
  PRIMARY KEY (Id, StaticDataVersionId)
);
\copy temp_subregions (Id, Name, AnnualPrecipitation, AnnualPrecipitationOctToMar, RegionId, StaticDataVersionId) from 'docker-entrypoint-initdb.d/_SubRegion__20241212.csv' with header delimiter ',' CSV ;
SELECT * INTO subregion
FROM temp_subregions
WHERE StaticDataVersionId=14;
ALTER TABLE subregion
DROP COLUMN StaticDataVersionId;
