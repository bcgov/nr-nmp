CREATE TABLE IF NOT EXISTS manures (
  Id INT NOT NULL,
  Name VARCHAR(100) NOT NULL,
  ManureClass VARCHAR(100) NOT NULL,
  SolidLiquid VARCHAR(100) NOT NULL,
  Moisture VARCHAR(100) NOT NULL,
  Nitrogen FLOAT NOT NULL,
  Ammonia NUMERIC(12, 2),
  Phosphorous FLOAT NOT NULL,
  Potassium FLOAT NOT NULL,
  DryMatterId INT NOT NULL,
  NMineralizationId INT NOT NULL,
  SortNum INT NOT NULL,
  CubicYardConversion FLOAT NOT NULL,
  Nitrate FLOAT NOT NULL,
  DefaultSolidMoisture INT
);
\copy manures (Id,Name,ManureClass,SolidLiquid,Moisture,Nitrogen,Ammonia,Phosphorous,Potassium,DryMatterId,NMineralizationId,SortNum,CubicYardConversion,Nitrate,DefaultSolidMoisture) from 'docker-entrypoint-initdb.d/_Manures_202502181338.csv' with header delimiter ',' QUOTE '"' CSV;