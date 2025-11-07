import { ManureType } from './NMPFileAnimal';

export type NMPFileGeneratedManure = {
  uniqueMaterialName: string;
  manureType?: ManureType;
  annualAmount: number;
  annualAmountUSGallonsVolume?: number;
  annualAmountTonsWeight?: number;
  annualAmountDisplayWeight?: string;
  managedManureName: string;
  assignedToStoredSystem?: boolean;
  totalAnnualManureAmount?: number;
  uuid: string;
  // Only used for Milking Cows
  originalAnnualAmount?: number;
  originalWashWaterAmount?: number;
};

export type NMPFileImportedManure = {
  uniqueMaterialName: string;
  manureType?: ManureType;
  annualAmount: number;
  annualAmountUSGallonsVolume?: number;
  annualAmountCubicYardsVolume?: number;
  annualAmountCubicMetersVolume?: number;
  annualAmountTonsWeight?: number;
  annualAmountDisplayVolume?: string;
  annualAmountDisplayWeight?: string;
  units?: number;
  moisture?: number;
  assignedToStoredSystem?: boolean;
  managedManureName: string;
  totalAnnualManureAmount?: number;
  uuid: string;
};

// At the moment, derived manure is only used for
// the separated solids from a liquid storage system
export type NMPFileDerivedManure = {
  uniqueMaterialName: string;
  managedManureName: string;
  manureType: ManureType.Solid;
  annualAmount: number;
  annualAmountUSGallonsVolume: undefined;
  annualAmountTonsWeight: number;
  assignedToStoredSystem: boolean;
  uuid: string;
  originUuid: string; // uuid of the storage system it derives from
};

export type NMPFileManure = NMPFileGeneratedManure | NMPFileImportedManure | NMPFileDerivedManure;

export type ManureInSystem =
  | {
      type: 'Generated';
      data: NMPFileGeneratedManure;
    }
  | {
      type: 'Imported';
      data: NMPFileImportedManure;
    }
  | {
      type: 'Derived';
      data: NMPFileDerivedManure;
    };

export type SolidManureStorage = {
  name: string;
  manureType: ManureType.Solid;
  isStructureCovered: boolean;
  uncoveredAreaSqFt?: number;
};

// eslint-disable-next-line no-shadow
export enum Shape {
  Rectangular = 1,
  Circular = 2,
  SlopedWallRectangular = 3,
}

export type RectangularStorage = {
  shape: Shape.Rectangular;
  lengthFt: number;
  widthFt: number;
  heightFt: number;
};

export type CircularStorage = {
  shape: Shape.Circular;
  diameterFt: number;
  heightFt: number;
};

export type SlopedWallStorage = {
  shape: Shape.SlopedWallRectangular;
  topLengthFt: number;
  topWidthFt: number;
  heightFt: number;
  slopeOfWall: number;
};

export type StorageStructure = RectangularStorage | CircularStorage | SlopedWallStorage;

export type LiquidManureStorage = {
  name: string;
  manureType: ManureType.Liquid;
  isStructureCovered: boolean;
  uncoveredAreaSqFt?: number;
  structure?: StorageStructure;
  volumeUSGallons: number;
};

export type ManureStorage = SolidManureStorage | LiquidManureStorage;

export type SolidManureStorageSystem = {
  name: string;
  manureType: ManureType.Solid;
  manuresInSystem: ManureInSystem[];
  manureStorage: SolidManureStorage;
  annualPrecipitation?: number;
  totalAnnualManureAmount?: number;
  uuid: string;
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
  annualPrecipitation?: number; // includes precipitation and yard/roof runoff
  totalAnnualManureAmount?: number;
  uuid: string;
};

export type NMPFileManureStorageSystem = SolidManureStorageSystem | LiquidManureStorageSystem;
