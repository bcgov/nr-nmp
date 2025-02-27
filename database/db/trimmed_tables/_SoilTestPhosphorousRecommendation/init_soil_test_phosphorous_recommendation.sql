CREATE TABLE IF NOT EXISTS soil_test_phosphorous_recommendation (
  id INT PRIMARY KEY,
  SoilTestPhosphorousRatingId INT NOT NULL,
  SoilTestPhosphorousRatingValue FLOAT NOT NULL,
  SoilTestPhosphorousRecommendationPoundPerAcre FLOAT NOT NULL,
  SoilTestPhosphorousRecommendationUpperLimitPoundPerAcre FLOAT NOT NULL
);
\copy soil_test_phosphorous_recommendation (id, SoilTestPhosphorousRatingId, SoilTestPhosphorousRatingValue, SoilTestPhosphorousRecommendationPoundPerAcre, SoilTestPhosphorousRecommendationUpperLimitPoundPerAcre ) from 'docker-entrypoint-initdb.d/soil_test_phosphorous_recommendation_202502201609.csv' with header delimiter ',' CSV ;