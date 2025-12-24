import React from 'react';
import { PressEvent } from 'react-aria-components';
import Grid from '@mui/material/Grid';
import { Form, Select } from '@/components/common';
import { Animal, SelectOption } from '@/types';

type AnimalFormWrapperProps = {
  animals: SelectOption<Animal>[];
  selectedAnimalId?: string;
  handleInputChanges: (changes: { [name: string]: string | number | undefined }) => void;
  onCancel: (e: PressEvent) => void;
  onSubmit: () => void;
  isConfirmDisabled?: boolean;
  children: React.ReactNode | null;
};

export default function AnimalFormWrapper({
  animals,
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
      onConfirm={onSubmit}
      isConfirmDisabled={isConfirmDisabled}
    >
      <Grid
        container
        spacing={2}
      >
        <Grid size={12}>
          <Select
            isRequired
            items={animals}
            label="Animal Type"
            placeholder="Select Animal Type"
            value={selectedAnimalId}
            onChange={(e) => handleInputChanges({ animalId: String(e) })}
          />
        </Grid>
        {children}
      </Grid>
    </Form>
  );
}
