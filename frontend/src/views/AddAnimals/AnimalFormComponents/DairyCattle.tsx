import { Key, useContext, useEffect, useState } from 'react';
import { formGridBreakpoints } from '@/common.styles';
import manureTypeOptions from '@/constants/ManureTypeOptions';
import { APICacheContext } from '@/context/APICacheContext';
import { Select, TextField } from '@bcgov/design-system-react-components';
import Grid from '@mui/material/Grid';
import { AnimalData } from '../types';

type tempAnimalData = AnimalData & { id?: string; daysCollected?: string };
type ComponentProps = {
  handleInputChange: (fieldName: string, fieldValue: any) => void;
  initialFormData: tempAnimalData;
};

interface DairyCattleBreed {
  id: number;
  breedname: string;
  breedmanurefactor: number;
}

export default function DairyCattleFields({ handleInputChange, initialFormData }: ComponentProps) {
  const apiCache = useContext(APICacheContext);
  const [formData] = useState<any>(initialFormData);
  const [subtypeOptions, setSubtypeOptions] = useState<{ id: string; label: string }[]>([]);
  const [breedOptions, setBreedOptions] = useState<{ id: string; label: string }[]>([]);

  useEffect(() => {
    apiCache.callEndpoint('api/animal_subtypes/2/').then((response) => {
      if (response.status === 200) {
        const { data } = response;
        const subtypeOptionz: { id: string; label: string }[] = (
          data as { id: number; name: string }[]
        ).map((row) => ({ id: row.id.toString(), label: row.name }));
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
        // setBreeds(breedz);
        const breedOptionz = breedz.map((breed) => ({
          id: breed.id.toString(),
          label: breed.breedname,
        }));
        setBreedOptions(breedOptionz);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Grid size={formGridBreakpoints}>
        <Select
          label="Sub Type"
          name="subtype"
          selectedKey={formData?.subtype}
          items={subtypeOptions}
          onSelectionChange={(e: Key) => {
            handleInputChange('subtype', e?.toString());
          }}
          isRequired
        />
      </Grid>
      <Grid size={formGridBreakpoints}>
        <Select
          label="Breed"
          name="breed"
          selectedKey={formData?.breed}
          items={breedOptions}
          onSelectionChange={(e: Key) => {
            handleInputChange('breed', e?.toString());
          }}
          isRequired
        />
      </Grid>
      <Grid size={formGridBreakpoints}>
        <TextField
          label="Average Animal Number on Farm"
          type="number"
          name="animalsPerFarm"
          value={formData?.animalsPerFarm?.toString()}
          onChange={(e: string) => {
            handleInputChange('animalsPerFarm', e);
          }}
          maxLength={7}
          isRequired
        />
      </Grid>
      <Grid size={formGridBreakpoints}>
        <Select
          label="Manure Type"
          name="manureType"
          selectedKey={formData?.manureType}
          items={manureTypeOptions}
          onSelectionChange={(e: Key) => {
            handleInputChange('manureType', e?.toString());
          }}
          isRequired
        />
      </Grid>
      <Grid size={formGridBreakpoints}>
        <TextField
          label="Grazing Days per Year"
          type="number"
          name="grazingDaysPerYear"
          value={formData?.grazingDaysPerYear?.toString()}
          onChange={(e: string) => {
            handleInputChange('grazingDaysPerYear', e);
          }}
          maxLength={3}
          isRequired
        />
      </Grid>
    </>
  );
}
