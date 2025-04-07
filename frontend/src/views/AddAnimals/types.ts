export interface BeefCattleData {
  id: '1';
  subtype?: string;
  animalsPerFarm?: number;
  daysCollected?: number | undefined;
  date?: string;
}

export const perDayPerAnimalUnit = 'PER_DAY_PER_ANIMAL';
export const perDayUnit = 'PER_DAY';
export interface DairyCattleData {
  id: '2';
  subtype?: string;
  breed?: string;
  manureType?: 'liquid' | 'solid';
  animalsPerFarm?: number;
  grazingDaysPerYear?: number;
  milkProduction?: number | undefined;
  washWater?: number | undefined;
  washWaterUnit?: 'PER_DAY_PER_ANIMAL' | 'PER_DAY' | undefined;
  date?: string;
}

export type AnimalData = BeefCattleData | DairyCattleData;

// TODO: Add interfaces for the manure tab and nutrient tab
export type AnimalsWorkflowData = AnimalData;
