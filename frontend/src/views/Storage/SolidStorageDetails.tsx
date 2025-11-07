import React from 'react';
import Grid from '@mui/material/Grid';
import { formGridBreakpoints } from '../../common.styles';
import YesNoRadioButtons from '@/components/common/YesNoRadioButtons/YesNoRadioButtons';
import { SolidManureStorageSystem, SolidManureStorage } from '@/types';
import { TextField, NumberField } from '@/components/common';

type SolidStorageDetailsProps = {
  formData: SolidManureStorageSystem;
  setFormData: React.Dispatch<React.SetStateAction<SolidManureStorageSystem>>;
};

export default function SolidStorageDetails({ formData, setFormData }: SolidStorageDetailsProps) {
  const handleStorageChange = (changes: Partial<SolidManureStorage>) => {
    setFormData((prev) => ({
      ...prev,
      manureStorage: { ...prev.manureStorage, ...changes },
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
          value={formData.manureStorage.name}
          onChange={(e: string) => {
            handleStorageChange({ name: e });
          }}
        />
        <YesNoRadioButtons
          value={formData.manureStorage.isStructureCovered}
          text="Is the storage covered?"
          onChange={(e: boolean) => {
            handleStorageChange({ isStructureCovered: e });
          }}
          orientation="horizontal"
        />
        {!formData.manureStorage.isStructureCovered && (
          <NumberField
            isRequired
            label="Uncovered Area of Storage (ft²)"
            value={formData.manureStorage.uncoveredAreaSqFt}
            onChange={(e: number) => {
              handleStorageChange({ uncoveredAreaSqFt: e });
            }}
          />
        )}
      </Grid>
    </Grid>
  );
}
