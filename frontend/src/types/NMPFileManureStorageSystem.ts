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

export type StorageShapes = 'Rectangular' | 'Circular' | 'SlopedWallRectangular';

export type ManureStorage = {
  id: number;
  name: string;
  isStructureCovered: boolean;
  uncoveredAreaSqFt?: number;
  SelectedStorageStructureShape: StorageShapes;
  RectangularLength?: number;
  RectangularWidth?: number;
  RectangularHeight?: number;
  CircularDiameter?: number;
  CircularHeight?: number;
  SlopedWallTopLength?: number;
  SlopedWallTopWidth?: number;
  SlopedWallHeight?: number;
  SlopedWallSlopeOfWall?: number;
  surfaceArea?: number;
  volumeUSGallons?: number;
  volumeOfStorageStructure?: string;
};

export type NMPFileManureStorageSystem = {
  name: string;
  manureType?: ManureType;
  manuresInSystem: ManureInSystem[];
  // TODO: Change these as they become relevant
  getsRunoffFromRoofsOrYards: boolean;
  runoffAreaSqFt: number;
  IsThereSolidLiquidSeparation: boolean;
  PercentageOfLiquidVolumeSeparated: number;
  SeparatedLiquidsUSGallons: number;
  SeparatedSolidsTons: number;
  manureStorageStructures: ManureStorage;
  // AnnualPrecipitation: number;
  // AssignedWithNutrientAnalysis: boolean;
  // ManureStorageVolume: string;
};
