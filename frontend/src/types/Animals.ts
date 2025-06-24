export const BEEF_COW_ID = '1';
export const DAIRY_COW_ID = '2';
export const MILKING_COW_ID = '9';
export const PER_DAY_PER_ANIMAL_UNIT = 'PER_DAY_PER_ANIMAL';
export const PER_DAY_UNIT = 'PER_DAY';
export type WashWaterUnit = 'PER_DAY_PER_ANIMAL' | 'PER_DAY';

export type BeefCattleData = {
  animalId: '1';
  subtype?: string;
  animalsPerFarm?: number;
  daysCollected?: number | undefined;
  manureData?: { name: string; annualSolidManure: number } | undefined;
  date?: string;
};

export type DairyCattleData = {
  animalId: '2';
  subtype?: string;
  breed?: string;
  manureType?: 'liquid' | 'solid';
  grazingDaysPerYear?: number;
  animalsPerFarm?: number;
  milkProduction?: number | undefined;
  washWater?: number | undefined;
  washWaterUnit?: WashWaterUnit | undefined;
  manureData?:
    | { name: string; annualSolidManure: number; annualLiquidManure: undefined }
    | { name: string; annualSolidManure: undefined; annualLiquidManure: number }
    | undefined;
};

export type AnimalData = BeefCattleData | DairyCattleData;
