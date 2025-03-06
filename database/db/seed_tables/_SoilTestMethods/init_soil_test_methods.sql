CREATE TABLE IF NOT EXISTS temp_soil_test_methods (
  Id INT NOT NULL,
  Name VARCHAR(100) NOT NULL,
  ConvertToKelownaPHLessThan72 FLOAT NOT NULL,
  ConvertToKelownaPHGreaterThan72 FLOAT NOT NULL,
  ConvertToKelownaK FLOAT NOT NULL,
  SortNum INT NOT NULL,
  StaticDataVersionId INT NOT NULL,
  PRIMARY KEY (Id, StaticDataVersionId)
);
\copy temp_soil_test_methods (Id, Name, ConvertToKelownaPHLessThan72, ConvertToKelownaPHGreaterThan72, ConvertToKelownaK, SortNum, StaticDataVersionId) from 'docker-entrypoint-initdb.d/_SoilTestMethods__20241212(in).csv' with header delimiter ',' CSV ;
SELECT * INTO soil_test_methods
FROM temp_soil_test_methods
WHERE StaticDataVersionId=14;
ALTER TABLE soil_test_methods
DROP COLUMN StaticDataVersionId;
