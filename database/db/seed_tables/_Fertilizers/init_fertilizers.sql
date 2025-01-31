CREATE TABLE IF NOT EXISTS temp_fertilizers (
  Id INT NOT NULL,
  Name VARCHAR(100) NOT NULL,
  DryLiquid VARCHAR(100) NOT NULL,
  Nitrogen FLOAT NOT NULL,
  Phosphorous FLOAT NOT NULL,
  Potassium FLOAT NOT NULL,
  SortNum FLOAT NOT NULL,
  StaticDataVersionId INT NOT NULL,
  PRIMARY KEY (Id, StaticDataVersionId)
);
\copy temp_fertilizers (Id, Name, DryLiquid, Nitrogen, Phosphorous, Potassium, SortNum, StaticDataVersionId) from 'docker-entrypoint-initdb.d/_Fertilizers__20241212.csv' with header delimiter ',' CSV ;
SELECT * INTO fertilizers
FROM temp_fertilizers
WHERE StaticDataVersionId=14;
ALTER TABLE fertilizers
DROP COLUMN StaticDataVersionId;
