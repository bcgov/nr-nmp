CREATE TABLE IF NOT EXISTS soil_test_potassium_recommendation (
  id INT PRIMARY KEY,
  SoilTestPotassiumKelownaRangeId INT NOT NULL,
  SoilTestPotassiumRegionCode FLOAT NOT NULL,
  PotassiumCropGroupRegionCode FLOAT NOT NULL,
  K2ORecommendationKilogramPerHectare FLOAT NOT NULL
);
\copy soil_test_potassium_recommendation (id, SoilTestPotassiumKelownaRangeId, SoilTestPotassiumRegionCode, PotassiumCropGroupRegionCode, K2ORecommendationKilogramPerHectare ) from 'docker-entrypoint-initdb.d/soil_test_potassium_recommendation_202503040908.csv' with header delimiter ',' CSV ;
