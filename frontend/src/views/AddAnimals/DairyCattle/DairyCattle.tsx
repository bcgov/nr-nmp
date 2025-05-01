/* eslint-disable react/jsx-props-no-spreading */
import React, { useContext, useEffect, useMemo, useState } from 'react';
import Grid from '@mui/material/Grid';
import { TextField, Select } from '@bcgov/design-system-react-components';
import { APICacheContext } from '@/context/APICacheContext';
import { DairyCattleData, initialDairyFormData, MILKING_COW_ID } from '../types';
import MilkingFields from './MilkingFields';
import manureTypeOptions from '@/constants/ManureTypeOptions';

interface DairyCattleSubtype {
  id: number;
  name: string;
  liquidpergalperanimalperday: number;
  solidperpoundperanimalperday: number;
  washwater: number;
  milkproduction: number;
}

interface DairyCattleBreed {
  id: number;
  breedname: string;
  breedmanurefactor: number;
}

export default function DairyCattle({
  setFormData,
  formData,
}: {
  setFormData: React.Dispatch<React.SetStateAction<DairyCattleData>>;
  formData: DairyCattleData;
}) {
  const apiCache = useContext(APICacheContext);
  const [subtypes, setSubtypes] = useState<DairyCattleSubtype[]>([]);
  const [subtypeOptions, setSubtypeOptions] = useState<{ value: number; label: string }[]>([]);
  const [breeds, setBreeds] = useState<DairyCattleBreed[]>([]);
  const [breedOptions, setBreedOptions] = useState<{ value: number; label: string }[]>([]);

  useEffect(() => {
    setFormData((prev: DairyCattleData) => ({
      ...initialDairyFormData,
      ...prev,
    }));
  }, []);

  // Initial values for milking fields, if "Milking cow" is selected //
  const washWaterInit = useMemo(() => {
    if (subtypes.length === 0) return undefined;
    const milkingCow = subtypes.find((s) => s.id.toString() === MILKING_COW_ID);
    if (milkingCow === undefined) throw new Error('Milking cow is missing from list.');
    return milkingCow.washwater;
  }, [subtypes]);
  const milkProductionInit = useMemo(() => {
    if (subtypes.length === 0 || breeds.length === 0) return undefined;
    const milkingCow = subtypes.find((s) => s.id.toString() === MILKING_COW_ID);
    if (milkingCow === undefined) throw new Error('Milking cow is missing from list.');
    const breed = breeds.find((b) => b.id.toString() === formData.breed);
    if (breed) return milkingCow.milkproduction * breed.breedmanurefactor;
  }, [subtypes, breeds, formData.breed]);

  useEffect(() => {
    setFormData((prev: DairyCattleData) => ({
      ...initialDairyFormData,
      ...prev,
    }));
    apiCache.callEndpoint('api/animal_subtypes/2/').then((response) => {
      if (response.status === 200) {
        const { data } = response;
        // The data in the response has more properties, but we want to trim it down
        const subtypez: DairyCattleSubtype[] = (data as DairyCattleSubtype[]).map((row) => ({
          id: row.id,
          name: row.name,
          solidperpoundperanimalperday: row.solidperpoundperanimalperday,
          liquidpergalperanimalperday: row.liquidpergalperanimalperday,
          washwater: row.washwater,
          milkproduction: row.milkproduction,
        }));
        setSubtypes(subtypez);
        const subtypeOptionz: { value: number; label: string }[] = (
          data as { id: number; name: string }[]
        ).map((row) => ({ value: row.id, label: row.name }));
        setSubtypeOptions(subtypeOptionz);
      }
    });

    apiCache.callEndpoint('api/breeds/').then((response) => {
      if (response.status === 200) {
        const { data } = response;
        // The data in the response has more properties, but we want to trim it down
        const breedz: DairyCattleBreed[] = (data as DairyCattleBreed[]).map((row) => ({
          id: row.id,
          breedname: row.breedname,
          breedmanurefactor: row.breedmanurefactor,
        }));
        setBreeds(breedz);
        const breedOptionz = breedz.map((breed) => ({ value: breed.id, label: breed.breedname }));
        setBreedOptions(breedOptionz);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        style={{ maxWidth: '15em' }}
        label="Sub Type"
        name="subtype"
        selectedKey={formData?.subtype}
        items={subtypeOptions}
        onSelectionChange={(e: any) => {
          const selectedItem =
          subtypeOptions.find((item) => item.label === e)?.value.toString();
          console.log(selectedItem)
          handleInputChange('subtype', selectedItem);
        }}
        isRequired
      />
      <Select
        label="Breed"
        name="breed"
        selectedKey={formData?.breed}
        items={breedOptions}
        onSelectionChange={(e: string) => {
          handleInputChange('breed', e);
        }}
        isRequired
      />
      <TextField
        style={{ maxWidth: '15em' }}
        label="Average Animal Number on Farm"
        type="number"
        name="animalsPerFarm"
        value={formData?.animalsPerFarm?.toString()}
        onChange={(e: number) => {
          handleInputChange('animalsPerFarm', e);
        }}
        maxLength={7}
        isRequired
      />
      <Select
        label="Manure Type"
        name="manureType"
        selectedKey={formData?.manureType}
        items={manureTypeOptions}
        onSelectionChange={(e: number) => {
          handleInputChange('manureType', e);
        }}
        isRequired
      />
      <TextField
        style={{ maxWidth: '12em' }}
        label="Grazing Days per Year"
        type="number"
        name="grazingDaysPerYear"
        value={formData?.grazingDaysPerYear?.toString()}
        onChange={(e: number) => {
          handleInputChange('grazingDaysPerYear', e);
        }}
        maxLength={3}
        isRequired
      />
      {formData.subtype === MILKING_COW_ID &&
        milkProductionInit !== undefined &&
        washWaterInit !== undefined && (
          <MilkingFields
            milkProductionInit={milkProductionInit}
            washWaterInit={washWaterInit}
            animalsPerFarm={formData.animalsPerFarm || 0}
            washWaterUnit={formData.washWaterUnit}
            handleChange={(e: any) => {
              handleInputChange('grazingDaysPerYear', e);
            }}
            setFormData={setFormData}
          />
        )}
    </Grid>
  );
}
