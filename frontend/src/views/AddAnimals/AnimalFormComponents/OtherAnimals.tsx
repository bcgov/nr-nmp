import { FormEvent, useContext, useEffect, useState } from 'react';
import { Checkbox, Select, TextField } from '@bcgov/design-system-react-components';
import Grid from '@mui/material/Grid';
import { formGridBreakpoints } from '@/common.styles';
import { APICacheContext } from '@/context/APICacheContext';
import { AnimalData, ManureType, SelectOption } from '@/types';
import { calculateAnnualSolidManure } from '../utils';
import AnimalFormWrapper from './AnimalFormWrapper';
import { OtherAnimalData } from '@/types/Animals';
import { MANURE_TYPE_OPTIONS } from '@/constants';

type Subtype = {
  id: number;
  name: string;
  liquidpergalperanimalperday: number;
  solidperpoundperanimalperday: number;
};

type OtherAnimalsProps = {
  formData: OtherAnimalData;
  animals: SelectOption<Animal>[];
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
  const [subtypes, setSubtypes] = useState<Subtype[]>([]);
  const [subtypeOptions, setSubtypeOptions] = useState<{ id: string; label: string }[]>([]);

  const onSubmit = () => {
    // Calculate manure
    const selectedSubtype = subtypes.find((s) => s.id.toString() === formData.subtype);
    if (selectedSubtype !== null && selectedSubtype !== undefined) {
      const withManureCalc = {
        ...formData,
        manureData: {
          name: selectedSubtype.name,
          manureType: ManureType.Solid,
          annualSolidManure: calculateAnnualSolidManure(
            selectedSubtype ? selectedSubtype.solidperpoundperanimalperday : 0,
            formData.animalsPerFarm!,
            formData.daysCollected || 0,
          ),
        },
      };
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
        // get subtypes with animalId = 9 swine
        const subtypez: Subtype[] = (data as Subtype[]).map((row: any) => ({
          id: row.id,
          name: row.name,
          solidperpoundperanimalperday: row.solidperpoundperanimalperday,
          liquidpergalperanimalperday: row.liquidpergalperanimalperday,
        }));
        setSubtypes(data);
        const subtypeOptionz: { id: string; label: string }[] = subtypez.map((row) => ({
          id: row.id.toString(),
          label: row.name,
        }));
        setSubtypeOptions(subtypeOptionz);
        // if animal not swine and only has one subtype option set subtype automatically
        if (subtypeOptionz.length < 2) {
          handleInputChanges({ subtype: String(subtypeOptionz[0].id) });
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
            items={subtypeOptions}
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
        <NumberField
          isRequired
          label="Average Animal Number on Farm"
          value={formData.animalsPerFarm}
          onChange={(e) => handleInputChanges({ animalsPerFarm: e })}
          minValue={0}
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
            minValue={0}
            maxValue={365}
          />
        </Grid>
      )}
    </AnimalFormWrapper>
  );
}
