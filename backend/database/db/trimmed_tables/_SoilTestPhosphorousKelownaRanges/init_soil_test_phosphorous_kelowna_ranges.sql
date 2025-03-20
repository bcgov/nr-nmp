CREATE TABLE IF NOT EXISTS soil_test_phosphorous_kelowna_ranges (
  id INT PRIMARY KEY,
  RangeLow INT NOT NULL,
  RangeHigh INT NOT NULL
);
\copy soil_test_phosphorous_kelowna_ranges (id, RangeLow, RangeHigh ) from 'docker-entrypoint-initdb.d/soil_test_phosphorous_kelowna_ranges_202502262156.csv' with header delimiter ',' CSV ;
