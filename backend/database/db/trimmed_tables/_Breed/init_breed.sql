CREATE TABLE IF NOT EXISTS breed (
  Id INT PRIMARY KEY,
  BreedName VARCHAR(100) NOT NULL,
  AnimalId INT NOT NULL,
  BreedManureFactor FLOAT NOT NULL
);
\copy breed (Id, BreedName, AnimalId, BreedManureFactor) from 'docker-entrypoint-initdb.d/_Breed_202502180812.csv' with header delimiter ',' CSV ;
