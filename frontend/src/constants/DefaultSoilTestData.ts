import { NMPFileSoilTestData } from '@/types';

const DEFAULT_LEAF_TEST_DATA: Omit<NMPFileSoilTestData, 'soilTestId'> = {
  valNO3H: 0,
  valP: 250,
  valK: 500,
  valPH: 6,
  convertedKelownaK: 500,
  convertedKelownaP: 250,
  sampleDate: undefined,
};

export default DEFAULT_LEAF_TEST_DATA;
