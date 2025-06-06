import { BEEF_COW_ID, BeefCattleData, DAIRY_COW_ID, DairyCattleData } from '@/types';

export const INITIAL_BEEF_FORM_DATA: BeefCattleData = {
  animalId: BEEF_COW_ID,
  subtype: '',
  animalsPerFarm: undefined,
  daysCollected: 0,
  manureData: undefined,
};

export const INITIAL_DAIRY_FORM_DATA: DairyCattleData = {
  animalId: DAIRY_COW_ID,
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
