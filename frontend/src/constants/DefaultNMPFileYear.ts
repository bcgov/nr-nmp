import { NMPFileYear } from '@/types';

const DEFAULT_NMPFILE_YEAR: Omit<NMPFileYear, 'Year'> = {
  Fields: [],
  FarmAnimals: [],
  GeneratedManures: [],
  ImportedManures: [],
  ManureStorageSystems: [],
  NutrientAnalyses: [],
};

export default DEFAULT_NMPFILE_YEAR;
