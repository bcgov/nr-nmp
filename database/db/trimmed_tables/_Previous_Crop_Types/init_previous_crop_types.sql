CREATE TABLE IF NOT EXISTS previous_crop_types (
  Id INT NOT NULL,
  PreviousCropCode INT NOT NULL,
  Name VARCHAR(100) NOT NULL,
  NitrogenCreditMetric INT NOT NULL,
  NitrogenCreditImperial INT NOT NULL,
  CropId INT NOT NULL,
  CropTypeId INT
);
\copy previous_crop_types (Id, PreviousCropCode, Name, NitrogenCreditMetric, NitrogenCreditImperial, CropId, CropTypeId) from 'docker-entrypoint-initdb.d/previous_crops_types_202502101119.csv' with header delimiter ',' CSV ;
