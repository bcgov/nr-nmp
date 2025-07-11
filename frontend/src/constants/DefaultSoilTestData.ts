import { NMPFileSoilTestData } from '@/types';

const defaultSoilTestData: Omit<NMPFileSoilTestData, 'soilTestId'> = {
  valNO3H: '0',
  valP: '250',
  valK: '500',
  valPH: '6',
  convertedKelownaK: '500',
  convertedKelownaP: '250',
  sampleDate: '',
};

export default defaultSoilTestData;
