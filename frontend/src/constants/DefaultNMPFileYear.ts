import { NMPFileYear } from '@/types';

const DEFAULT_NMPFILE_YEAR: Omit<NMPFileYear, 'Year'> = {
  Fields: [],
  FarmAnimals: [],
  FarmManures: [],
  GeneratedManures: [],
  ImportedManures: [],
  ManureStorageSystems: [],
};

export default DEFAULT_NMPFILE_YEAR;
