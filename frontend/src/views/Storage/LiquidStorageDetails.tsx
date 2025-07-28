import React, { useMemo } from 'react';
import Grid from '@mui/material/Grid';
import { TextField } from '@bcgov/design-system-react-components';
import { Select } from '@/components/common';
import { formGridBreakpoints } from '../../common.styles';
import YesNoRadioButtons from '@/components/common/YesNoRadioButtons/YesNoRadioButtons';
import { LiquidManureStorageSystem } from '@/types';
import {
  CircularStorage,
  LiquidManureStorage,
  RectangularStorage,
  Shape,
  SlopedWallStorage,
  StorageStructure,
} from '@/types/NMPFileManureStorageSystem';
import {
  DEFAULT_CIRCULAR_STORAGE,
  DEFAULT_RECTANGULAR_STORAGE,
  DEFAULT_SLOPED_WALL_STORAGE,
} from '@/constants';
import { calcStorageVolumeGallons } from '@/utils/manureStorageSystems';
import { Text } from './StorageModal.styles';

const storageShapeOptions = [
  { id: Shape.Rectangular, label: Shape[Shape.Rectangular] },
  { id: Shape.Circular, label: Shape[Shape.Circular] },
  { id: Shape.SlopedWallRectangular, label: Shape[Shape.SlopedWallRectangular] },
];

const measurementValidation = (value: string) =>
  Number(value) <= 0 ? 'Please enter a valid measurement.' : null;

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
          onChange={(e: any) => {
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
            <TextField
              isRequired
              label="Diameter(ft)"
              type="number"
              value={String(selectedStorage.structure.diameterFt)}
              validate={measurementValidation}
              onChange={(e: string) =>
                handleStructureChange({
                  ...(selectedStorage.structure as CircularStorage),
                  diameterFt: Number(e),
                })
              }
            />
            <TextField
              isRequired
              label="Height(ft)"
              type="number"
              value={String(selectedStorage.structure.heightFt)}
              validate={measurementValidation}
              onChange={(e: string) =>
                handleStructureChange({
                  ...(selectedStorage.structure as CircularStorage),
                  heightFt: Number(e),
                })
              }
            />
          </div>
        )}
        {selectedStorage.structure?.shape === Shape.Rectangular && (
          <div>
            <TextField
              isRequired
              label="Length(ft)"
              type="number"
              value={String(selectedStorage.structure.lengthFt)}
              validate={measurementValidation}
              onChange={(e: string) =>
                handleStructureChange({
                  ...(selectedStorage.structure as RectangularStorage),
                  lengthFt: Number(e),
                })
              }
            />
            <TextField
              isRequired
              label="Width(ft)"
              type="number"
              value={String(selectedStorage.structure.widthFt)}
              validate={measurementValidation}
              onChange={(e: string) =>
                handleStructureChange({
                  ...(selectedStorage.structure as RectangularStorage),
                  widthFt: Number(e),
                })
              }
            />
            <TextField
              isRequired
              label="Height(ft)"
              type="number"
              value={String(selectedStorage.structure.heightFt)}
              validate={measurementValidation}
              onChange={(e: string) =>
                handleStructureChange({
                  ...(selectedStorage.structure as RectangularStorage),
                  heightFt: Number(e),
                })
              }
            />
          </div>
        )}
        {selectedStorage.structure?.shape === Shape.SlopedWallRectangular && (
          <div>
            <TextField
              isRequired
              label="Top-Length(ft)"
              type="number"
              value={String(selectedStorage.structure.topLengthFt)}
              validate={measurementValidation}
              onChange={(e: string) =>
                handleStructureChange({
                  ...(selectedStorage.structure as SlopedWallStorage),
                  topLengthFt: Number(e),
                })
              }
            />
            <TextField
              isRequired
              label="Top-Width(ft)"
              type="number"
              value={String(selectedStorage.structure.topWidthFt)}
              validate={measurementValidation}
              onChange={(e: string) =>
                handleStructureChange({
                  ...(selectedStorage.structure as SlopedWallStorage),
                  topWidthFt: Number(e),
                })
              }
            />
            <TextField
              isRequired
              label="Height(ft)"
              type="number"
              value={String(selectedStorage.structure.heightFt)}
              validate={measurementValidation}
              onChange={(e: string) =>
                handleStructureChange({
                  ...(selectedStorage.structure as SlopedWallStorage),
                  heightFt: Number(e),
                })
              }
            />
            <TextField
              isRequired
              label="Slope of wall (X:1)"
              type="number"
              value={String(selectedStorage.structure.slopeOfWall)}
              onChange={(e: string) =>
                handleStructureChange({
                  ...(selectedStorage.structure as SlopedWallStorage),
                  slopeOfWall: Number(e),
                })
              }
            />
          </div>
        )}
        {selectedStorage.volumeUSGallons > 0 && selectedStorage.name !== '' && (
          <>
            <Text className="bcds-react-aria-Text primary small">Storage Volume</Text>
            <Text className="bcds-react-aria-Text primary small">{`${selectedStorage.volumeUSGallons} U.S. Gallons (${selectedStorage.name})`}</Text>
            <Text className="bcds-react-aria-Text primary small">{`${totalVolume} U.S. Gallons (${formData.name})`}</Text>
          </>
        )}
      </Grid>
    </Grid>
  );
}
