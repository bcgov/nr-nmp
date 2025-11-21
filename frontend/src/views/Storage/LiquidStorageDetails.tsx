import React, { useMemo } from 'react';
import Grid from '@mui/material/Grid';
import { NumberField, Select, TextField, YesNoRadioButtons } from '@/components/common';
import { formGridBreakpoints } from '../../common.styles';
import {
  CircularStorage,
  LiquidManureStorage,
  LiquidManureStorageSystem,
  RectangularStorage,
  Shape,
  SlopedWallStorage,
  StorageStructure,
} from '@/types';
import {
  DEFAULT_CIRCULAR_STORAGE,
  DEFAULT_RECTANGULAR_STORAGE,
  DEFAULT_SLOPED_WALL_STORAGE,
} from '@/constants';
import { calcStorageVolumeGallons } from '@/utils/manureStorageSystems';
import { Text } from './StorageModal.styles';
import { printNum } from '@/utils/utils';

const storageShapeOptions = [
  { id: Shape.Rectangular, label: Shape[Shape.Rectangular] },
  { id: Shape.Circular, label: Shape[Shape.Circular] },
  { id: Shape.SlopedWallRectangular, label: Shape[Shape.SlopedWallRectangular] },
];

type LiquidStorageDetailsProps = {
  formData: LiquidManureStorageSystem;
  setFormData: React.Dispatch<React.SetStateAction<LiquidManureStorageSystem>>;
  storageIndex: number;
};

