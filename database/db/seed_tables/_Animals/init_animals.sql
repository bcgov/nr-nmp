CREATE TABLE IF NOT EXISTS temp_animals (
  Id INT NOT NULL,
  Name VARCHAR(100) NOT NULL,
  UseSortOrder BOOLEAN NOT NULL,
  StaticDataVersionId INT NOT NULL,
  PRIMARY KEY (Id, StaticDataVersionId)
);
\copy temp_animals (Id, Name, UseSortOrder, StaticDataVersionId) from 'docker-entrypoint-initdb.d/_Animals__20241212.csv' with header delimiter ',' CSV ;
SELECT * INTO animals
FROM temp_animals
WHERE StaticDataVersionId=14;
ALTER TABLE animals
DROP COLUMN StaticDataVersionId;
