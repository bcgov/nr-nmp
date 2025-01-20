CREATE TABLE IF NOT EXISTS crop_types (
  Id INT PRIMARY KEY,
  Name VARCHAR(100) NOT NULL,
  CoverCrop BOOLEAN NOT NULL,
  CrudeProteinRequired BOOLEAN NOT NULL,
  CustomCrop BOOLEAN NOT NULL,
  ModifyNitrogen BOOLEAN NOT NULL
);
\copy crop_types (Id, Name, CoverCrop, CrudeProteinRequired, CustomCrop, ModifyNitrogen) from 'docker-entrypoint-initdb.d/_CropTypes_202501201054.csv' with header delimiter ',' CSV ;
