import { NMPFileGeneratedManureData, NMPFileImportedManureData } from '@/types';

interface NMPFileManureStorageSystemsData {
  Id: number;
  Name: string;
  ManureMaterialType: number;
  GeneratedManuresIncludedInSystem: NMPFileGeneratedManureData[];
  ImportedManuresIncludedInSystem: NMPFileImportedManureData[];
  GetsRunoffFromRoofsOrYards: false;
  RunoffAreaSquareFeet: null;
  ManureStorageStructures: {
    Id: number;
    Name: string;
    IsStructureCovered: boolean;
    UncoveredAreaSquareFeet?: number;
  };
}
export default NMPFileManureStorageSystemsData;
