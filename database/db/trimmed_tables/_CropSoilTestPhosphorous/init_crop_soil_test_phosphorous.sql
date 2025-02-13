CREATE TABLE IF NOT EXISTS crop_soil_test_phosphorous (
  id INT PRIMARY KEY,
  CropId INT NOT NULL,
  SoilTestPhosphorousRegionCode INT NOT NULL,
  PhosphorousCropGroupRegionCode INT NOT NULL,
  StaticDataVersionId INT NOT NULL
);
\copy crop_soil_test_phosphorous (id, CropId, SoilTestPhosphorousRegionCode, PhosphorousCropGroupRegionCode, StaticDataVersionId) from 'docker-entrypoint-initdb.d/temp_crop_soil_test_phosphorous_202502121711.csv' with header delimiter ',' CSV ;