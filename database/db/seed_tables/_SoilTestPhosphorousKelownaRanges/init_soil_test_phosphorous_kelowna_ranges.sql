CREATE TABLE IF NOT EXISTS temp_soil_test_phosphorous_kelowna_ranges (
  id INT NOT NULL,
  "Range" VARCHAR(100) NOT NULL,
  RangeLow INT NOT NULL,
  RangeHigh INT NOT NULL,
  StaticDataVersionId INT NOT NULL,
  PRIMARY KEY (Id, StaticDataVersionId)
);
\copy temp_soil_test_phosphorous_kelowna_ranges (id, "Range", RangeLow, RangeHigh, StaticDataVersionId ) from 'docker-entrypoint-initdb.d/_SoilTestPhosphorousKelownaRanges__20241212(in).csv' with header delimiter ',' CSV ;
SELECT * INTO soil_test_phosphorous_kelowna_ranges
FROM temp_soil_test_phosphorous_kelowna_ranges
WHERE StaticDataVersionId=14;
ALTER TABLE soil_test_phosphorous_kelowna_ranges
DROP COLUMN StaticDataVersionId;
ALTER TABLE soil_test_phosphorous_kelowna_ranges
DROP COLUMN "Range";
