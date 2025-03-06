CREATE TABLE IF NOT EXISTS temp_previous_crop_types (
  Id INT NOT NULL,
  PreviousCropCode INT NOT NULL,
  Name VARCHAR(100) NOT NULL,
  NitrogenCreditMetric INT NOT NULL,
  NitrogenCreditImperial INT NOT NULL,
  CropId INT NOT NULL,
  CropTypeId INT,
  StaticDataVersionId INT NOT NULL,
  CropTypeStaticDataVersionId INT,
  PRIMARY KEY (Id, StaticDataVersionId)
);
\copy temp_previous_crop_types (Id, PreviousCropCode, Name, NitrogenCreditMetric, NitrogenCreditImperial, CropId, CropTypeId, StaticDataVersionId, CropTypeStaticDataVersionId) from 'docker-entrypoint-initdb.d/_PreviousCropType__20241212(in).csv' with header delimiter ',' CSV ;
SELECT * INTO previous_crops_types
FROM temp_previous_crop_types
WHERE StaticDataVersionId=14;
ALTER TABLE previous_crops_types
DROP COLUMN StaticDataVersionId;
ALTER TABLE previous_crops_types
DROP COLUMN CropTypeStaticDataVersionId;
