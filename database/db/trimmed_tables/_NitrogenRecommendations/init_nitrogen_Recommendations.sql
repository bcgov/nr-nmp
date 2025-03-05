CREATE TABLE IF NOT EXISTS nitrogen_recommendations (
  id INT NOT NULL,
  RecommendationDesc TEXT NOT NULL
);
\copy nitrogen_recommendations (id, RecommendationDesc) from 'docker-entrypoint-initdb.d/nitrogen_recommendations_202503041129.csv' with header delimiter ',' CSV ;
