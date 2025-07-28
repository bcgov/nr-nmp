import { FormEvent, Key, useContext, useEffect, useState } from 'react';
import { TextField } from '@bcgov/design-system-react-components';
import Grid from '@mui/material/Grid';
import { Select } from '@/components/common';
import { formGridBreakpoints } from '@/common.styles';
import MANURE_TYPE_OPTIONS from '@/constants/ManureTypeOptions';
import { APICacheContext } from '@/context/APICacheContext';
import { AnimalData, DAIRY_COW_ID, PoultryData, MILKING_COW_ID } from '@/types';
import { calculatePoultryAnnualLiquidManure, calculatePoultryAnnualSolidManure } from '../utils';
import MilkingFields from './MilkingFields';
import AnimalFormWrapper from './AnimalFormWrapper';
import { ManureType } from '@/types/Animals';

type PoultryProps = {
  formData: PoultryData;
  handleInputChanges: (changes: { [name: string]: string | number | undefined }) => void;
  handleSubmit: (newFormData: AnimalData) => void;
  onCancel: () => void;
};

interface PoultrySubtype {
  id: number;
  name: string;
  liquidpergalperanimalperday: number;
  solidperpoundperanimalperday: number;
}

export default function Poultry({
  formData,
  handleInputChanges,
  handleSubmit,
  onCancel,
}: PoultryProps) {
  const apiCache = useContext(APICacheContext);
  const [subtypes, setSubtypes] = useState<PoultrySubtype[]>([]);
  const [subtypeOptions, setSubtypeOptions] = useState<{ id: string; label: string }[]>([]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Calculate manure
    const subtype = subtypes.find((s) => s.id.toString() === formData.subtype);
    if (subtype === undefined) throw new Error('Chosen subtype is missing from list.');

    let withManureCalc: PoultryData;
    if (formData.manureType === ManureType.Liquid) {
      withManureCalc = {
        ...formData,
        manureData: {
          name: subtype.name,
          annualLiquidManure: calculatePoultryAnnualLiquidManure(
            subtype.liquidpergalperanimalperday,
            formData.birdsPerFlock!,
            formData.flocksPerYear!,
            formData.daysPerFlock!,
          ),
          annualSolidManure: undefined,
        },
      };
    } else {
      withManureCalc = {
        ...formData,
        manureData: {
          name: subtype.name,
          annualSolidManure: calculatePoultryAnnualSolidManure(
            subtype.solidperpoundperanimalperday,
            formData.birdsPerFlock!,
            formData.flocksPerYear!,
            formData.daysPerFlock!,
          ),
          annualLiquidManure: undefined,
        },
      };
    }
    handleSubmit(withManureCalc);
  };

  // poultry animal id = 6 get animalid
  useEffect(() => {
    apiCache.callEndpoint('api/animal_subtypes/2/').then((response) => {
      if (response.status === 200) {
        const { data } = response;
        // The data in the response has more properties, but we want to trim it down
        const subtypez: PoultrySubtype[] = (data as PoultrySubtype[]).map((row) => ({
          id: row.id,
          name: row.name,
          solidperpoundperanimalperday: row.solidperpoundperanimalperday,
          liquidpergalperanimalperday: row.liquidpergalperanimalperday,
        }));
        setSubtypes(subtypez);
        const subtypeOptionz: { id: string; label: string }[] = subtypez.map((row) => ({
          id: row.id.toString(),
          label: row.name,
        }));
        console.log(setSubtypeOptions);
        setSubtypeOptions(subtypeOptionz);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AnimalFormWrapper
      selectedAnimalId={DAIRY_COW_ID}
      handleInputChanges={handleInputChanges}
      onCancel={onCancel}
      onSubmit={onSubmit}
    >
      <Grid size={formGridBreakpoints}>
        <Select
          label="Sub Type"
          name="subtype"
          selectedKey={formData.subtype}
          items={subtypeOptions}
          onSelectionChange={(e: Key) => {
            handleInputChanges({ subtype: e.toString() });
          }}
          isRequired
        />
      </Grid>
      <Grid size={formGridBreakpoints}>
        <TextField
          label="Number of birds per flock"
          type="number"
          name="birdsPerFlock"
          value={formData.birdsPerFlock?.toString()}
          onChange={(e: string) => {
            handleInputChanges({ birdsPerFlock: Number(e) });
          }}
          maxLength={7}
          isRequired
        />
      </Grid>
      <Grid size={formGridBreakpoints}>
        <TextField
          label="Number of flocks per year"
          type="number"
          name="flocksPerYear"
          value={formData.flocksPerYear?.toString()}
          onChange={(e: string) => {
            handleInputChanges({ flocksPerYear: Number(e) });
          }}
          maxLength={7}
          isRequired
        />
      </Grid>
      <Grid size={formGridBreakpoints}>
        <TextField
          label="Number of days per flock"
          type="number"
          name="daysPerFlock"
          value={formData.daysPerFlock?.toString()}
          onChange={(e: string) => {
            handleInputChanges({ daysPerFlock: Number(e) });
          }}
          maxLength={3}
          isRequired
        />
      </Grid>
    </AnimalFormWrapper>
  );
}
