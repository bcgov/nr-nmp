export type NutrientObject = { N: number; P: number; K: number };

export type FertilizerFormData = {
  fieldName: string;
  fertilizerType: number;
  fertilizerId: number;
  applicationRate: number;
  applUnit: number;
  liquidDensity: number;
  densityUnits: number;
  availableNutrients: NutrientObject;
  nutrientsStillRequired: NutrientObject;
};
