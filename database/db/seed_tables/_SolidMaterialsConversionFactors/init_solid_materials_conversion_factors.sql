CREATE TABLE IF NOT EXISTS temp_solid_materials_conversion_factors (
  Id INT NOT NULL,
  InputUnit INT NOT NULL,
  InputUnitName VARCHAR(100) NOT NULL,
  CubicYardsOutput VARCHAR(100) NOT NULL,
  CubicMetersOutput VARCHAR(100) NOT NULL,
  MetricTonsOutput VARCHAR(100) NOT NULL,
  StaticDataVersionId INT NOT NULL,
  PRIMARY KEY (Id, StaticDataVersionId)
);
\copy temp_solid_materials_conversion_factors (Id, InputUnit, InputUnitName, CubicYardsOutput, CubicMetersOutput, MetricTonsOutput, StaticDataVersionId) from 'docker-entrypoint-initdb.d/_SolidMaterialsConversionFactors__20241212(in).csv' with header delimiter ',' CSV ;
SELECT * INTO solid_materials_conversion_factors
FROM temp_solid_materials_conversion_factors
WHERE StaticDataVersionId=14;
ALTER TABLE solid_materials_conversion_factors
DROP COLUMN StaticDataVersionId;
