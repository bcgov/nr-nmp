CREATE TABLE IF NOT EXISTS temp_crop_types (
  Id INT NOT NULL,
  Name VARCHAR(100) NOT NULL,
  CoverCrop BOOLEAN NOT NULL,
  CrudeProteinRequired BOOLEAN NOT NULL,
  CustomCrop BOOLEAN NOT NULL,
  ModifyNitrogen BOOLEAN NOT NULL,
  StaticDataVersionId INT NOT NULL,
  PRIMARY KEY (Id, StaticDataVersionId)
);
\copy temp_crop_types (Id, Name, CoverCrop, CrudeProteinRequired, CustomCrop, ModifyNitrogen, StaticDataVersionId) from 'docker-entrypoint-initdb.d/_CropTypes__20241212.csv' with header delimiter ',' CSV ;
SELECT * INTO crop_types
FROM temp_crop_types
WHERE StaticDataVersionId=14;
ALTER TABLE crop_types
DROP COLUMN StaticDataVersionId;
