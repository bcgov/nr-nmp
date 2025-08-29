export interface Manure {
  id: number;
  name: string;
  manureclass: string;
  solidliquid: 'Solid' | 'Liquid' | '';
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

export interface Units {
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
  solidliquid: 'Solid' | 'Liquid' | '';
}

export type NitrogenMineralization = {
  id: number;
  nmineralizationid: number;
  locationid: number;
  name: string;
  firstyearvalue: number;
  longtermvalue: number;
};
