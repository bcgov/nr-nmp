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
      newManureStorages[storageIndex] = { ...selectedStorage, structure };
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
          isRequired
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
              onChange={(e: string) => {
                const newStructure: CircularStorage = {
                  ...(selectedStorage.structure as CircularStorage),
                  diameterFt: Number(e),
                };
                handleStructureChange(newStructure);
              }}
            />
            <TextField
              isRequired
              label="Height(ft)"
              type="number"
              value={String(selectedStorage.structure.heightFt)}
              onChange={(e: string) => {
                const newStructure: CircularStorage = {
                  ...(selectedStorage.structure as CircularStorage),
                  heightFt: Number(e),
                };
                handleStructureChange(newStructure);
              }}
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
              onChange={(e: string) => {
                const newStructure: RectangularStorage = {
                  ...(selectedStorage.structure as RectangularStorage),
                  lengthFt: Number(e),
                };
                handleStructureChange(newStructure);
              }}
            />
            <TextField
              isRequired
              label="Width(ft)"
              type="number"
              value={String(selectedStorage.structure.widthFt)}
              onChange={(e: string) => {
                const newStructure: RectangularStorage = {
                  ...(selectedStorage.structure as RectangularStorage),
                  widthFt: Number(e),
                };
                handleStructureChange(newStructure);
              }}
            />
            <TextField
              isRequired
              label="Height(ft)"
              type="number"
              value={String(selectedStorage.structure.heightFt)}
              onChange={(e: string) => {
                const newStructure: RectangularStorage = {
                  ...(selectedStorage.structure as RectangularStorage),
                  heightFt: Number(e),
                };
                handleStructureChange(newStructure);
              }}
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
              onChange={(e: string) => {
                const newStructure: SlopedWallStorage = {
                  ...(selectedStorage.structure as SlopedWallStorage),
                  topLengthFt: Number(e),
                };
                handleStructureChange(newStructure);
              }}
            />
            <TextField
              isRequired
              label="Top-Width(ft)"
              type="number"
              value={String(selectedStorage.structure.topWidthFt)}
              onChange={(e: string) => {
                const newStructure: SlopedWallStorage = {
                  ...(selectedStorage.structure as SlopedWallStorage),
                  topWidthFt: Number(e),
                };
                handleStructureChange(newStructure);
              }}
            />
            <TextField
              isRequired
              label="Height(ft)"
              type="number"
              value={String(selectedStorage.structure.heightFt)}
              onChange={(e: string) => {
                const newStructure: SlopedWallStorage = {
                  ...(selectedStorage.structure as SlopedWallStorage),
                  heightFt: Number(e),
                };
                handleStructureChange(newStructure);
              }}
            />
            <TextField
              isRequired
              label="Slope of wall (X:1)"
              type="number"
              value={String(selectedStorage.structure.slopeOfWall)}
              onChange={(e: string) => {
                const newStructure: SlopedWallStorage = {
                  ...(selectedStorage.structure as SlopedWallStorage),
                  slopeOfWall: Number(e),
                };
                handleStructureChange(newStructure);
              }}
            />
          </div>
        )}
      </Grid>
    </Grid>
  );
}
