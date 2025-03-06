CREATE TABLE IF NOT EXISTS temp_soil_test_potassium_recommendation (
  id SERIAL PRIMARY KEY,
  SoilTestPotassiumKelownaRangeId INT NOT NULL,
  SoilTestPotassiumRegionCode FLOAT NOT NULL,
  PotassiumCropGroupRegionCode FLOAT NOT NULL,
  K2ORecommendationKilogramPerHectare FLOAT NOT NULL,
  StaticDataVersionId INT NOT NULL
);
\copy temp_soil_test_potassium_recommendation (SoilTestPotassiumKelownaRangeId, SoilTestPotassiumRegionCode, PotassiumCropGroupRegionCode, K2ORecommendationKilogramPerHectare, StaticDataVersionId ) from 'docker-entrypoint-initdb.d/_SoilTestPotassiumRecommendation__20241212(in).csv' with header delimiter ',' CSV ;
SELECT * INTO soil_test_potassium_recommendation
FROM temp_soil_test_potassium_recommendation
WHERE StaticDataVersionId=14;
ALTER TABLE soil_test_potassium_recommendation
DROP COLUMN StaticDataVersionId;
