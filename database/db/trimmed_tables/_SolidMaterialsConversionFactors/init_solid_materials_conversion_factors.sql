CREATE TABLE IF NOT EXISTS solid_materials_conversion_factors (
  Id INT PRIMARY KEY,
  InputUnit INT NOT NULL,
  InputUnitName VARCHAR(100) NOT NULL,
  CubicYardsOutput VARCHAR(100) NOT NULL,
  CubicMetersOutput VARCHAR(100) NOT NULL,
  MetricTonsOutput VARCHAR(100) NOT NULL
);
\copy solid_materials_conversion_factors (Id, InputUnit, InputUnitName, CubicYardsOutput, CubicMetersOutput, MetricTonsOutput) from 'docker-entrypoint-initdb.d/solid_materials_conversion_factors_202502211120.csv' with header delimiter ',' CSV ;