import React, { useContext, useState } from 'react';
import { PressEvent } from 'react-aria-components';
import Grid from '@mui/material/Grid';
import { Form, Select } from '@/components/common';
import { Animal, SelectOption } from '@/types';
import { APICacheContext } from '@/context/APICacheContext';

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
  const [animalOptions, setAnimalOptions] = useState<SelectOption[]>([]);
  const apiCache = useContext(APICacheContext);

  apiCache.callEndpoint('/api/animals/').then((response: { status?: any; data: any }) => {
    if (response.status === 200) {
      const { data } = response;
      const options = (data as Animal[]).map((row) => ({ id: row.id, label: row.name }));
      // TODO: REMOVE ONCE WE HAVE SWINE
      // This is a lazy way to take it out of the list
      options.splice(options.length - 1, 1);
      setAnimalOptions(options);
    }
  });

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
