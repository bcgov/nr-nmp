export interface NMPFileNutrientAnalysis {
  N: number; // Nitrogen
  P: number; // Phosphorus
  K: number; // Potassium
  manureId: number;
  solidLiquid: 'Solid' | 'Liquid' | '';
  Moisture: string; // Note: This is a weird one. Book val is string but lab val needs to be number
  NH4N: number;
  sourceUuid: string;
  sourceName: string;
  nMineralizationId?: number;
  bookLab: string;
  UniqueMaterialName: string;
  manureName: string;
  // For solid manures in tons, for liquid manures in US gallons
  annualAmount: number;
  // materialRemaining: number;
}
