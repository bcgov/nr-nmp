CREATE TABLE IF NOT EXISTS temp_crop_yields (
  id SERIAL PRIMARY KEY,
  CropId INT NOT NULL,
  LocationId INT NOT NULL,
  Amount FLOAT,
  StaticDataVersionId INT NOT NULL
);
\copy temp_crop_yields (CropId, LocationId, Amount, StaticDataVersionId) from 'docker-entrypoint-initdb.d/_CropYields__20241212(in).csv' with header delimiter ',' CSV ;
SELECT * INTO crop_yields
FROM temp_crop_yields
WHERE StaticDataVersionId=14;
ALTER TABLE crop_yields
DROP COLUMN StaticDataVersionId;
