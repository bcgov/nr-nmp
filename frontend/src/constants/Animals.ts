import {
  BEEF_COW_ID,
  BeefCattleData,
  DAIRY_COW_ID,
  DairyCattleData,
  ManureType,
  POULTRY_ID,
  PoultryData,
} from '@/types';

export const INITIAL_BEEF_FORM_DATA: Omit<BeefCattleData, 'manureId'> = {
  animalId: BEEF_COW_ID,
  subtype: '',
  daysCollected: 0,
  manureType: ManureType.Solid,
};

export const INITIAL_DAIRY_FORM_DATA: Omit<DairyCattleData, 'manureId'> = {
  animalId: DAIRY_COW_ID,
  subtype: '',
  // Breed MUST start defined bc of weird milking cow logic
  // This is how it worked in old NMP
  breed: '1',
  grazingDaysPerYear: 0,
};

export const INITIAL_POULTRY_FORM_DATA: Omit<PoultryData, 'manureId'> = {
  animalId: POULTRY_ID,
  subtype: '',
  birdsPerFlock: 0,
  flocksPerYear: 0,
  daysPerFlock: 0,
};
