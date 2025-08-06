import { useContext, useEffect, useState } from 'react';
import { Checkbox, Select, TextField } from '@bcgov/design-system-react-components';
import Grid from '@mui/material/Grid';
import { formGridBreakpoints } from '@/common.styles';
import { APICacheContext } from '@/context/APICacheContext';
import { AnimalData, ManureType, SelectOption } from '@/types';
import { calculateAnnualLiquidManure, calculateAnnualSolidManure } from '../utils';
import { MANURE_TYPE_OPTIONS } from '@/constants';
import AnimalFormWrapper from './AnimalFormWrapper';
import { Animal, OtherAnimalData } from '@/types/Animals';

type Subtype = {
  animalid: number;
  name: string;
  liquidpergalperanimalperday: number;
  solidperpoundperanimalperday: number;
};

type OtherAnimalsProps = {
  formData: OtherAnimalData;
  animalOptions: SelectOption<Animal>[];
  handleInputChanges: (changes: { [name: string]: string | number | undefined }) => void;
  handleSubmit: (newFormData: AnimalData) => void;
  onCancel: () => void;
};

export default function OtherAnimals({
  formData,
  handleInputChanges,
  handleSubmit,
  ...props
}: OtherAnimalsProps) {
  const apiCache = useContext(APICacheContext);
  const [showCollectionDays, setShowCollectionDays] = useState<boolean>(!!formData.daysCollected);
  const [subtypes, setSubtypes] = useState<SelectOption<Subtype>[]>([]);

  const onSubmit = () => {
    // Calculate manure
    const selectedSubtype = subtypes.find((s) => s.id.toString() === formData.subtype);
    if (selectedSubtype !== null && selectedSubtype !== undefined) {
      let withManureCalc: OtherAnimalData;
      if (formData.manureType === ManureType.Liquid) {
        withManureCalc = {
          ...formData,
          manureData: {
            name: selectedSubtype.value.name,
            annualLiquidManure: calculateAnnualLiquidManure(
              selectedSubtype.value.liquidpergalperanimalperday,
              formData.animalsPerFarm!,
              formData.daysCollected || 0,
            ),
            annualSolidManure: undefined,
          },
        };
      } else {
        withManureCalc = {
          ...formData,
          manureData: {
            name: selectedSubtype.value.name,
            annualLiquidManure: undefined,
            annualSolidManure: calculateAnnualSolidManure(
              selectedSubtype.value.solidperpoundperanimalperday,
              formData.animalsPerFarm!,
              formData.daysCollected || 0,
            ),
          },
        };
      }
      handleSubmit(withManureCalc);
    } else {
      throw new Error('Submit occurred when it should be disabled.');
    }
  };

  // autoset subtype for animals that only have one subtype
  useEffect(() => {
    apiCache.callEndpoint(`api/animal_subtypes/${formData.animalId}/`).then((response) => {
      if (response.status === 200) {
        const { data } = response;
        const mappedSubtypes = data.map((row: Subtype) => ({
          id: row.name,
          label: row.name,
          value: {
            name: row.name,
            solidperpoundperanimalperday: row.solidperpoundperanimalperday,
            liquidpergalperanimalperday: row.liquidpergalperanimalperday,
          },
        }));
        console.log(mappedSubtypes);
        setSubtypes(mappedSubtypes);
        // if animal not swine and only has one subtype option set subtype automatically
        if (mappedSubtypes.length === 1) {
          handleInputChanges({ subtype: String(mappedSubtypes[0].id) });
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.animalId]);

  return (
    <AnimalFormWrapper
      selectedAnimalId={formData.animalId}
      handleInputChanges={handleInputChanges}
      onSubmit={onSubmit}
      isConfirmDisabled={!formData.subtype}
      {...props}
    >
      {formData.animalId === '9' && (
        <Grid size={formGridBreakpoints}>
          <Select
            label="Sub Type"
            name="subtype"
            selectedKey={formData.subtype}
            items={subtypes}
            onSelectionChange={(e) => {
              handleInputChanges({ subtype: String(e) });
            }}
            isRequired
          />

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
      )}
      <Grid size={formGridBreakpoints}>
        <TextField
          isRequired
          label="Average Animal Number on Farm"
          type="number"
          name="animalsPerFarm"
          value={formData.animalsPerFarm?.toString()}
          onChange={(e: string) => {
            handleInputChanges({ animalsPerFarm: e });
          }}
          maxLength={7}
        />
      </Grid>
      <Grid size={12}>
        <Checkbox
          isSelected={showCollectionDays}
          onChange={(e: boolean) => {
            if (!e) handleInputChanges({ daysCollected: undefined });
            setShowCollectionDays(e);
          }}
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
            value={formData.daysCollected?.toString()}
            onChange={(e: string) => {
              handleInputChanges({ daysCollected: e });
            }}
            maxLength={3}
            isRequired={showCollectionDays}
          />
        </Grid>
      )}
    </AnimalFormWrapper>
  );
}
