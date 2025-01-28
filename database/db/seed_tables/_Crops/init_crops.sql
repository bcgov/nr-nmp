CREATE TABLE IF NOT EXISTS temp_crops (
  Id INT NOT NULL,
  CropName VARCHAR(100) NOT NULL,
  CropTypeId INT NOT NULL,
  YieldCd FLOAT NOT NULL,
  CropRemovalFactorNitrogen FLOAT NOT NULL,
  CropRemovalFactorP2O5 FLOAT NOT NULL,
  CropRemovalFactorK2O FLOAT NOT NULL,
  NitrogenRecommendationId INT NOT NULL,
  NitrogenRecommendationPoundPerAcre FLOAT,
  NitrogenRecommendationUpperLimitPoundPerAcre FLOAT,
  PreviousCropCode INT NOT NULL,
  SortNumber INT NOT NULL,
  ManureApplicationHistory INT NOT NULL,
  HarvestBushelsPerTon FLOAT,
  StaticDataVersionId INT NOT NULL,
  PRIMARY KEY (Id, StaticDataVersionId)
);
\copy temp_crops (Id, CropName, CropTypeId, YieldCd, CropRemovalFactorNitrogen, CropRemovalFactorP2O5, CropRemovalFactorK2O, NitrogenRecommendationId, NitrogenRecommendationPoundPerAcre, NitrogenRecommendationUpperLimitPoundPerAcre, PreviousCropCode, SortNumber, ManureApplicationHistory, HarvestBushelsPerTon, StaticDataVersionId ) from 'docker-entrypoint-initdb.d/_Crops__20241212.csv' with header delimiter ',' CSV ;
SELECT * INTO crops
FROM temp_crops
WHERE StaticDataVersionId=14;
ALTER TABLE crops
DROP COLUMN StaticDataVersionId;
ALTER TABLE crops
ADD CONSTRAINT fk_crop_type
FOREIGN KEY (CropTypeId) REFERENCES crop_types(Id);
