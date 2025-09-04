import { useContext, useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import { NumberField, Select } from '@/components/common';
import { formGridBreakpoints } from '@/common.styles';
import { APICacheContext } from '@/context/APICacheContext';
import { NMPFileAnimal, NMPFilePoultry, ManureType, SelectOption, Animal } from '@/types';
import { calculatePoultryAnnualLiquidManure, calculatePoultryAnnualSolidManure } from '../utils';
import AnimalFormWrapper from './AnimalFormWrapper';
import { DUCK_ID, MANURE_TYPE_OPTIONS, POULTRY_ID } from '@/constants';

type PoultryProps = {
  formData: NMPFilePoultry;
  animals: SelectOption<Animal>[];
  handleInputChanges: (changes: { [name: string]: string | number | undefined }) => void;
  handleSubmit: (newFormData: NMPFileAnimal) => void;
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
  ...props
}: PoultryProps) {
  const apiCache = useContext(APICacheContext);
  const [subtypes, setSubtypes] = useState<PoultrySubtype[]>([]);
  const [subtypeOptions, setSubtypeOptions] = useState<{ id: string; label: string }[]>([]);

  const onSubmit = () => {
    // Calculate manure
    const subtype = subtypes.find((s) => s.id.toString() === formData.subtype);
    if (subtype === undefined) throw new Error('Chosen subtype is missing from list.');

    let withManureCalc: NMPFilePoultry;
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

  useEffect(() => {
    apiCache.callEndpoint(`api/animal_subtypes/${POULTRY_ID}/`).then((response) => {
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
        setSubtypeOptions(subtypeOptionz);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AnimalFormWrapper
      selectedAnimalId={POULTRY_ID}
      handleInputChanges={handleInputChanges}
      onSubmit={onSubmit}
      {...props}
    >
      <Grid size={formGridBreakpoints}>
        <Select
          label="Sub Type"
          selectedKey={formData.subtype}
          items={subtypeOptions}
          onSelectionChange={(e) => {
            e === DUCK_ID
              ? handleInputChanges({ subtype: e as string, manureType: ManureType.Solid })
              : handleInputChanges({ subtype: e as string });
          }}
          isRequired
        />
      </Grid>
      {/* Ducks don't have choice of manure type */}
      {formData.subtype !== DUCK_ID && (
        <Grid size={formGridBreakpoints}>
          <Select
            label="Manure Type"
            selectedKey={formData.manureType}
            items={MANURE_TYPE_OPTIONS}
            onSelectionChange={(e) => handleInputChanges({ manureType: e as number })}
            isRequired
          />
        </Grid>
      )}
      <Grid size={formGridBreakpoints}>
        <NumberField
          isRequired
          label="Number of birds per flock"
          value={formData.birdsPerFlock}
          onChange={(e) => handleInputChanges({ birdsPerFlock: e })}
          step={1}
        />
      </Grid>
      <Grid size={formGridBreakpoints}>
        <NumberField
          isRequired
          label="Number of flocks per year"
          value={formData.flocksPerYear}
          onChange={(e) => handleInputChanges({ flocksPerYear: e })}
          step={1}
        />
      </Grid>
      {/*  number of days before flock is removed or replaced */}
      <Grid size={formGridBreakpoints}>
        <NumberField
          isRequired
          label="Number of days per flock"
          value={formData.daysPerFlock}
          onChange={(e) => handleInputChanges({ daysPerFlock: e })}
          step={1}
          maxValue={365}
        />
      </Grid>
    </AnimalFormWrapper>
  );
}
