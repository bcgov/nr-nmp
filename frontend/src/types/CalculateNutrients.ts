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

export interface NMPFileFertilizer extends CalculateNutrientsColumn {
  fertilizerTypeId: number;
  fertilizerId: number;
  applicationRate: number;
  applUnitId: number;
  applDate?: string;
  applicationMethod: string;
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
  Moisture: string;
  NH4N: number; // Ammonium
}
