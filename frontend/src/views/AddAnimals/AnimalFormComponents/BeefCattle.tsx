import { useContext, useEffect, useState } from 'react';
import { Checkbox } from '@bcgov/design-system-react-components';
import Grid from '@mui/material/Grid';
import { NumberField, Select } from '@/components/common';
import { formGridBreakpoints } from '@/common.styles';
import { APICacheContext } from '@/context/APICacheContext';
import { Animal, NMPFileAnimal, NMPFileBeefCattle, ManureType, SelectOption } from '@/types';
import { calculateAnnualSolidManure } from '../utils';
import AnimalFormWrapper from './AnimalFormWrapper';
import { BEEF_COW_ID } from '@/constants';

interface BeefCattleSubtype {
  id: number;
  name: string;
  solidperpoundperanimalperday: number;
}

type BeefCattleProps = {
  formData: NMPFileBeefCattle;
  animals: SelectOption<Animal>[];
  handleInputChanges: (changes: { [name: string]: string | number | undefined }) => void;
  handleSubmit: (newFormData: NMPFileAnimal) => void;
  onCancel: () => void;
};

export default function BeefCattle({
  formData,
  handleInputChanges,
  handleSubmit,
  ...props
}: BeefCattleProps) {
  const apiCache = useContext(APICacheContext);
  const [showCollectionDays, setShowCollectionDays] = useState<boolean>(!!formData.daysCollected);
  const [subtypeOptions, setSubtypeOptions] = useState<{ id: string; label: string }[]>([]);
  const [subtypes, setSubtypes] = useState<BeefCattleSubtype[]>([]);

  const onSubmit = () => {
    // Calculate manure
    const subtype = subtypes.find((s) => s.id.toString() === formData.subtype);
    if (subtype === undefined) throw new Error('Chosen subtype is missing from list.');
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

  // only run on initial mount
  useEffect(() => {
    apiCache.callEndpoint(`api/animal_subtypes/${BEEF_COW_ID}/`).then((response) => {
      if (response.status === 200) {
        const { data } = response;
        const subtypez: BeefCattleSubtype[] = (
          data as { id: number; name: string; solidperpoundperanimalperday: number }[]
        ).map((row) => ({
          id: row.id,
          name: row.name,
          solidperpoundperanimalperday: row.solidperpoundperanimalperday,
        }));
        setSubtypes(subtypez);
        const sOptions: { id: string; label: string }[] = subtypez.map((row) => ({
          id: row.id.toString(),
          label: row.name,
        }));
        setSubtypeOptions(sOptions);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AnimalFormWrapper
      selectedAnimalId={BEEF_COW_ID}
      handleInputChanges={handleInputChanges}
      onSubmit={onSubmit}
      {...props}
    >
      <Grid size={formGridBreakpoints}>
        <Select
          isRequired
          label="Cattle Type"
          placeholder="Select a cattle type"
          selectedKey={formData.subtype}
          items={subtypeOptions}
          onSelectionChange={(e) => handleInputChanges({ subtype: e as string })}
        />
      </Grid>
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
            step={1}
          />
        </Grid>
      )}
    </AnimalFormWrapper>
  );
}
