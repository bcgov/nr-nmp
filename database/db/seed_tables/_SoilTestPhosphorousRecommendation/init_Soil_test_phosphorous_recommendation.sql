CREATE TABLE IF NOT EXISTS temp_soil_test_phosphorous_recommendation (
  id SERIAL PRIMARY KEY,
  SoilTestPhosphorousRatingId INT NOT NULL,
  SoilTestPhosphorousRatingValue FLOAT NOT NULL,
  SoilTestPhosphorousRecommendationPoundPerAcre FLOAT NOT NULL,
  SoilTestPhosphorousRecommendationUpperLimitPoundPerAcre FLOAT NOT NULL,
  StaticDataVersionId INT NOT NULL
);
\copy temp_soil_test_phosphorous_recommendation (SoilTestPhosphorousRatingId, SoilTestPhosphorousRatingValue, SoilTestPhosphorousRecommendationPoundPerAcre, SoilTestPhosphorousRecommendationUpperLimitPoundPerAcre, StaticDataVersionId ) from 'docker-entrypoint-initdb.d/_SoilTestPhosphorousRecommendation__20241212(in).csv' with header delimiter ',' CSV ;
SELECT * INTO soil_test_phosphorous_recommendation
FROM temp_soil_test_phosphorous_recommendation
WHERE StaticDataVersionId=14;
ALTER TABLE soil_test_phosphorous_recommendation
DROP COLUMN StaticDataVersionId;