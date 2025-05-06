/* eslint-disable react/jsx-props-no-spreading */
import React, { useContext, useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import { Checkbox, TextField, Select } from '@bcgov/design-system-react-components';
import { APICacheContext } from '@/context/APICacheContext';
import { BeefCattleData } from './types';
import { formGridBreakpoints } from '@/common.styles';

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
  const [, Modal] = useState<BeefCattleSubtype[]>([]);
  const [subFormData, setSubFormData] = useState<BeefCattleData>(formData);
  const [subtypeOptions, setSubtypeOptions] = useState<{ id: string; label: string }[]>([]);
  const [showCollectionDays, setShowCollectionDays] = useState<boolean>();

  // only run on initial mount
  useEffect(() => {
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
        Modal(s);
        const sOptions: { id: string; label: string }[] = (
          data as { id: number; name: string }[]
        ).map((row) => ({ id: row.id.toString(), label: row.name }));
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
    setSubFormData((prev) => {
      const updatedData = { ...prev, [name]: value };
      return updatedData;
    });
  };

  return (
    <div>
      <Grid
        container
        spacing={2}
      >
        <Grid size={formGridBreakpoints}>
          <Select
            isRequired
            label="Cattle Type"
            placeholder="Select a cattle type"
            selectedKey={subFormData?.subtype}
            items={subtypeOptions}
            onSelectionChange={(e: any) => {
              handleInputChange('subtype', e?.toString());
            }}
          />
        </Grid>
        <Grid size={formGridBreakpoints}>
          <TextField
            isRequired
            label="Average Animal Number on Farm"
            type="number"
            name="animalsPerFarm"
            value={subFormData?.animalsPerFarm?.toString()}
            onChange={(e: any) => {
              handleInputChange('animalsPerFarm', e);
            }}
            maxLength={7}
          />
        </Grid>
        <Grid size={12}>
          <Checkbox
            isSelected={showCollectionDays}
            onChange={setShowCollectionDays}
          >
            Do you pile or collect manure from these animals?
          </Checkbox>
        </Grid>
        {showCollectionDays && (
          <Grid size={formGridBreakpoints}>
            <TextField
              label="How many days is the manure collected?"
              type="number"
              name="daysCollected"
              size="small"
              value={subFormData?.daysCollected?.toString()}
              onChange={(e: any) => {
                handleInputChange('daysCollected', e);
              }}
              maxLength={3}
              isRequired={showCollectionDays}
            />
          </Grid>
        )}
      </Grid>
    </div>
  );
}
