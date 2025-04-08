export interface ManureNutrients {
  Moisture: string;
  N: number;
  NH4N: number;
  P: number;
  K: number;
}

export interface NMPFileFarmManureData {
  ManureSource: string;
  MaterialType: string;
  BookLab: string;
  UniqueMaterialName: string;
  Nutrients: ManureNutrients;
}
