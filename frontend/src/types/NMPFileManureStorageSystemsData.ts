import { NMPFileGeneratedManureData, NMPFileImportedManureData } from '@/types';

type ManuresIncludedInSystem =
  | {
      Type: 'Generated';
      Data: NMPFileGeneratedManureData;
    }
  | {
      Type: 'Imported';
      Data: NMPFileImportedManureData;
    };

interface NMPFileManureStorageSystemsData {
  Id: number;
  Name: string;
  ManureMaterialType: number;
  ManuresIncludedInSystem: ManuresIncludedInSystem;
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
