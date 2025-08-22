export interface CalculateNutrientsColumn {
  name: string;
  reqN: number;
  reqP2o5: number;
  reqK2o: number;
  remN: number;
  remP2o5: number;
  remK2o: number;
}

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

export type FertilizerType = {
  id: number;
  name: string;
  dryliquid: string;
  custom: boolean;
};

export type FertilizerUnit = {
  id: number;
  name: string;
  dryliquid: string;
  conversiontoimperialgallonsperacre: number;
  farmrequirednutrientsstdunitsconversion: number;
  farmrequirednutrientsstdunitsareaconversion: number;
};

export type DensityUnit = {
  id: number;
  name: string;
  // Conversion factor to get from unit to lb/imp gallon
  convfactor: number;
};

export type InjectionUnit = {
  id: number;
  name: string;
  conversionToImpGallonsPerMinute: number;
};

export interface NMPFileFertilizer extends CalculateNutrientsColumn {
  fertilizerTypeId: number;
  fertilizerId: number;
  applicationRate: number;
  applUnitId: number;
  applDate?: string;
  applicationMethod: string;
  density?: number;
  densityUnitId?: number;
}

// eslint-disable-next-line no-shadow
export enum Schedule {
  Monthly = 1,
  Biweekly,
  Weekly,
  Daily,
}

export interface CropNutrients {
  N: number; // Nitrogen
  P2O5: number; // Phosphorus pentoxide
  K2O: number; // Potassium oxide
}

export interface NMPFileFertigation extends CalculateNutrientsColumn {
  fertilizerTypeId: number;
  fertilizerId: number;
  customNutrients?: CropNutrients;
  applicationRate: number;
  applUnitId?: number;
  applUnitName?: string;
  density: number;
  densityUnitId?: number;
  tankVolume: number;
  tankUnitId?: number;
  solubility: number;
  solubilityUnitId?: number;
  amountToDissolve: number;
  amountToDissolveUnitId?: number;
  injectionRate: number;
  injectionUnitId?: number;
  eventsPerSeason: number;
  applicationPeriod: number;
  schedule?: Schedule;
  startDate?: string;
  // Calculations for liquid
  volume: number;
  volumeForSeason: number;
  applicationTime: number;
  // Additional fields for dry fertigation
  dryAction?: 'Soluble' | 'Reduce the amount to dissolve';
  nutrientConcentrationN?: number;
  nutrientConcentrationP2O5?: number;
  nutrientConcentrationK2O?: number;
  kglNutrientConcentrationN?: number;
  kglNutrientConcentrationP2O5?: number;
  kglNutrientConcentrationK2O?: number;
}

export interface ManureNutrients extends CropNutrients {
  ManureId: number;
  SolidLiquid: string;
  Moisture: string; // Note: This is a weird one. Book val is string but lab val needs to be number
  NH4N: number;
}

export interface NMPFileAppliedManure extends CalculateNutrientsColumn {
  manureId: number;
  applicationId: number;
  unitId: number;
  rate: number;
  nh4Retention: number;
  nAvail: number;
}

export type DryFertilizerSolubilities = {
  id: number;
  fertilizerId: number;
  solubilityUnitId: number;
  value: number;
};
