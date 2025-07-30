import { FormEvent, useContext, useEffect, useMemo, useState } from 'react';
import { TextField } from '@bcgov/design-system-react-components';
import Grid from '@mui/material/Grid';
import { Select } from '@/components/common';
import { formGridBreakpoints } from '@/common.styles';
import MANURE_TYPE_OPTIONS from '@/constants/ManureTypeOptions';
import { APICacheContext } from '@/context/APICacheContext';
import { AnimalData, DAIRY_COW_ID, DairyCattleData, MILKING_COW_ID, SelectOption } from '@/types';
import { calculateAnnualLiquidManure, calculateAnnualSolidManure } from '../utils';
import MilkingFields from './MilkingFields';
import AnimalFormWrapper from './AnimalFormWrapper';
import { ManureType } from '@/types/Animals';

type DairyCattleProps = {
  formData: DairyCattleData;
  animalOptions: SelectOption[];
  handleInputChanges: (changes: { [name: string]: string | number | undefined }) => void;
  handleSubmit: (newFormData: AnimalData) => void;
  onCancel: () => void;
};

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
  formData,
  handleInputChanges,
  handleSubmit,
  ...props
}: DairyCattleProps) {
  const apiCache = useContext(APICacheContext);
  const [subtypes, setSubtypes] = useState<DairyCattleSubtype[]>([]);
  const [subtypeOptions, setSubtypeOptions] = useState<{ id: string; label: string }[]>([]);
  const [breeds, setBreeds] = useState<DairyCattleBreed[]>([]);
  const [breedOptions, setBreedOptions] = useState<{ id: string; label: string }[]>([]);

  // Initial values for milking fields, if "Milking cow" is selected //
  const washWaterInit = useMemo(() => {
    if (formData.washWater || formData.washWater === 0) return formData.washWater;
    if (subtypes.length === 0) return undefined;
    const milkingCow = subtypes.find((s) => s.id.toString() === MILKING_COW_ID);
    if (milkingCow === undefined) throw new Error('Milking cow is missing from list.');
    return milkingCow.washwater;
  }, [formData.washWater, subtypes]);
  const milkProductionInit = useMemo(() => {
    if (subtypes.length === 0 || breeds.length === 0) return undefined;
    const milkingCow = subtypes.find((s) => s.id.toString() === MILKING_COW_ID);
    if (milkingCow === undefined) throw new Error('Milking cow is missing from list.');
    const breed = breeds.find((b) => b.id.toString() === formData.breed);
    if (breed === undefined) throw new Error(`Breed ${breed} is missing from list.`);
    return milkingCow.milkproduction * breed.breedmanurefactor;
  }, [subtypes, breeds, formData.breed]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Calculate manure
    const subtype = subtypes.find((s) => s.id.toString() === formData.subtype);
    if (subtype === undefined) throw new Error('Chosen subtype is missing from list.');
    const breed = breeds.find((b) => b.id.toString() === formData.breed);
    if (breed === undefined) throw new Error('Chosen breed is missing from list.');
    const nonGrazingDays = 365 - formData.grazingDaysPerYear!;

    let extraCoefficient;
    if (formData.subtype === MILKING_COW_ID) {
      if (formData.milkProduction === undefined) {
        extraCoefficient = 0;
      } else {
        const expectedMilkProduction = subtype.milkproduction * breed.breedmanurefactor;
        // Due to potential floating point issues, round factor to 1 if numbers are close
        const milkProdPercent =
          Math.abs(expectedMilkProduction - formData.milkProduction) < 1
            ? 1
            : formData.milkProduction / expectedMilkProduction;
        extraCoefficient = breed.breedmanurefactor * milkProdPercent;
      }
    } else {
      extraCoefficient = breed.breedmanurefactor;
    }

    let withManureCalc: DairyCattleData;
    if (formData.manureType === ManureType.Liquid) {
      withManureCalc = {
        ...formData,
        manureData: {
          name: subtype.name,
          annualLiquidManure: calculateAnnualLiquidManure(
            subtype.liquidpergalperanimalperday,
            formData.animalsPerFarm!,
            nonGrazingDays,
            extraCoefficient,
          ),
          annualSolidManure: undefined,
        },
      };
    } else {
      withManureCalc = {
        ...formData,
        manureData: {
          name: subtype.name,
          annualSolidManure: calculateAnnualSolidManure(
            subtype.solidperpoundperanimalperday,
            formData.animalsPerFarm!,
            nonGrazingDays,
            extraCoefficient,
          ),
          annualLiquidManure: undefined,
        },
      };
    }
    handleSubmit(withManureCalc);
  };

  useEffect(() => {
    apiCache.callEndpoint(`api/animal_subtypes/${DAIRY_COW_ID}/`).then((response) => {
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
        const subtypeOptionz: { id: string; label: string }[] = subtypez.map((row) => ({
          id: row.id.toString(),
          label: row.name,
        }));
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
    <AnimalFormWrapper
      selectedAnimalId={DAIRY_COW_ID}
      handleInputChanges={handleInputChanges}
      onSubmit={onSubmit}
      {...props}
    >
      <Grid size={formGridBreakpoints}>
        <Select
          label="Sub Type"
          name="subtype"
          selectedKey={formData.subtype}
          items={subtypeOptions}
          onSelectionChange={(e) => {
            handleInputChanges({ subtype: e?.toString() });
          }}
          isRequired
        />
      </Grid>
      <Grid size={formGridBreakpoints}>
        <Select
          label="Breed"
          name="breed"
          selectedKey={formData.breed}
          items={breedOptions}
          onSelectionChange={(e) => {
            handleInputChanges({ breed: e?.toString() });
          }}
          isRequired
        />
      </Grid>
      <Grid size={formGridBreakpoints}>
        <TextField
          label="Average Animal Number on Farm"
          type="number"
          name="animalsPerFarm"
          value={formData.animalsPerFarm?.toString()}
          onChange={(e: string) => {
            handleInputChanges({ animalsPerFarm: Number(e) });
          }}
          maxLength={7}
          isRequired
        />
      </Grid>
      <Grid size={formGridBreakpoints}>
        <Select
          label="Manure Type"
          name="manureType"
          selectedKey={formData.manureType}
          items={MANURE_TYPE_OPTIONS}
          onSelectionChange={(e) => {
            handleInputChanges({ manureType: e as number });
          }}
          isRequired
        />
      </Grid>
      <Grid size={formGridBreakpoints}>
        <TextField
          label="Grazing Days per Year"
          type="number"
          name="grazingDaysPerYear"
          value={formData.grazingDaysPerYear?.toString()}
          onChange={(e: string) => {
            handleInputChanges({ grazingDaysPerYear: Number(e) });
          }}
          maxLength={3}
          isRequired
        />
      </Grid>
      {formData.subtype === MILKING_COW_ID &&
        milkProductionInit !== undefined &&
        washWaterInit !== undefined && (
          <MilkingFields
            milkProductionInit={milkProductionInit}
            washWaterInit={washWaterInit}
            animalsPerFarm={formData.animalsPerFarm || 0}
            washWaterUnit={formData.washWaterUnit}
            handleInputChanges={handleInputChanges}
          />
        )}
    </AnimalFormWrapper>
  );
}
