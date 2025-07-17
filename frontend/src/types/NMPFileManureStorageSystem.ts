import { NMPFileGeneratedManureData, NMPFileImportedManureData } from '@/types';
import { ManureType } from './Animals';

export type ManureInSystem =
  | {
      type: 'Generated';
      data: NMPFileGeneratedManureData;
    }
  | {
      type: 'Imported';
      data: NMPFileImportedManureData;
    };

export type ManureStorage = {
  id: number;
  name: string;
  isStructureCovered: boolean;
  uncoveredAreaSqFt?: number;
};

export type NMPFileManureStorageSystem = {
  name: string;
  manureType?: ManureType;
  manuresInSystem: ManureInSystem[];
  // TODO: Change these as they become relevant
  getsRunoffFromRoofsOrYards: false;
  runoffAreaSqFt: null;
  manureStorageStructures: ManureStorage;
};
