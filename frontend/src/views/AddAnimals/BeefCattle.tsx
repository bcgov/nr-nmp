/* eslint-disable react/jsx-props-no-spreading */
import React, { useContext, useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import { TextField, Select, Checkbox } from '@bcgov/design-system-react-components';
import { APICacheContext } from '@/context/APICacheContext';
import { BeefCattleData, initialBeefFormData } from './types';

interface BeefCattleSubtype {
  id: number;
  name: string;
  solidperpoundperanimalperday: number;
}

export default function BeefCattle({
  setFormData,
  formData,
}: {
  setFormData: React.Dispatch<React.SetStateAction<BeefCattleData>>;
  formData: BeefCattleData;
}) {
  const apiCache = useContext(APICacheContext);
  const [, setSubtypes] = useState<BeefCattleSubtype[]>([]);
  const [subtypeOptions, setSubtypeOptions] = useState<{ value: number; label: string }[]>([]);
  const [showCollectionDays, setShowCollectionDays] = useState<boolean>();

  // only run on initial mount
  useEffect(() => {
    setFormData((prev: BeefCattleData) => ({
      ...initialBeefFormData,
      ...prev,
    }));
    apiCache.callEndpoint('api/animal_subtypes/1/').then((response) => {
      if (response.status === 200) {
        const { data } = response;
        const s: BeefCattleSubtype[] = (
          data as { id: number; name: string; solidperpoundperanimalperday: number }[]
        ).map((row) => ({
          id: row.id,
          name: row.name,
          solidperpoundperanimalperday: row.solidperpoundperanimalperday,
        }));
        setSubtypes(s);
        const sOptions: { value: number; label: string }[] = (
          data as { id: number; name: string }[]
        ).map((row) => ({ value: row.id, label: row.name }));
        setSubtypeOptions(sOptions);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setShowCollectionDays(Boolean(formData.daysCollected));
  }, [formData.daysCollected]);

  // save to form data on change
  const handleInputChange = (name: string, value: string | number | undefined) => {
    setFormData((prev) => {
      const updatedData = { ...prev, [name]: value };
      return updatedData;
    });
  };


  return (
    <Grid
      container
      spacing={2}
    >
      <Select
        style={{ maxWidth: '12em' }}
        isRequired
        label="Cattle Type"
        placeholder="Select a cattle type"
        selectedKey={formData?.subtype}
        items={subtypeOptions}
        onSelectionChange={(e: any) => {
          const selectedItem =
          subtypeOptions.find((item) => item.label === e)?.value.toString();
          handleInputChange('subtype', selectedItem);
        }}
      />
      <TextField
        style={{ maxWidth: '20em' }}
        isRequired
        label="Average Animal Number on Farm"
        type="number"
        name="animalsPerFarm"
        size="small"
        value={formData?.animalsPerFarm}
        onChange={(e: any) => {
          handleInputChange('animalsPerFarm', e);
        }}
        maxLength={7}
      />
      Do you pile or collect manure from these animals?
      <Checkbox
        value={showCollectionDays}
        orientation="horizontal"
        isSelected={showCollectionDays}
        onChange={setShowCollectionDays}
      />
      {showCollectionDays && (
        <TextField
          style={{ maxWidth: '20em' }}
          label="How many days is the manure collected?"
          type="number"
          name="daysCollected"
          size="small"
          value={formData?.daysCollected}
          onChange={(e: any) => {
            handleInputChange('daysCollected', e);
          }}
          maxLength={3}
          isRequired
        />
      )}
    </Grid>
  );
}
