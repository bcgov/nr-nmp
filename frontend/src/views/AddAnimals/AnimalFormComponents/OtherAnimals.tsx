import { useContext, useEffect, useState } from 'react';
import { Checkbox } from '@bcgov/design-system-react-components';
import Grid from '@mui/material/Grid';
import { formGridBreakpoints } from '@/common.styles';
import { APICacheContext } from '@/context/APICacheContext';
import { NMPFileAnimal, ManureType, SelectOption, NMPFileOtherAnimal, Animal } from '@/types';
import { calculateAnnualLiquidManure, calculateAnnualSolidManure } from '../utils';
import { MANURE_TYPE_OPTIONS } from '@/constants';
import AnimalFormWrapper from './AnimalFormWrapper';
import { NumberField, Select } from '@/components/common';

type Subtype = {
  name: string;
  liquidpergalperanimalperday: number;
  solidperpoundperanimalperday: number;
};

type OtherAnimalsProps = {
  formData: NMPFileOtherAnimal;
  animals: SelectOption<Animal>[];
  handleInputChanges: (changes: { [name: string]: string | number | undefined }) => void;
  handleSubmit: (newFormData: NMPFileAnimal) => void;
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
      let withManureCalc: NMPFileOtherAnimal;
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
        const mappedSubtypes = data.map((row: any) => ({
          id: String(row.id),
          label: row.name,
          value: {
            name: row.name,
            solidperpoundperanimalperday: row.solidperpoundperanimalperday,
            liquidpergalperanimalperday: row.liquidpergalperanimalperday,
          },
        }));
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

          {formData.subtype &&
          subtypes.find((s) => s.id.toString() === formData.subtype)?.value
            .solidperpoundperanimalperday !== 0 ? (
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
          ) : null}
        </Grid>
      )}
      <Grid size={formGridBreakpoints}>
        <NumberField
          isRequired
          label="Average Animal Number on Farm"
          value={formData.animalsPerFarm}
          onChange={(e) => handleInputChanges({ animalsPerFarm: e })}
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
          <NumberField
            isRequired
            label="How many days is the manure collected?"
            size="small"
            value={formData.daysCollected}
            onChange={(e) => handleInputChanges({ daysCollected: e })}
            maxValue={365}
          />
        </Grid>
      )}
    </AnimalFormWrapper>
  );
}
