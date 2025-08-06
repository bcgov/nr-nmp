import { ManureNutrients } from './calculateNutrients';

export type NMPFileFarmManureData = {
  materialSource: string;
  materialType: string;
  nMineralizationId?: number;
  bookLab: string;
  // Can't search-and-replace these :(
  UniqueMaterialName: string;
  Nutrients: ManureNutrients;
};
