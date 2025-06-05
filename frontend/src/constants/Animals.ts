import { BeefCattleData, DairyCattleData } from '@/types';

export const initialBeefFormData: BeefCattleData = {
  animalId: '1',
  subtype: '',
  animalsPerFarm: undefined,
  daysCollected: 0,
  manureData: undefined,
};

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
