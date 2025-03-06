CREATE TABLE IF NOT EXISTS soil_test_methods (
  Id INT PRIMARY KEY,
  Name VARCHAR(100) NOT NULL,
  ConvertToKelownaPHLessThan72 FLOAT NOT NULL,
  ConvertToKelownaPHGreaterThan72 FLOAT NOT NULL,
  ConvertToKelownaK FLOAT NOT NULL,
  SortNum INT NOT NULL
);
\copy soil_test_methods (Id, Name, ConvertToKelownaPHLessThan72, ConvertToKelownaPHGreaterThan72, ConvertToKelownaK, SortNum) from 'docker-entrypoint-initdb.d/soil_test_methods_202503030306.csv' with header delimiter ',' CSV ;
