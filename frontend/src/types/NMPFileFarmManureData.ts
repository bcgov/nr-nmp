import { ManureNutrients } from './calculateNutrients';

export type NMPFileFarmManureData = {
  ManureSource: string;
  MaterialType: string;
  BookLab: string;
  UniqueMaterialName: string;
  Nutrients: ManureNutrients;
};
