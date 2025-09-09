import { NMPFileBeefCattle, NMPFileDairyCattle, ManureType, NMPFilePoultry } from '@/types';

export const BEEF_COW_ID = '1';
export const DAIRY_COW_ID = '2';
export const MILKING_COW_ID = '9'; // subtype
export const POULTRY_ID = '6';
export const SWINE_ID = '9';
export const DUCK_ID = '10'; // subtype
export const PER_DAY_PER_ANIMAL_UNIT = 'PER_DAY_PER_ANIMAL';
export const PER_DAY_UNIT = 'PER_DAY';

export const INITIAL_BEEF_FORM_DATA: Omit<NMPFileBeefCattle, 'uuid'> = {
  animalId: BEEF_COW_ID,
  subtype: '',
  daysCollected: 0,
  manureType: ManureType.Solid,
};

export const INITIAL_DAIRY_FORM_DATA: Omit<NMPFileDairyCattle, 'uuid'> = {
  animalId: DAIRY_COW_ID,
  subtype: '',
  // Breed MUST start defined bc of weird milking cow logic
  // This is how it worked in old NMP
  breed: '1',
  grazingDaysPerYear: 0,
};

export const INITIAL_POULTRY_FORM_DATA: Omit<NMPFilePoultry, 'uuid'> = {
  animalId: POULTRY_ID,
  subtype: '',
  birdsPerFlock: 0,
  flocksPerYear: 0,
  daysPerFlock: 0,
};
