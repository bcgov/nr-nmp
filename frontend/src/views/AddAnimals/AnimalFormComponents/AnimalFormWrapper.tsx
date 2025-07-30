import React, { Key } from 'react';
import { PressEvent } from 'react-aria-components';
import Grid from '@mui/material/Grid';
import { Form, Select } from '@/components/common';
import { BEEF_COW_ID, DAIRY_COW_ID, POULTRY_ID } from '@/types';

// TEMPORARY! TODO: Use the database once we add all the animals
const animalOptions = [
  { id: BEEF_COW_ID, label: 'Beef Cattle' },
  { id: DAIRY_COW_ID, label: 'Dairy Cattle' },
  { id: POULTRY_ID, label: 'Poultry' },
];

type AnimalFormWrapperProps = {
  selectedAnimalId?: string;
  handleInputChanges: (changes: { [name: string]: string | number | undefined }) => void;
  onCancel: (e: PressEvent) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  isConfirmDisabled?: boolean;
  children: React.ReactNode | null;
};

export default function AnimalFormWrapper({
  selectedAnimalId,
  handleInputChanges,
  onCancel,
  onSubmit,
  isConfirmDisabled,
  children,
}: AnimalFormWrapperProps) {
  return (
    <Form
      onCancel={onCancel}
      onSubmit={onSubmit}
      isConfirmDisabled={isConfirmDisabled}
    >
      <Grid
        container
        spacing={2}
      >
        <Grid size={12}>
          <Select
            isRequired
            name="animalId"
            items={animalOptions}
            label="Animal Type"
            placeholder="Select Animal Type"
            selectedKey={selectedAnimalId}
            onSelectionChange={(e: Key) => {
              handleInputChanges({ animalId: e.toString() });
            }}
          />
        </Grid>
        {children}
      </Grid>
    </Form>
  );
}
