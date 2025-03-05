CREATE TABLE IF NOT EXISTS temp_crop_soil_potassium_regions (
  id SERIAL PRIMARY KEY,
  CropId INT NOT NULL,
  SoilTestPotassiumRegionCode INT NOT NULL,
  PotassiumCropGroupRegionCode INT NOT NULL,
  StaticDataVersionId INT NOT NULL
);
\copy temp_crop_soil_potassium_regions (CropId, SoilTestPotassiumRegionCode, PotassiumCropGroupRegionCode, StaticDataVersionId) from 'docker-entrypoint-initdb.d/_CropSoilTestPotassiumRegions__20241212(in).csv' with header delimiter ',' CSV ;
SELECT * INTO crop_soil_potassium_regions
FROM temp_crop_soil_potassium_regions
WHERE StaticDataVersionId=14;
ALTER TABLE crop_soil_potassium_regions
DROP COLUMN StaticDataVersionId;
