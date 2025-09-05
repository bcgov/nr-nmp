import { NMPFileSoilTest } from '@/types';

const DEFAULT_SOIL_TEST: Omit<NMPFileSoilTest, 'soilTestId'> = {
  valNO3H: 0,
  valP: 250,
  valK: 500,
  valPH: 6,
  convertedKelownaK: 500,
  convertedKelownaP: 250,
  sampleDate: undefined,
};

export default DEFAULT_SOIL_TEST;
