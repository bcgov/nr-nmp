import { NMPFileManureStorageSystemsData } from '@/types';

const DefaultNMPFileManureStorageSystemsData: NMPFileManureStorageSystemsData = {
  Id: 0,
  Name: '',
  ManureMaterialType: 0,
  GeneratedManuresIncludedInSystem: [],
  ImportedManuresIncludedInSystem: [],
  GetsRunoffFromRoofsOrYards: false,
  RunoffAreaSquareFeet: null,
  ManureStorageStructures: {
    Id: 0,
    Name: '',
    IsStructureCovered: false,
    UncoveredAreaSquareFeet: 0,
  },
};

export default DefaultNMPFileManureStorageSystemsData;
