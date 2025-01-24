CREATE TABLE IF NOT EXISTS crops (
  Id INT PRIMARY KEY,
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
  CONSTRAINT fk_crop_type FOREIGN KEY (CropTypeId) REFERENCES crop_types(Id)
);

\copy crops (Id, CropName, CropTypeId, YieldCd, CropRemovalFactorNitrogen, CropRemovalFactorP2O5, CropRemovalFactorK2O, NitrogenRecommendationId, NitrogenRecommendationPoundPerAcre, NitrogenRecommendationUpperLimitPoundPerAcre, PreviousCropCode, SortNumber, ManureApplicationHistory, HarvestBushelsPerTon) from 'docker-entrypoint-initdb.d/_Crops_202501211005.csv' with header delimiter ',' CSV ;
