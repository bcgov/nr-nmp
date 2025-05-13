import { Key, useContext, useEffect, useState } from 'react';
import { formGridBreakpoints } from '@/common.styles';
import { APICacheContext } from '@/context/APICacheContext';
import { Checkbox, Select, TextField } from '@bcgov/design-system-react-components';
import Grid from '@mui/material/Grid';
import { BeefCattleData } from '../types';

type tempBeefCattleData = BeefCattleData & { id?: string };
type ComponentProps = {
  handleInputChange: (fieldName: string, fieldValue: any) => void;
  initialFormData: tempBeefCattleData;
};

export default function BeefCattleFields({ handleInputChange, initialFormData }: ComponentProps) {
  const apiCache = useContext(APICacheContext);
  const [formData] = useState<tempBeefCattleData>(initialFormData);
  const [showCollectionDays, setShowCollectionDays] = useState<boolean>(
    !!initialFormData?.daysCollected,
  );
  const [subtypeOptions, setSubtypeOptions] = useState<{ id: string; label: string }[]>([]);

  // only run on initial mount
  useEffect(() => {
    apiCache.callEndpoint('api/animal_subtypes/1/').then((response) => {
      if (response.status === 200) {
        const { data } = response;
        const sOptions: { id: string; label: string }[] = (
          data as { id: number; name: string }[]
        ).map((row) => ({ id: row.id.toString(), label: row.name }));
        setSubtypeOptions(sOptions);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Grid size={formGridBreakpoints}>
        <Select
          isRequired
          label="Cattle Type"
          placeholder="Select a cattle type"
          selectedKey={formData?.subtype}
          items={subtypeOptions}
          onSelectionChange={(e: Key) => {
            handleInputChange('subtype', e?.toString());
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
            handleInputChange('animalsPerFarm', e);
          }}
          maxLength={7}
        />
      </Grid>
      <Grid size={12}>
        <Checkbox
          isSelected={showCollectionDays}
          onChange={(e: boolean) => {
            if (!e) handleInputChange('daysCollected', '');
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
              handleInputChange('daysCollected', e);
            }}
            maxLength={3}
            isRequired={showCollectionDays}
          />
        </Grid>
      )}
    </>
  );
}
