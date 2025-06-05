export type ManureNutrients = {
  Moisture: string;
  N: number;
  NH4N: number;
  P: number;
  K: number;
};

export type NMPFileFarmManureData = {
  ManureSource: string;
  MaterialType: string;
  BookLab: string;
  UniqueMaterialName: string;
  Nutrients: ManureNutrients;
};
