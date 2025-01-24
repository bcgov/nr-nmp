CREATE TABLE IF NOT EXISTS animals (
  Id INT PRIMARY KEY,
  Name VARCHAR(100) NOT NULL,
  UseSortOrder BOOLEAN NOT NULL
);
\copy animals (Id, Name, UseSortOrder) from 'docker-entrypoint-initdb.d/_Animals_202501201453.csv' with header delimiter ',' CSV ;
