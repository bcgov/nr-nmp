CREATE TABLE IF NOT EXISTS crop_soil_test_phosphorous (
  id INT PRIMARY KEY,
  CropId INT NOT NULL,
  SoilTestPhosphorousRegionCode INT NOT NULL,
  PhosphorousCropGroupRegionCode INT NOT NULL
);
\copy crop_soil_test_phosphorous (id, CropId, SoilTestPhosphorousRegionCode, PhosphorousCropGroupRegionCode) from 'docker-entrypoint-initdb.d/crop_soil_test_phosphorous_202502201609.csv' with header delimiter ',' CSV ;