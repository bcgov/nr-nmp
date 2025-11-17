// _AmmoniaRetentions
export type AmmoniaRetention = {
  id: number;
  seasonapplicationid: number;
  drymatter: number;
  value: number;
};

// _Animals
export type Animal = {
  id: number;
  name: string;
  usesortorder: boolean;
};

// _AnimalSubType
export type AnimalSubtype = {
  id: number;
  name: string;
  liquidpergalperanimalperday: number;
  solidpergalperanimalperday: number;
  solidperpoundperanimalperday: number;
  solidliquidseparationpercentage: number;
  washwater: number;
  milkproduction: number;
  animalid: number;
  sortorder: number;
};

// _Breed
export type DairyCattleBreed = {
  id: number;
  breedname: string;
  animalid: number;
  breedmanurefactor: number;
};

// _ConversionFactors
export type CropsConversionFactors = {
  nitrogenproteinconversion: number;
  unitconversion: number;
  defaultsoiltestkelownaphosphorous: number;
  defaultsoiltestkelownapotassium: number;
  kilogramperhectaretopoundperacreconversion: number;
  potassiumavailabilityfirstyear: number;
  potassiumavailabilitylongterm: number;
  potassiumktok2oconversion: number;
  phosphorousavailabilityfirstyear: number;
  phosphorousavailabilitylongterm: number;
  phosphorousptop2o5conversion: number;
  poundpertonconversion: number;
  poundper1000ftsquaredtopoundperacreconversion: number;
  defaultapplicationofmanureinprevyears: number;
  soiltestppmtopoundperacreconversion: number;
};

// _Crops
export type Crop = {
  cropname: string;
  cropremovalfactork2o: number;
  cropremovalfactornitrogen: number;
  cropremovalfactorp2o5: number;
  croptypeid: number;
  harvestbushelsperton: number;
  id: number;
  manureapplicationhistory: number;
  nitrogenrecommendationid: number;
  nitrogenrecommendationpoundperacre: number;
  nitrogenrecommendationupperlimitpoundperacre: number;
  previouscropcode: number;
  sortnumber: number;
  yieldcd: number;
};

// _CropTypes
export type CropType = {
  id: number;
  name: string;
  covercrop: boolean;
  crudeproteinrequired: boolean;
  customcrop: boolean;
  modifynitrogen: boolean;
};

// _DensityUnits
export type DensityUnit = {
  id: number;
  name: string;
  // Conversion factor to get from unit to lb/imp gallon
  convfactor: number;
};

// _Fertilizers
export interface Fertilizer {
  id: number;
  name: string;
  dryliquid: 'dry' | 'liquid';
  fertigation: boolean;
  nitrogen: number;
  phosphorous: number;
  potassium: number;
  sortnum: number;
}

// _FertilizerTypes
export type FertilizerType = {
  id: number;
  name: string;
  dryliquid: string;
  custom: boolean;
};

// _FertilizerUnits
export type FertilizerUnit = {
  id: number;
  name: string;
  dryliquid: string;
  conversiontoimperialgallonsperacre: number;
  farmrequirednutrientsstdunitsconversion: number;
  farmrequirednutrientsstdunitsareaconversion: number;
};

export type LiquidFertilizerDensity = {
  id: number;
  fertilizerid: number;
  densityunitid: number;
  value: number;
};

// _LiquidMaterialsConversionFactors
export type LiquidManureConversionFactors = {
  id?: number;
  inputunit?: number;
  inputunitname?: string;
  usgallonsoutput?: string;
};

// _Manures
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

// _NitrogenMineralizations
export type NitrogenMineralization = {
  id: number;
  nmineralizationid: number;
  locationid: number;
  name: string;
  firstyearvalue: number;
  longtermvalue: number;
};

// _Previous_Crop_Types
export type PreviousCrop = {
  id: number;
  previouscropcode: number;
  name: string;
  nitrogencreditmetric: number;
  nitrogencreditimperial: number;
  cropid: number;
  croptypeid: number;
};

// _Region
export interface Region {
  id: number;
  name: string;
  soiltestphosphorousregioncd: number;
  soiltestpotassiumregioncd: number;
  locationid: number;
  sortorder: number;
}

// _SoilTestMethods
export type SoilTestMethods = {
  id: number;
  name: string;
  converttokelownaphlessthan72: number;
  converttokelownaphgreaterthan72: number;
  converttokelownak: number;
  sortnum: number;
};

export type SoilTestPhosphorousRange = {
  id: number;
  upperlimit: number;
  rating: string;
};

export type SoilTestPotassiumRange = {
  id: number;
  upperlimit: number;
  rating: string;
};

// _SolidMaterialsConversionFactors
export interface SolidManureConversionFactors {
  id: number;
  inputunit: number;
  inputunitname: string;
  cubicyardsoutput: string;
  cubicmetersoutput: string;
  ustonsoutput: string;
}

// _SolidMaterialApplicationTonPerAcreRateConversions
export interface SolidMaterialApplicationTonPerAcreRateConversions {
  id: number;
  applicationrateunit: number;
  applicationrateunitname: string;
  tonsperacreconversion: string;
}

// _LiquidMaterialApplicationUsGallonsPerAcreRateConversions
export interface LiquidMaterialApplicationUsGallonsPerAcreRateConversions {
  id: number;
  applicationrateunit: number;
  applicationrateunitname: string;
  usgallonsperacreconversion: number;
}

// _SubRegion
export interface Subregion {
  id: number;
  name: string;
  annualprecipitation: number;
  annualprecipitationocttomar: number;
  regionid: number;
}

// _Units
// These are used as units for manure
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
