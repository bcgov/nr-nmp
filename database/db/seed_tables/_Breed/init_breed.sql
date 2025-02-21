CREATE TABLE IF NOT EXISTS temp_breed (
  Id INT NOT NULL,
  BreedName VARCHAR(100) NOT NULL,
  AnimalId INT NOT NULL,
  BreedManureFactor FLOAT NOT NULL,
  StaticDataVersionId INT NOT NULL,
  PRIMARY KEY (Id, StaticDataVersionId)
);
\copy temp_breed (Id, BreedName, AnimalId, BreedManureFactor, StaticDataVersionId) from 'docker-entrypoint-initdb.d/_Breed__20241212.csv' with header delimiter ',' CSV ;
SELECT * INTO breed
FROM temp_breed
WHERE StaticDataVersionId=14;
ALTER TABLE breed
DROP COLUMN StaticDataVersionId;
