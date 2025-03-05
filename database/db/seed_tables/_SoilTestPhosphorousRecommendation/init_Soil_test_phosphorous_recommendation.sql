CREATE TABLE IF NOT EXISTS temp_soil_test_phosphorous_recommendation (
  id SERIAL PRIMARY KEY,
  SoilTestPhosphorousKelownaRangeId INT NOT NULL,
  SoilTestPhosphorousRegionCode FLOAT NOT NULL,
  PhosphorousCropGroupRegionCode FLOAT NOT NULL,
  P2O5RecommendationKilogramPerHectare FLOAT NOT NULL,
  StaticDataVersionId INT NOT NULL
);
\copy temp_soil_test_phosphorous_recommendation (SoilTestPhosphorousKelownaRangeId, SoilTestPhosphorousRegionCode, PhosphorousCropGroupRegionCode, P2O5RecommendationKilogramPerHectare, StaticDataVersionId ) from 'docker-entrypoint-initdb.d/_SoilTestPhosphorousRecommendation__20241212(in).csv' with header delimiter ',' CSV ;
SELECT * INTO soil_test_phosphorous_recommendation
FROM temp_soil_test_phosphorous_recommendation
WHERE StaticDataVersionId=14;
ALTER TABLE soil_test_phosphorous_recommendation
DROP COLUMN StaticDataVersionId;