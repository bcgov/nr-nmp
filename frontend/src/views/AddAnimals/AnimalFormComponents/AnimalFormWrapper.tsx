import React from 'react';
import { PressEvent } from 'react-aria-components';
import Grid from '@mui/material/Grid';
import { Form, Select } from '@/components/common';

// TEMPORARY! TODO: Use the database once we add all the animals
const animalOptions = [
  { id: '1', label: 'Beef Cattle' },
  { id: '2', label: 'Dairy Cattle' },
  { id: '4', label: 'Goats' },
  { id: '5', label: 'Horse' },
  { id: '7', label: 'Rabbits' },
  { id: '8', label: 'Sheep' },
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
            onSelectionChange={(e) => {
              handleInputChanges({ animalId: e as string });
            }}
          />
        </Grid>
        {children}
      </Grid>
    </Form>
  );
}
