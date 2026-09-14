export interface CalculateNutrientsRow {
  name: string;
  reqN: number;
  reqP2o5: number;
  reqK2o: number;
  remN: number;
  remP2o5: number;
  remK2o: number;
}

export type InjectionUnit = {
  id: number;
  name: string;
  conversionToImpGallonsPerMinute: number;
};

// eslint-disable-next-line no-shadow
export enum Schedule {
  Monthly = 1,
  Biweekly,
  Weekly,
  Daily,
}

export interface CropNutrients {
  N: number; // Nitrogen
  P2O5: number; // Phosphorous pentoxide
  K2O: number; // Potassium oxide
}

export type DryFertilizerSolubilities = {
  id: number;
  fertilizerId: number;
  solubilityUnitId: number;
  value: number;
};
