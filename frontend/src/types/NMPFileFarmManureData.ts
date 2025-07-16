import { ManureNutrients } from './calculateNutrients';

export type NMPFileFarmManureData = {
  materialSource: string;
  materialType: string;
  bookLab: string;
  // Can't search-and-replace these :(
  UniqueMaterialName: string;
  Nutrients: ManureNutrients;
};
