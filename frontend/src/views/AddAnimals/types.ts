export interface BeefCattleData {
  id: '1';
  subtype?: string;
  animalsPerFarm?: number;
  daysCollected?: number | undefined;
  manureData?: { name: string; annualSolidManure: number } | undefined;
  date?: string;
}

export const initialBeefFormData: BeefCattleData = {
  id: '1',
  subtype: '',
  animalsPerFarm: undefined,
  daysCollected: undefined,
  manureData: undefined,
  date: new Date().toISOString(),
};

export const BEEF_COW_ID: string = '1';
export const DAIRY_COW_ID: string = '2';
export const MILKING_COW_ID: string = '9';
export const PER_DAY_PER_ANIMAL_UNIT = 'PER_DAY_PER_ANIMAL';
export const PER_DAY_UNIT = 'PER_DAY';
export type WashWaterUnit = 'PER_DAY_PER_ANIMAL' | 'PER_DAY';
export interface DairyCattleData {
  id: '2';
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
}

export const initialDairyFormData: DairyCattleData = {
  id: '2',
  subtype: '',
  breed: '1',
  manureType: undefined,
  grazingDaysPerYear: 0,
  animalsPerFarm: undefined,
  milkProduction: undefined,
  washWater: undefined,
  washWaterUnit: undefined,
  manureData: undefined,
  date: new Date().toISOString(),
};

export type AnimalData = BeefCattleData | DairyCattleData;

// TODO: Add interfaces for the manure tab and nutrient tab
export type AnimalsWorkflowData = AnimalData;
