CREATE TABLE IF NOT EXISTS liquid_materials_conversion_factors (
  Id INT PRIMARY KEY,
  InputUnit INT NOT NULL,
  InputUnitName VARCHAR(100) NOT NULL,
  USGallonsOutput VARCHAR(100) NOT NULL
);
\copy liquid_materials_conversion_factors (Id, InputUnit, InputUnitName, USGallonsOutput) from 'docker-entrypoint-initdb.d/liquid_materials_conversion_factors_202502211207.csv' with header delimiter ',' CSV ;
