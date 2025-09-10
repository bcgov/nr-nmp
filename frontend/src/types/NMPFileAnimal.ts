export type WashWaterUnit = 'PER_DAY_PER_ANIMAL' | 'PER_DAY';

// eslint-disable-next-line no-shadow
export enum ManureType {
  Liquid = 1,
  Solid = 2,
}

export type NMPFileBeefCattle = {
  animalId: '1';
  subtype?: string;
  animalsPerFarm?: number;
  manureType: ManureType.Solid;
  daysCollected?: number;
  manureData?: { name: string; annualSolidManure: number };
  uuid: string;
};

export type NMPFileDairyCattle = {
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

export type NMPFilePoultry = {
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

export type NMPFileOtherAnimal = {
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

export type NMPFileAnimal =
  | NMPFileBeefCattle
  | NMPFileDairyCattle
  | NMPFilePoultry
  | NMPFileOtherAnimal;