export default function LiquidStorageDetails({
  formData,
  setFormData,
  storageIndex,
}: LiquidStorageDetailsProps) {
  const selectedStorage = useMemo(
    () => formData.manureStorages[storageIndex],
    [formData, storageIndex],
  );
  // TODO: Figure out why this always returns 0
  const totalVolume = useMemo(
    () => formData.manureStorages.reduce((sum, s) => sum + s.volumeUSGallons, 0),
    [formData],
  );

  const handleStorageChange = (changes: Partial<LiquidManureStorage>) => {
    setFormData((prev) => {
      const newManureStorages = [...prev.manureStorages];
      newManureStorages[storageIndex] = { ...selectedStorage, ...changes };
      return { ...prev, manureStorages: newManureStorages };
    });
  };

  const handleShapeChange = (shape: Shape) => {
    if (shape === selectedStorage.structure?.shape) return;

    setFormData((prev) => {
      const newManureStorages = [...prev.manureStorages];
      let newStructure;
      switch (shape) {
        case Shape.Rectangular:
          newStructure = DEFAULT_RECTANGULAR_STORAGE;
          break;
        case Shape.Circular:
          newStructure = DEFAULT_CIRCULAR_STORAGE;
          break;
        default:
          newStructure = DEFAULT_SLOPED_WALL_STORAGE;
      }
      newManureStorages[storageIndex] = { ...selectedStorage, structure: newStructure };
      return { ...prev, manureStorages: newManureStorages };
    });
  };

  const handleStructureChange = (structure: StorageStructure) => {
    setFormData((prev) => {
      const newManureStorages = [...prev.manureStorages];
      newManureStorages[storageIndex] = {
        ...selectedStorage,
        structure,
        volumeUSGallons: calcStorageVolumeGallons(structure),
      };
      return { ...prev, manureStorages: newManureStorages };
    });
  };

  return (
    <Grid
      container
      size={formGridBreakpoints}
      direction="row"
      spacing={2}
    >
      <Grid
        container
        size={6}
        direction="row"
      >
        <TextField
          isRequired
          label="Storage Name"
          type="string"
          value={selectedStorage.name}
          onChange={(e: string) => {
            handleStorageChange({ name: e });
          }}
        />
        <YesNoRadioButtons
          value={selectedStorage.isStructureCovered}
          text="Is the storage covered?"
          onChange={(e: boolean) => {
            handleStorageChange({ isStructureCovered: e });
          }}
          orientation="horizontal"
        />
        <Select
          isRequired={!selectedStorage.isStructureCovered}
          label="Storage shape"
          selectedKey={selectedStorage.structure?.shape}
          items={storageShapeOptions}
          onSelectionChange={(e) => {
            handleShapeChange(e as Shape);
          }}
        />
      </Grid>
      <Grid
        container
        size={6}
        direction="row"
      >
        {selectedStorage.structure?.shape === Shape.Circular && (
          <div>
            <NumberField
              isRequired
              label="Diameter(ft)"
              value={selectedStorage.structure.diameterFt}
              onChange={(e: number) =>
                handleStructureChange({
                  ...(selectedStorage.structure as CircularStorage),
                  diameterFt: e,
                })
              }
            />
            <NumberField
              isRequired
              label="Height(ft)"
              value={selectedStorage.structure.heightFt}
              onChange={(e: number) =>
                handleStructureChange({
                  ...(selectedStorage.structure as CircularStorage),
                  heightFt: e,
                })
              }
            />
          </div>
        )}
        {selectedStorage.structure?.shape === Shape.Rectangular && (
          <div>
            <NumberField
              isRequired
              label="Length(ft)"
              value={selectedStorage.structure.lengthFt}
              onChange={(e: number) =>
                handleStructureChange({
                  ...(selectedStorage.structure as RectangularStorage),
                  lengthFt: e,
                })
              }
            />
            <NumberField
              isRequired
              label="Width(ft)"
              value={selectedStorage.structure.widthFt}
              onChange={(e: number) =>
                handleStructureChange({
                  ...(selectedStorage.structure as RectangularStorage),
                  widthFt: e,
                })
              }
            />
            <NumberField
              isRequired
              label="Height(ft)"
              value={selectedStorage.structure.heightFt}
              onChange={(e: number) =>
                handleStructureChange({
                  ...(selectedStorage.structure as RectangularStorage),
                  heightFt: e,
                })
              }
            />
          </div>
        )}
        {selectedStorage.structure?.shape === Shape.SlopedWallRectangular && (
          <div>
            <NumberField
              isRequired
              label="Top-Length(ft)"
              value={selectedStorage.structure.topLengthFt}
              onChange={(e: number) =>
                handleStructureChange({
                  ...(selectedStorage.structure as SlopedWallStorage),
                  topLengthFt: e,
                })
              }
            />
            <NumberField
              isRequired
              label="Top-Width(ft)"
              value={selectedStorage.structure.topWidthFt}
              onChange={(e: number) =>
                handleStructureChange({
                  ...(selectedStorage.structure as SlopedWallStorage),
                  topWidthFt: e,
                })
              }
            />
            <NumberField
              isRequired
              label="Height(ft)"
              value={selectedStorage.structure.heightFt}
              onChange={(e: number) =>
                handleStructureChange({
                  ...(selectedStorage.structure as SlopedWallStorage),
                  heightFt: e,
                })
              }
            />
            <NumberField
              isRequired
              label="Slope of wall (X:1)"
              value={selectedStorage.structure.slopeOfWall}
              onChange={(e: number) =>
                handleStructureChange({
                  ...(selectedStorage.structure as SlopedWallStorage),
                  slopeOfWall: e,
                })
              }
            />
          </div>
        )}
        {selectedStorage.volumeUSGallons > 0 && selectedStorage.name !== '' && (
          <>
            <Text className="bcds-react-aria-Text primary small">Storage Volume</Text>
            <Text className="bcds-react-aria-Text primary small">{`${printNum(selectedStorage.volumeUSGallons)} U.S. Gallons (${selectedStorage.name})`}</Text>
            <Text className="bcds-react-aria-Text primary small">{`${printNum(totalVolume)} U.S. Gallons (${formData.name})`}</Text>
          </>
        )}
      </Grid>
    </Grid>
  );
}
