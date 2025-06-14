import { CropNutrients } from '@/types';

export type FertilizerFormData = {
  fieldName: string;
  fertilizerType: number;
  fertilizerId: number;
  applicationRate: number;
  applUnit: number;
  liquidDensity: number;
  densityUnits: number;
  availableNutrients: CropNutrients;
  nutrientsStillRequired: CropNutrients;
};
