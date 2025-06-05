import { ManureNutrients } from './CalculateNutrients';

export type NMPFileFarmManureData = {
  ManureSource: string;
  MaterialType: string;
  BookLab: string;
  UniqueMaterialName: string;
  Nutrients: ManureNutrients;
};
