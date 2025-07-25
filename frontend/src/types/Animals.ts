export const BEEF_COW_ID = '1';
export const DAIRY_COW_ID = '2';
export const MILKING_COW_ID = '9';
export const PER_DAY_PER_ANIMAL_UNIT = 'PER_DAY_PER_ANIMAL';
export const PER_DAY_UNIT = 'PER_DAY';
export type WashWaterUnit = 'PER_DAY_PER_ANIMAL' | 'PER_DAY';

// eslint-disable-next-line no-shadow
export enum ManureType {
  Liquid = 1,
  Solid = 2,
}

export type BeefCattleData = {
  animalId: '1';
  subtype?: string;
  animalsPerFarm?: number;
  manureType: ManureType.Solid;
  daysCollected?: number;
  manureData?: { name: string; annualSolidManure: number };
  manureId: string;
};

export type DairyCattleData = {
  animalId: '2';
  subtype?: string;
  breed?: string;
  manureType?: ManureType;
  grazingDaysPerYear?: number;
  animalsPerFarm?: number;
  milkProduction?: number;
  washWater?: number;
  washWaterUnit?: WashWaterUnit;
  manureData?:
    | { name: string; annualSolidManure: number; annualLiquidManure: undefined }
    | { name: string; annualSolidManure: undefined; annualLiquidManure: number };
  manureId: string;
};

export type AnimalData = BeefCattleData | DairyCattleData;
