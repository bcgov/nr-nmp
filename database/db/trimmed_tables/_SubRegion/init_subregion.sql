CREATE TABLE IF NOT EXISTS subregion (
  Id INT PRIMARY KEY,
  Name VARCHAR(100) NOT NULL,
  AnnualPrecipitation INT NOT NULL,
  AnnualPrecipitationOctToMar INT NOT NULL,
  RegionId INT NOT NULL
);
\copy subregion (Id, Name, AnnualPrecipitation, AnnualPrecipitationOctToMar, RegionId) from 'docker-entrypoint-initdb.d/_SubRegion_202501271402.csv' with header delimiter ',' CSV ;
