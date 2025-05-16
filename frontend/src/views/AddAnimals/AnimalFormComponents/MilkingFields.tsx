import { useEffect, useState } from 'react';
import { Select, TextField } from '@bcgov/design-system-react-components';
import Grid from '@mui/material/Grid';
import { PER_DAY_UNIT, PER_DAY_PER_ANIMAL_UNIT, WashWaterUnit } from '../types';
import { formGridBreakpoints } from '@/common.styles';

interface MilkingFieldsProps {
  milkProductionInit: number;
  washWaterInit: number;
  animalsPerFarm: number;
  washWaterUnit: WashWaterUnit | undefined;
  handleInputChanges: (changes: { [name: string]: string | number | undefined }) => void;
}

const washWaterOptions: { id: string; label: string }[] = [
  { id: PER_DAY_PER_ANIMAL_UNIT, label: 'US gallons/day/animal' },
  { id: PER_DAY_UNIT, label: 'US gallons/day' },
];

export default function MilkingFields({
  milkProductionInit,
  washWaterInit,
  animalsPerFarm,
  washWaterUnit,
  handleInputChanges,
}: MilkingFieldsProps) {
  // I'm starting to think keeping stateful props is dumb and I should just keep the useEffects
  // to get the same on-mount-and-unmount behavior, but I just wanna get this PR in atm
  const [milkProduction, setMilkProduction] = useState<string>(String(milkProductionInit));
  const [washWater, setWashWater] = useState<string>(`${washWaterInit}.0`);

  // When the breed changes, change the milk production value
  useEffect(() => {
    setMilkProduction(String(milkProductionInit));
    handleInputChanges({ milkProduction: milkProductionInit });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [milkProductionInit]);

  // On mount, set milking fields to init values
  // On unmount, clear milking fields
  useEffect(() => {
    handleInputChanges({
      milkProduction: milkProductionInit,
      washWater: washWaterInit,
      // Per day per animal is the default
      washWaterUnit: washWaterUnit || PER_DAY_PER_ANIMAL_UNIT,
    });
    return () => {
      handleInputChanges({ milkProduction: undefined, washWater: undefined });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUnitChange = (newUnit: WashWaterUnit) => {
    if (newUnit === PER_DAY_PER_ANIMAL_UNIT && washWaterUnit === PER_DAY_UNIT) {
      setWashWater(`${washWaterInit}.0`);
      handleInputChanges({ washWater: washWaterInit, washWaterUnit: newUnit });
    } else if (newUnit === PER_DAY_UNIT && washWaterUnit === PER_DAY_PER_ANIMAL_UNIT) {
      setWashWater(String(washWaterInit * animalsPerFarm));
      handleInputChanges({ washWater: washWaterInit * animalsPerFarm, washWaterUnit: newUnit });
    } else {
      handleInputChanges({ washWaterUnit: newUnit });
    }
  };

  return (
    <>
      <Grid size={formGridBreakpoints}>
        <TextField
          label="Milk Production"
          type="number"
          name="milkProduction"
          value={milkProduction}
          onChange={(e) => {
            setMilkProduction(e);
            handleInputChanges({ milkProduction: e });
          }}
          isRequired
        />
      </Grid>
      <Grid size={formGridBreakpoints}>
        <TextField
          label="Milking Centre Wash Water"
          type="number"
          name="washWater"
          value={washWater}
          onChange={(e) => {
            setWashWater(e);
            handleInputChanges({ washWater: e });
          }}
          isRequired
        />
      </Grid>
      <Grid size={formGridBreakpoints}>
        <Select
          label="(Units)"
          name="washWaterUnit"
          selectedKey={washWaterUnit || PER_DAY_PER_ANIMAL_UNIT}
          items={washWaterOptions}
          onSelectionChange={(e) => {
            handleUnitChange(e as WashWaterUnit);
          }}
          isRequired
        />
      </Grid>
    </>
  );
}
