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

export type SolidManureStorage = {
  name: string;
  manureType: ManureType.Solid;
  isStructureCovered: boolean;
  uncoveredAreaSqFt?: number;
  // TODO: Add attribute for annual precipitation
};

type RectangularStorage = {
  shape: 'Rectangular';
  length: number;
  width: number;
  height: number;
}

type CircularStorage = {
  shape: 'Circular';
  diameter: number;
  height: number;
}

type SlopedWallStorage = {
  shape: 'SlopedWallRectangular';
  topLength: number;
  topWidth: number;
  height: number;
  slopeOfWall: number;
};

export type LiquidManureStorage = {
  name: string;
  manureType: ManureType.Liquid;
  isStructureCovered: boolean;
  structure?: RectangularStorage | CircularStorage | SlopedWallStorage;
  volumeUSGallons: number;
  // TODO: Add attribute for annual precipitation
};

export type ManureStorage = SolidManureStorage | LiquidManureStorage;

export type SolidManureStorageSystem = {
  name: string;
  manureType: ManureType.Solid;
  manuresInSystem: ManureInSystem[];
  manureStorage: SolidManureStorage;
};

export type LiquidManureStorageSystem = {
  name: string;
  manureType: ManureType.Liquid;
  manuresInSystem: ManureInSystem[];
  getsRunoff: boolean;
  runoffAreaSqFt: number;
  hasSeperation: boolean;
  percentLiquidSeperation: number;
  separatedLiquidsUSGallons: number;
  separatedSolidsTons: number;
  manureStorages: LiquidManureStorage[];
};

export type NMPFileManureStorageSystem = SolidManureStorageSystem | LiquidManureStorageSystem;
