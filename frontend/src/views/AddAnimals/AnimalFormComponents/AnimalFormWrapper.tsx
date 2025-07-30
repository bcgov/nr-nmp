import React from 'react';
import { PressEvent } from 'react-aria-components';
import Grid from '@mui/material/Grid';
import { Form, Select } from '@/components/common';
import { SelectOption } from '@/types';

type AnimalFormWrapperProps = {
  animalOptions: SelectOption[];
  selectedAnimalId?: string;
  handleInputChanges: (changes: { [name: string]: string | number | undefined }) => void;
  onCancel: (e: PressEvent) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  isConfirmDisabled?: boolean;
  children: React.ReactNode | null;
};

export default function AnimalFormWrapper({
  animalOptions,
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
              handleInputChanges({ animalId: String(e) });
            }}
          />
        </Grid>
        {children}
      </Grid>
    </Form>
  );
}
