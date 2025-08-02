import { useContext, useEffect, useState } from 'react';
import { Checkbox } from '@bcgov/design-system-react-components';
import Grid from '@mui/material/Grid';
import { formGridBreakpoints } from '@/common.styles';
import { APICacheContext } from '@/context/APICacheContext';
import { AnimalData, ManureType, SelectOption } from '@/types';
import { calculateAnnualSolidManure } from '../utils';
import AnimalFormWrapper from './AnimalFormWrapper';
import { Animal, OtherAnimalData } from '@/types/Animals';
import { NumberField } from '@/components/common';

type Subtype = {
  animalid: number;
  name: string;
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
  const [subtype, setSubtype] = useState<Subtype | null>(null);

  const onSubmit = () => {
    // Calculate manure
    if (subtype === null) throw new Error('Submit occurred when it should be disabled.');
    const withManureCalc = {
      ...formData,
      manureData: {
        name: subtype.name,
        manureType: ManureType.Solid,
        annualSolidManure: calculateAnnualSolidManure(
          subtype.solidperpoundperanimalperday,
          formData.animalsPerFarm!,
          formData.daysCollected || 0,
        ),
      },
    };
    handleSubmit(withManureCalc);
  };

  useEffect(() => {
    apiCache.callEndpoint(`api/animal_subtypes/${formData.animalId}/`).then((response) => {
      if (response.status === 200) {
        const castedData = response.data as Subtype[];
        setSubtype({
          animalid: castedData[0].animalid,
          name: castedData[0].name,
          solidperpoundperanimalperday: castedData[0].solidperpoundperanimalperday,
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.animalId]);

  return (
    <AnimalFormWrapper
      selectedAnimalId={formData.animalId}
      handleInputChanges={handleInputChanges}
      onSubmit={onSubmit}
      isConfirmDisabled={subtype === null || String(subtype.animalid) !== formData.animalId}
      {...props}
    >
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
