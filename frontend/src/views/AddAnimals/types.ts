export const BEEF_COW_ID: string = '1';
export const DAIRY_COW_ID: string = '2';
export const MILKING_COW_ID: string = '9';
export const PER_DAY_PER_ANIMAL_UNIT = 'PER_DAY_PER_ANIMAL';
export const PER_DAY_UNIT = 'PER_DAY';
export type WashWaterUnit = 'PER_DAY_PER_ANIMAL' | 'PER_DAY';

export interface BeefCattleData {
  animalId: '1';
  index?: number;
  subtype?: string;
  animalsPerFarm?: number;
  daysCollected?: number | undefined;
  manureData?: { name: string; annualSolidManure: number } | undefined;
  date?: string;
}

export const initialBeefFormData: BeefCattleData = {
  animalId: '1',
  subtype: '',
  animalsPerFarm: undefined,
  daysCollected: 0,
  manureData: undefined,
};

export interface DairyCattleData {
  animalId: '2';
  index?: number;
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
  animalId: '2',
  subtype: '',
  // Breed MUST start defined bc of weird milking cow logic
  // This is how it worked in old NMP
  breed: '1',
  manureType: undefined,
  grazingDaysPerYear: 0,
  animalsPerFarm: undefined,
  milkProduction: undefined,
  washWater: undefined,
  washWaterUnit: undefined,
  manureData: undefined,
};

export type AnimalData = BeefCattleData | DairyCattleData;

// TODO: Add interfaces for the manure tab and nutrient tab
export type AnimalsWorkflowData = AnimalData;
