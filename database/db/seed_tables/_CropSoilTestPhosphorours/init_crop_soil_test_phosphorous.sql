CREATE TABLE IF NOT EXISTS temp_crop_soil_test_phosphorous (
  id SERIAL PRIMARY KEY,
  CropId INT NOT NULL,
  SoilTestPhosphorousRegionCode INT NOT NULL,
  PhosphorousCropGroupRegionCode INT NOT NULL,
  StaticDataVersionId INT NOT NULL
);
\copy temp_crop_soil_test_phosphorous (CropId, SoilTestPhosphorousRegionCode, PhosphorousCropGroupRegionCode, StaticDataVersionId) from 'docker-entrypoint-initdb.d/_CropSoilTestPhosphorousRegions__20241212(in).csv' with header delimiter ',' CSV ;
SELECT * INTO crop_soil_test_phosphorous
FROM temp_crop_soil_test_phosphorous
WHERE StaticDataVersionId=14;
ALTER TABLE crop_soil_test_phosphorous
DROP COLUMN StaticDataVersionId;
