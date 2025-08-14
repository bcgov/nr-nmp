export const BEEF_COW_ID = '1';
export const DAIRY_COW_ID = '2';
export const MILKING_COW_ID = '9'; // subtype
export const POULTRY_ID = '6';
export const SWINE_ID = '9';
export const DUCK_ID = '10'; // subtype
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
  uuid: string;
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
  uuid: string;
};

export type PoultryData = {
  animalId: '6';
  subtype?: string;
  manureType?: ManureType;
  birdsPerFlock?: number;
  flocksPerYear?: number;
  daysPerFlock?: number;
  manureData?:
    | { name: string; annualSolidManure: number; annualLiquidManure: undefined }
    | { name: string; annualSolidManure: undefined; annualLiquidManure: number };
  uuid: string;
};

// I didn't want to define the type like this but Typescript
// doesn't allow defining types as an exclusion of specific strings
export type OtherAnimalId = '4' | '5' | '7' | '8' | '9';
export const OTHER_ANIMAL_IDS: OtherAnimalId[] = ['4', '5', '7', '8', '9'];

export type OtherAnimalData = {
  animalId: OtherAnimalId;
  subtype?: string;
  manureType: ManureType;
  animalsPerFarm?: number;
  daysCollected?: number;
  manureData?:
    | { name: string; annualSolidManure: number; annualLiquidManure: undefined }
    | { name: string; annualSolidManure: undefined; annualLiquidManure: number };
  uuid: string;
};

export type AnimalData = BeefCattleData | DairyCattleData | PoultryData | OtherAnimalData;

export type Animal = {
  id: number;
  name: string;
  usesortorder: boolean;
};
