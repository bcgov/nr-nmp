import {
  CircularStorage,
  LiquidManureStorage,
  LiquidManureStorageSystem,
  ManureType,
  RectangularStorage,
  Shape,
  SlopedWallStorage,
  SolidManureStorage,
  SolidManureStorageSystem,
} from '@/types';

export const DEFAULT_LIQUID_MANURE_STORAGE: LiquidManureStorage = {
  name: '',
  manureType: ManureType.Liquid,
  isStructureCovered: false,
  volumeUSGallons: 0,
};

export const DEFAULT_SOLID_MANURE_STORAGE: SolidManureStorage = {
  name: '',
  manureType: ManureType.Solid,
  isStructureCovered: false,
};

export const DEFAULT_RECTANGULAR_STORAGE: RectangularStorage = {
  shape: Shape.Rectangular,
  lengthFt: 0,
  widthFt: 0,
  heightFt: 0,
};

export const DEFAULT_CIRCULAR_STORAGE: CircularStorage = {
  shape: Shape.Circular,
  diameterFt: 0,
  heightFt: 0,
};

export const DEFAULT_SLOPED_WALL_STORAGE: SlopedWallStorage = {
  shape: Shape.SlopedWallRectangular,
  topLengthFt: 0,
  topWidthFt: 0,
  heightFt: 0,
  slopeOfWall: 0,
};

export const DEFAULT_LIQUID_MANURE_SYSTEM: LiquidManureStorageSystem = {
  name: '',
  manureType: ManureType.Liquid,
  manuresInSystem: [],
  getsRunoff: false,
  runoffAreaSqFt: 0,
  hasSeperation: false,
  percentLiquidSeperation: 0,
  separatedLiquidsUSGallons: 0,
  separatedSolidsTons: 0,
  manureStorages: [DEFAULT_LIQUID_MANURE_STORAGE],
  uuid: '',
};

export const DEFAULT_SOLID_MANURE_SYSTEM: Omit<SolidManureStorageSystem, 'uuid'> = {
  name: '',
  manureType: ManureType.Solid,
  manuresInSystem: [],
  manureStorage: DEFAULT_SOLID_MANURE_STORAGE,
};
