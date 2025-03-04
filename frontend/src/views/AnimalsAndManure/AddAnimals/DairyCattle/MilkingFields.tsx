import React, { useEffect, useState } from 'react';
import { Dropdown, InputField } from '@/components/common';
import { DairyCattleData, perDayUnit, perDayPerAnimalUnit } from '../types';

interface MilkingFieldsProps {
  milkProductionInit: number;
  washWaterInit: number;
  animalsPerFarm: number;
  washWaterUnit: 'PER_DAY_PER_ANIMAL' | 'PER_DAY' | undefined;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  setFormData: (value: React.SetStateAction<DairyCattleData>) => void;
}

const washWaterOptions: { value: string; label: string }[] = [
  { value: perDayPerAnimalUnit, label: 'US gallons/day/animal' },
  { value: perDayUnit, label: 'US gallons/day' },
];

export default function MilkingFields({
  milkProductionInit,
  washWaterInit,
  animalsPerFarm,
  washWaterUnit,
  handleChange,
  setFormData,
}: MilkingFieldsProps) {
  // I'm starting to think keeping stateful props is dumb and I should just keep the useEffects
  // to get the same on-mount-and-unmount behavior, but I just wanna get this PR in atm
  const [milkProduction, setMilkProduction] = useState<string>(String(milkProductionInit));
  const [washWater, setWashWater] = useState<string>(`${washWaterInit}.0`);

  // When the breed changes, change the milk production value
  useEffect(() => {
    setMilkProduction(String(milkProductionInit));
    setFormData((prev) => ({ ...prev, milkProduction: milkProductionInit }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [milkProductionInit]);

  // On mount, set milking fields to init values
  // On unmount, clear milking fields
  useEffect(() => {
    // Default to the first unit if one isn't chosen
    setFormData((prev) => ({
      washWaterUnit: perDayPerAnimalUnit,
      ...prev,
      milkProduction: milkProductionInit,
      washWater: washWaterInit,
    }));
    return () => {
      setFormData((prev) => ({ ...prev, milkProduction: undefined, washWater: undefined }));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    if (value === perDayPerAnimalUnit && washWaterUnit === perDayUnit) {
      setWashWater(`${washWaterInit}.0`);
      setFormData((prev) => ({ ...prev, washWater: washWaterInit, washWaterUnit: value }));
    } else if (value === perDayUnit && washWaterUnit === perDayPerAnimalUnit) {
      setWashWater(String(washWaterInit * animalsPerFarm));
      setFormData((prev) => ({
        ...prev,
        washWater: washWaterInit * animalsPerFarm,
        washWaterUnit: value,
      }));
    } else {
      handleChange(e);
    }
  };

  return (
    <>
      <InputField
        label="Milk Production"
        type="text"
        name="milkProduction"
        value={milkProduction}
        onChange={(e) => {
          setMilkProduction(e.target.value);
          handleChange(e);
        }}
        required
        onInput={(e) => {
          const elem = e.target as HTMLInputElement;
          const value = Number(elem.value);
          if (Number.isNaN(value) || value! < 0) {
            elem.setCustomValidity('Please enter a valid amount.');
          } else {
            elem.setCustomValidity('');
          }
        }}
      />
      <InputField
        label="Milking Centre Wash Water"
        type="text"
        name="washWater"
        value={washWater}
        onChange={(e) => {
          setWashWater(e.target.value);
          handleChange(e);
        }}
        required
        onInput={(e) => {
          const elem = e.target as HTMLInputElement;
          const value = Number(elem.value);
          if (Number.isNaN(value) || value! < 0) {
            elem.setCustomValidity('Please enter a valid amount.');
          } else {
            elem.setCustomValidity('');
          }
        }}
      />
      <Dropdown
        label="(Units)"
        name="washWaterUnit"
        value={washWaterUnit || perDayPerAnimalUnit}
        options={washWaterOptions}
        onChange={handleUnitChange}
        required
      />
    </>
  );
}
