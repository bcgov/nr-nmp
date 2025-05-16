import { FormEvent, Key, useContext, useEffect, useState } from 'react';
import { Checkbox, Select, TextField } from '@bcgov/design-system-react-components';
import Grid from '@mui/material/Grid';
import { formGridBreakpoints } from '@/common.styles';
import { APICacheContext } from '@/context/APICacheContext';
import { AnimalData, BEEF_COW_ID, BeefCattleData } from '../types';
import { calculateAnnualSolidManure } from '../utils';
import AnimalFormWrapper from './AnimalFormWrapper';

interface BeefCattleSubtype {
  id: number;
  name: string;
  solidperpoundperanimalperday: number;
}

type BeefCattleProps = {
  formData: BeefCattleData;
  handleInputChanges: (changes: { [name: string]: string | number | undefined }) => void;
  handleSubmit: (newFormData: AnimalData) => void;
  onCancel: () => void;
};

export default function BeefCattle({
  formData,
  handleInputChanges,
  handleSubmit,
  onCancel,
}: BeefCattleProps) {
  const apiCache = useContext(APICacheContext);
  const [showCollectionDays, setShowCollectionDays] = useState<boolean>(!!formData?.daysCollected);
  const [subtypeOptions, setSubtypeOptions] = useState<{ id: string; label: string }[]>([]);
  const [subtypes, setSubtypes] = useState<BeefCattleSubtype[]>([]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Calculate manure
    const subtype = subtypes.find((s) => s.id.toString() === formData.subtype);
    if (subtype === undefined) throw new Error('Chosen subtype is missing from list.');
    const withManureCalc = {
      ...formData,
      manureData: {
        name: subtype.name,
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
    apiCache.callEndpoint('api/animal_subtypes/1/').then((response) => {
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
      onCancel={onCancel}
      onSubmit={onSubmit}
    >
      <Grid size={formGridBreakpoints}>
        <Select
          isRequired
          label="Cattle Type"
          placeholder="Select a cattle type"
          selectedKey={formData?.subtype}
          items={subtypeOptions}
          onSelectionChange={(e: Key) => {
            handleInputChanges({ subtype: e?.toString() });
          }}
        />
      </Grid>
      <Grid size={formGridBreakpoints}>
        <TextField
          isRequired
          label="Average Animal Number on Farm"
          type="number"
          name="animalsPerFarm"
          value={formData?.animalsPerFarm?.toString()}
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
            value={formData?.daysCollected?.toString()}
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
