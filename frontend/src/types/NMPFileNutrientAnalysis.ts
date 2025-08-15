import { ManureNutrients } from './CalculateNutrients';

export interface NMPFileNutrientAnalysis extends ManureNutrients {
  materialSource: string;
  linkedUuid: string;
  nMineralizationId?: number;
  bookLab: string;
  UniqueMaterialName: string;
  materialType: string;
}
