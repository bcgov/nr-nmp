CREATE TABLE IF NOT EXISTS temp_liquid_materials_conversion_factors (
  Id INT NOT NULL,
  InputUnit INT NOT NULL,
  InputUnitName VARCHAR(100) NOT NULL,
  USGallonsOutput VARCHAR(100) NOT NULL,
  StaticDataVersionId INT NOT NULL,
  PRIMARY KEY (Id, StaticDataVersionId)
);
\copy temp_liquid_materials_conversion_factors (Id, InputUnit, InputUnitName, USGallonsOutput, StaticDataVersionId ) from 'docker-entrypoint-initdb.d/_LiquidMaterialsConversionFactors__20241212(in).csv' with header delimiter ',' CSV ;
SELECT * INTO liquid_materials_conversion_factors
FROM temp_liquid_materials_conversion_factors
WHERE StaticDataVersionId=14;
ALTER TABLE liquid_materials_conversion_factors
DROP COLUMN StaticDataVersionId;
