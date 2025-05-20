import React, { Key } from 'react';
import { Select } from '@bcgov/design-system-react-components';
import { PressEvent } from 'react-aria-components';
import Grid from '@mui/material/Grid';
import Form from '@/components/common/Form/Form';

// TEMPORARY! TODO: Use the database once we add all the animals
const animalOptions = [
  { id: '1', label: 'Beef Cattle' },
  { id: '2', label: 'Dairy Cattle' },
];

type AnimalFormWrapperProps = {
  selectedAnimalId: string | undefined;
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
