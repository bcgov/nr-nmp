export interface ManureData {
  id: number;
  name: string;
  manureclass: string;
  solidliquid: string;
  moisture: string;
  nitrogen: number;
  ammonia: number;
  phosphorous: number;
  potassium: number;
  drymatterid: number;
  nmineralizationid: number;
  sortnum: number;
  cubicyardconversion: number;
  nitrate: number;
  defaultsolidmoisture: number | null;
}

export interface UnitsData {
  id: number;
  name: string;
  nutrientcontentunits: string;
  conversionlbton: number;
  nutrientrateunits: string;
  costunits: string;
  costapplications: string;
  dollarunitarea: string;
  valuematerialunits: string;
  valuen: string;
  valuep2o5: string;
  valuek2o: string;
  farmreqdnutrientsstdunitsconversion: number;
  farmreqdnutrientsstdunitsareaconversion: number;
  solidliquid: string;
}

export interface NitrogenMineralizationData {
  id: number;
  locationid: number;
  name: string;
  firstyearvalue: number;
  longtermvalue: number;
}
