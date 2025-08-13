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

export interface NMPFileFertigation extends CalculateNutrientsColumn {
  fertilizerTypeId: number;
  fertilizerId: number;
  applicationRate?: number;
  applUnitId?: number;
  density?: number;
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
  // Calculations for liquid
  volume: number;
  volumeForSeason: number;
  applicationTime: number;
}

export interface CropNutrients {
  N: number; // Nitrogen
  P2O5: number; // Phosphorus pentoxide
  K2O: number; // Potassium oxide
}

// TODO: Maybe choose better name?
export type NutrientColumns = {
  agronomic: CropNutrients; // "This year"
  cropRemoval: CropNutrients; // "Long term"
};

export interface ManureNutrients extends CropNutrients {
  ManureId: number;
  SolidLiquid: string;
  Moisture: string; // Note: This is a weird one. Book val is string but lab val needs to be number?
  NH4N: number;
}

export type NutrientManures = {
  manureId: number;
  applicationId: number;
  unitId: number;
  rate: number;
  nh4Retention: number;
  nAvail: number;
  reqN: number;
  reqP2o5: number;
  reqK2o: number;
  remN: number;
  remP2o5: number;
  remK2o: number;
};

export type NMPNutrients = {
  nutrientManures: NutrientManures[];
};

export type DryFertilizerSolubility = {
  id: number;
  fertilizerId: number;
  solubilityUnitId: number;
  value: number;
};
