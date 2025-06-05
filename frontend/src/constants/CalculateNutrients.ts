import { CropNutrients, NutrientColumns } from '@/types';

export const EMPTY_CROP_NUTRIENTS: CropNutrients = {
  N: 0,
  P2O5: 0,
  K2O: 0,
};

export const EMPTY_NUTRIENT_COLUMNS: NutrientColumns = {
  agronomic: { ...EMPTY_CROP_NUTRIENTS },
  cropRemoval: { ...EMPTY_CROP_NUTRIENTS },
};
