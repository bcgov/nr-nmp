CREATE TABLE IF NOT EXISTS soil_test_potassium_kelowna_ranges (
  id INT PRIMARY KEY,
  RangeLow INT NOT NULL,
  RangeHigh INT NOT NULL
);
\copy soil_test_potassium_kelowna_ranges (id, RangeLow, RangeHigh ) from 'docker-entrypoint-initdb.d/soil_test_potassium_kelowna_ranges_202503040908.csv' with header delimiter ',' CSV ;
