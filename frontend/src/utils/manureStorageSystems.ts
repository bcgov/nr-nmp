import {
  RectangularStorage,
  CircularStorage,
  SlopedWallStorage,
  StorageStructure,
  Shape,
  ManureType,
  PrecipitationConversionFactor,
  NMPFileManureStorageSystem,
} from '@/types';

const ft3ToGallons = 7.48052;

export function calcRectangularSurfaceAreaSqFt(storage: RectangularStorage) {
  return Math.round(storage.lengthFt * storage.widthFt);
}

export function calcRectangularVolumeFtCubed(storage: RectangularStorage) {
  return Math.round(storage.lengthFt * storage.heightFt * storage.widthFt);
}

export function calcRectangularVolumeGallons(storage: RectangularStorage) {
  return Math.round(storage.lengthFt * storage.heightFt * storage.widthFt * ft3ToGallons);
}

export function calcCircularSurfaceAreaSqFt(storage: CircularStorage) {
  return Math.round(3.1428 * (storage.diameterFt / 2) ** 2);
}

export function calcCircularVolumeFtCubed(storage: CircularStorage) {
  const activeHeight = storage.heightFt - 1; // height - freeBoard
  return Math.round(activeHeight * 3.1428 * (storage.diameterFt / 2) ** 2);
}

export function calcCircularVolumeGallons(storage: CircularStorage) {
  const activeHeight = storage.heightFt - 1; // height - freeBoard
  return Math.round(activeHeight * 3.1428 * (storage.diameterFt / 2) ** 2 * ft3ToGallons);
}

export function calcSlopedWallSurfaceAreaSqFt(storage: SlopedWallStorage) {
  return Math.round(storage.topLengthFt * storage.topWidthFt);
}

export function calcSlopedWallVolumeFtCubed(storage: SlopedWallStorage) {
  const activeHeight = storage.heightFt - 1; // height - freeBoard
  const bottomLength = storage.topLengthFt - (2 * storage.heightFt) / storage.slopeOfWall;
  const bottomWidth = storage.topWidthFt - (2 * storage.heightFt) / storage.slopeOfWall;
  const areaBottom = bottomLength * bottomWidth;
  const areaTop = storage.topLengthFt * storage.topWidthFt;
  return Math.round((activeHeight / 3) * areaBottom + areaTop + Math.sqrt(areaBottom * areaTop));
}

export function calcSlopedWallVolumeGallons(storage: SlopedWallStorage) {
  const activeHeight = storage.heightFt - 1; // height - freeBoard
  const bottomLength = storage.topLengthFt - (2 * storage.heightFt) / storage.slopeOfWall;
  const bottomWidth = storage.topWidthFt - (2 * storage.heightFt) / storage.slopeOfWall;
  const areaBottom = bottomLength * bottomWidth;
  const areaTop = storage.topLengthFt * storage.topWidthFt;
  return Math.round(
    ((activeHeight / 3) * areaBottom + areaTop + Math.sqrt(areaBottom * areaTop)) * ft3ToGallons,
  );
}

export function calcStorageSurfaceAreaSqFt(structure: StorageStructure) {
  switch (structure.shape) {
    case Shape.Rectangular:
      return calcRectangularSurfaceAreaSqFt(structure);
    case Shape.Circular:
      return calcCircularSurfaceAreaSqFt(structure);
    default:
      return calcSlopedWallSurfaceAreaSqFt(structure);
  }
}

export function calcStorageVolumeFtCubed(structure: StorageStructure) {
  switch (structure.shape) {
    case Shape.Rectangular:
      return calcRectangularVolumeFtCubed(structure);
    case Shape.Circular:
      return calcCircularVolumeFtCubed(structure);
    default:
      return calcSlopedWallVolumeFtCubed(structure);
  }
}

export function calcStorageVolumeGallons(structure: StorageStructure) {
  switch (structure.shape) {
    case Shape.Rectangular:
      return calcRectangularVolumeGallons(structure);
    case Shape.Circular:
      return calcCircularVolumeGallons(structure);
    default:
      return calcSlopedWallVolumeGallons(structure);
  }
}

export function calculatePrecipitationInStorage(
  system: NMPFileManureStorageSystem,
  regionAnnualPrecipitation: number,
) {
  let annualPrecipitation;
  if (system.manureType === ManureType.Liquid) {
    let totalUncoveredArea = system.runoffAreaSqFt || 0;
    system.manureStorages.forEach((storage) => {
      if (!storage.isStructureCovered) {
        if (!storage.structure) throw new Error('Form validation failed.');
        totalUncoveredArea += calcStorageSurfaceAreaSqFt(storage.structure);
      }
    });
    annualPrecipitation =
      totalUncoveredArea > 0
        ? totalUncoveredArea * regionAnnualPrecipitation * PrecipitationConversionFactor.Liquid
        : undefined;
  } else {
    // For solid manure
    annualPrecipitation = system.manureStorage.uncoveredAreaSqFt
      ? system.manureStorage.uncoveredAreaSqFt *
        regionAnnualPrecipitation *
        PrecipitationConversionFactor.Solid
      : undefined;
  }
  return annualPrecipitation;
}
