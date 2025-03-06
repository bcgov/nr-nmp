CREATE TABLE IF NOT EXISTS crop_soil_potassium_regions (
  id INT PRIMARY KEY,
  CropId INT NOT NULL,
  SoilTestPotassiumRegionCode INT NOT NULL,
  PotassiumCropGroupRegionCode INT NOT NULL
);
\copy crop_soil_potassium_regions (id, CropId, SoilTestPotassiumRegionCode, PotassiumCropGroupRegionCode) from 'docker-entrypoint-initdb.d/crop_soil_potassium_regions_202503040907.csv' with header delimiter ',' CSV ;
