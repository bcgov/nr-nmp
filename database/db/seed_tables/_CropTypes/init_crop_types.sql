CREATE TABLE IF NOT EXISTS crop_types (
  Id INT NOT NULL,
  Name VARCHAR(100) NOT NULL,
  CoverCrop BOOLEAN NOT NULL,
  CrudeProteinRequired BOOLEAN NOT NULL,
  CustomCrop BOOLEAN NOT NULL,
  ModifyNitrogen BOOLEAN NOT NULL,
  StaticDataVersionId INT NOT NULL,
  PRIMARY KEY (Id, StaticDataVersionId)
);
\copy crop_types (Id, Name, CoverCrop, CrudeProteinRequired, CustomCrop, ModifyNitrogen, StaticDataVersionId) from 'docker-entrypoint-initdb.d/_CropTypes__20241212.csv' with header delimiter ',' CSV ;