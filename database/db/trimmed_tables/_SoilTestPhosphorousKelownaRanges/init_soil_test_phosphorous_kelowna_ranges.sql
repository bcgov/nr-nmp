CREATE TABLE IF NOT EXISTS temp_soil_test_phosphorous_kelowna_ranges (
  id INT PRIMARY KEY,
  RangeLow INT NOT NULL,
  RangeHigh INT NOT NULL
);
\copy temp_soil_test_phosphorous_kelowna_ranges (id, RangeLow, RangeHigh ) from 'docker-entrypoint-initdb.d/soil_test_phosphorous_kelowna_ranges_202502262156.csv' with header delimiter ',' CSV ;
