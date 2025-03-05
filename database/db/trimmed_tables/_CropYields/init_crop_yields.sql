CREATE TABLE IF NOT EXISTS crop_yields (
  id INT PRIMARY KEY,
  CropId INT NOT NULL,
  LocationId INT NOT NULL,
  Amount FLOAT
);
\copy crop_yields (id, CropId, LocationId, Amount) from 'docker-entrypoint-initdb.d/crop_yields_202503041128.csv' with header delimiter ',' CSV ;
