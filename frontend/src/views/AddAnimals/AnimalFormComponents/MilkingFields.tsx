import { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import { WashWaterUnit } from '@/types';
import { NumberField, Select } from '@/components/common';
import { formGridBreakpoints } from '@/common.styles';
import { PER_DAY_PER_ANIMAL_UNIT, PER_DAY_UNIT } from '@/constants';

interface MilkingFieldsProps {
  milkProductionInit: number;
  milkProductionDefault: number;
  washWaterInit: number;
  washWaterDefault: number;
  animalsPerFarm: number;
  washWaterUnit?: WashWaterUnit;
  handleInputChanges: (changes: { [name: string]: string | number | boolean | undefined }) => void;
}

const washWaterOptions: { id: string; label: string }[] = [
  { id: PER_DAY_PER_ANIMAL_UNIT, label: 'US gallons/day/animal' },
  { id: PER_DAY_UNIT, label: 'US gallons/day' },
];

export default function MilkingFields({
  milkProductionInit,
  milkProductionDefault,
  washWaterInit,
  washWaterDefault,
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
      milkProductionAdjusted: milkProductionDefault !== milkProductionInit,
      washWater: washWaterInit,
      // Per day per animal is the default
      washWaterUnit: washWaterUnit || PER_DAY_PER_ANIMAL_UNIT,
      washWaterAdjusted: washWaterDefault !== washWaterInit,
    });
    return () => {
      handleInputChanges({
        milkProduction: undefined,
        milkProductionAdjusted: undefined,
        washWater: undefined,
        washWaterUnit: undefined,
        washWaterAdjusted: undefined,
      });
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
            handleInputChanges({
              milkProduction: e,
              milkProductionAdjusted: milkProductionDefault !== e,
            });
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
            handleInputChanges({ washWater: e, washWaterAdjusted: washWaterDefault !== e });
          }}
        />
      </Grid>
      <Grid size={formGridBreakpoints}>
        <Select
          label="(Units)"
          value={washWaterUnit || PER_DAY_PER_ANIMAL_UNIT}
          items={washWaterOptions}
          onChange={(e) => handleUnitChange(e as WashWaterUnit)}
          isRequired
          noSort
        />
      </Grid>
    </>
  );
}
