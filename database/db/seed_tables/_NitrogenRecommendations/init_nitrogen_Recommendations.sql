CREATE TABLE IF NOT EXISTS temp_nitrogen_recommendations (
  id INT NOT NULL,
  RecommendationDesc TEXT NOT NULL,
  StaticDataVersionId INT NOT NULL,
  PRIMARY KEY (Id, StaticDataVersionId)
);
\copy temp_nitrogen_recommendations (id, RecommendationDesc, StaticDataVersionId) from 'docker-entrypoint-initdb.d/_NitrogenRecommendations__20241212(in).csv' with header delimiter ',' CSV ;
SELECT * INTO nitrogen_recommendations
FROM temp_nitrogen_recommendations
WHERE StaticDataVersionId=14;
ALTER TABLE nitrogen_recommendations
DROP COLUMN StaticDataVersionId;
