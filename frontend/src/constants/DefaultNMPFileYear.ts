import { NMPFileYear } from '@/types';

const DEFAULT_NMPFILE_YEAR: Omit<NMPFileYear, 'year'> = {
  fields: [],
  farmAnimals: [],
  generatedManures: [],
  importedManures: [],
  manureStorageSystems: [],
  nutrientAnalyses: [],
};

export default DEFAULT_NMPFILE_YEAR;
