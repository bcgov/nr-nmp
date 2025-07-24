import React, { useState, useMemo } from 'react';
import Grid from '@mui/material/Grid';
import { TextField } from '@bcgov/design-system-react-components';
import { Select } from '@/components/common';
import { formGridBreakpoints } from '../../common.styles';
import YesNoRadioButtons from '@/components/common/YesNoRadioButtons/YesNoRadioButtons';
import { ManureStorage, LiquidManureStorageSystem } from '@/types';

const storageShapeOptions = [
  { id: '1', label: 'Rectangular' },
  { id: '2', label: 'Circular' },
  { id: '3', label: 'SlopedWallRectangular' },
];

type LiquidStorageDetailsProps = {
  formData: LiquidManureStorageSystem;
  selectedIndex?: number;
};

export default function LiquidStorageDetails({
  formData,
  selectedIndex,
}: LiquidStorageDetailsProps) {
  const selectedStorage = useMemo(
    () =>
      selectedIndex !== undefined
        ? formData.manureStorages[selectedIndex]
        : formData.manureStorages[0],
    [formData, selectedIndex],
  );

  const handleStorageChange = (changes: Partial<ManureStorage>) => {
    setFormData((prev) => ({
      ...prev,
      manureStorageStructures: { ...prev.manureStorageStructures, ...changes },
    }));
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
          selectedKey={
            storageShapeOptions.find((option) => option.label === selectedStorage.structure?.shape)
              ?.label
          }
          items={storageShapeOptions}
          onSelectionChange={(e: any) => {
            // find storage shape by id
            const selectedShape = storageShapeOptions.find((option) => option.id === e)?.label;
            handleStorageChange({
              SelectedStorageStructureShape:
                selectedShape as ManureStorage['SelectedStorageStructureShape'],
            });
          }}
        />
      </Grid>
      <Grid
        container
        size={6}
        direction="row"
      >
        {selectedStorage.structure?.shape === 'Circular' && (
          <div>
            <TextField
              isRequired
              label="Diameter(ft)"
              type="number"
              value={String(selectedStorage.structure.diameter)}
              onChange={(e: string) => {
                handleStorageChange({ CircularDiameter: Number(e) });
              }}
            />
            <TextField
              isRequired
              label="Height(ft)"
              type="number"
              value={String(selectedStorage.structure.height)}
              onChange={(e: string) => {
                handleStorageChange({ CircularHeight: Number(e) });
              }}
            />
          </div>
        )}
        {selectedStorage.structure?.shape === 'Rectangular' && (
          <div>
            <TextField
              isRequired
              label="Length(ft)"
              type="number"
              value={String(selectedStorage.structure.length)}
              onChange={(e: string) => {
                handleStorageChange({ RectangularLength: Number(e) });
              }}
            />
            <TextField
              isRequired
              label="Width(ft)"
              type="number"
              value={String(selectedStorage.structure.width)}
              onChange={(e: string) => {
                handleStorageChange({ RectangularWidth: Number(e) });
              }}
            />
            <TextField
              isRequired
              label="Height(ft)"
              type="number"
              value={String(selectedStorage.structure.height)}
              onChange={(e: string) => {
                handleStorageChange({ RectangularHeight: Number(e) });
              }}
            />
          </div>
        )}
        {selectedStorage.structure?.shape === 'SlopedWallRectangular' && (
          <div>
            <TextField
              isRequired
              label="Diameter(ft)"
              type="number"
              value={String(formData.manureStorageStructures.CircularDiameter)}
              onChange={(e: string) => {
                handleStorageChange({ CircularDiameter: Number(e) });
              }}
            />
            <TextField
              isRequired
              label="Height(ft)"
              type="number"
              value={String(formData.manureStorageStructures.CircularHeight)}
              onChange={(e: string) => {
                handleStorageChange({ CircularHeight: Number(e) });
              }}
            />
            <TextField
              isRequired
              label="Diameter(ft)"
              type="number"
              value={String(formData.manureStorageStructures.CircularDiameter)}
              onChange={(e: string) => {
                handleStorageChange({ CircularDiameter: Number(e) });
              }}
            />
            <TextField
              isRequired
              label="Height(ft)"
              type="number"
              value={String(formData.manureStorageStructures.CircularHeight)}
              onChange={(e: string) => {
                handleStorageChange({ CircularHeight: Number(e) });
              }}
            />
          </div>
        )}
      </Grid>
    </Grid>
  );
}
