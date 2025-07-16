import { NMPFileManureStorageSystem } from '@/types';

const DEFAULT_NMPFILE_MANURE_STORAGE: NMPFileManureStorageSystem = {
  name: '',
  manuresInSystem: [],
  getsRunoffFromRoofsOrYards: false,
  runoffAreaSqFt: null,
  manureStorageStructures: {
    id: 0,
    name: '',
    isStructureCovered: false,
    uncoveredAreaSquareFeet: 0,
  },
};

export default DEFAULT_NMPFILE_MANURE_STORAGE;
