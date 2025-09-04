import { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import { WashWaterUnit } from '@/types';
import { NumberField, Select } from '@/components/common';
import { formGridBreakpoints } from '@/common.styles';
import { PER_DAY_PER_ANIMAL_UNIT, PER_DAY_UNIT } from '@/constants';

interface MilkingFieldsProps {
  milkProductionInit: number;
  washWaterInit: number;
  animalsPerFarm: number;
  washWaterUnit?: WashWaterUnit;
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
  const [milkProduction, setMilkProduction] = useState<number>(milkProductionInit);
  const [washWater, setWashWater] = useState<number>(washWaterInit);

  // When the breed changes, change the milk production value
  useEffect(() => {
    setMilkProduction(milkProductionInit);
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
      setWashWater(washWaterInit);
      handleInputChanges({ washWater: washWaterInit, washWaterUnit: newUnit });
    } else if (newUnit === PER_DAY_UNIT && washWaterUnit === PER_DAY_PER_ANIMAL_UNIT) {
      setWashWater(washWaterInit * animalsPerFarm);
      handleInputChanges({ washWater: washWaterInit * animalsPerFarm, washWaterUnit: newUnit });
    } else {
      handleInputChanges({ washWaterUnit: newUnit });
    }
  };

  return (
    <>
      <Grid size={formGridBreakpoints}>
        <NumberField
          isRequired
          label="Milk Production"
          value={milkProduction}
          onChange={(e) => {
            setMilkProduction(e);
            handleInputChanges({ milkProduction: e });
          }}
        />
      </Grid>
      <Grid size={formGridBreakpoints}>
        <NumberField
          isRequired
          label="Milking Centre Wash Water"
          value={washWater}
          onChange={(e) => {
            setWashWater(e);
            handleInputChanges({ washWater: e });
          }}
        />
      </Grid>
      <Grid size={formGridBreakpoints}>
        <Select
          label="(Units)"
          selectedKey={washWaterUnit || PER_DAY_PER_ANIMAL_UNIT}
          items={washWaterOptions}
          onSelectionChange={(e) => handleUnitChange(e as WashWaterUnit)}
          isRequired
          noSort
        />
      </Grid>
    </>
  );
}
