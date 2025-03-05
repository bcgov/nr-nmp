CREATE TABLE IF NOT EXISTS soil_test_phosphorous_recommendation (
  id INT PRIMARY KEY,
  SoilTestPhosphorousKelownaRangeId INT NOT NULL,
  SoilTestPhosphorousRegionCode FLOAT NOT NULL,
  PhosphorousCropGroupRegionCode FLOAT NOT NULL,
  P2O5RecommendationKilogramPerHectare FLOAT NOT NULL
);
\copy soil_test_phosphorous_recommendation (id, SoilTestPhosphorousKelownaRangeId, SoilTestPhosphorousRegionCode, PhosphorousCropGroupRegionCode, P2O5RecommendationKilogramPerHectare ) from 'docker-entrypoint-initdb.d/soil_test_phosphorous_recommendation_202503031410.csv' with header delimiter ',' CSV ;