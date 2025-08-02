export interface Manure {
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
  solidliquid: string;
}

/*
TODO: Reinclude if these are used somewhere, delete otherwise

export interface NitrogenMineralization {
  id: number;
  locationid: number;
  name: string;
  firstyearvalue: number;
  longtermvalue: number;
}

export interface NutrientInputs {
  N_FirstYear: number;
  P2O5_FirstYear: number;
  K2O_FirstYear: number;
  N_LongTerm: number;
  P2O5_LongTerm: number;
  K2O_LongTerm: number;
}

export interface NMineralizationResult {
  OrganicN_FirstYear: number;
  OrganicN_LongTerm: number;
}
*/
