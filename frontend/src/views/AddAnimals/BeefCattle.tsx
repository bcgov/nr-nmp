/* eslint-disable react/jsx-props-no-spreading */
import React, { FormEvent, useContext, useEffect, useState } from 'react';
import Grid from '@mui/material/Grid2';
import { Select, TextField, RadioGroup, Radio } from '@bcgov/design-system-react-components';
import { Button, Dropdown, InputField } from '@/components/common';
import { APICacheContext } from '@/context/APICacheContext';
import YesNoRadioButtons from '@/components/common/YesNoRadioButtons/YesNoRadioButtons';
import { AnimalData, BeefCattleData } from './types';
import { useEventfulCollapse } from '@/utils/useEventfulCollapse';
import { EditListItemBody, FlexRowContainer } from './addAnimals.styles';
import { calculateAnnualSolidManure } from './utils';

interface BeefCattleSubtype {
  id: number;
  name: string;
  solidperpoundperanimalperday: number;
}

interface BeefCattleProps {
  startData: Partial<BeefCattleData>;
  startExpanded?: boolean;
  saveData: (data: AnimalData, index: number) => void;
  updateIsComplete: React.Dispatch<React.SetStateAction<(boolean | null)[]>>;
  updateIsExpanded: React.Dispatch<React.SetStateAction<(boolean | null)[]>>;
  myIndex: number;
  date: string;
}

const initData: (d: Partial<BeefCattleData>) => BeefCattleData = (data) => {
  if (data.id !== '1') {
    throw new Error('AddAnimals sent bad data to BeefCattle.');
  }
  return { id: '1', ...data };
};

const isBeefCattleDataComplete: (data: BeefCattleData) => boolean = (data) =>
  data.subtype !== undefined && data.animalsPerFarm !== undefined;

export default function BeefCattle({
  startData,
  startExpanded = false,
  saveData,
  updateIsComplete,
  updateIsExpanded,
  myIndex,
}: BeefCattleProps) {
  const [formData, setFormData] = useState<BeefCattleData>(initData(startData));
  const [lastSaved, setLastSaved] = useState<BeefCattleData>(formData);
  const apiCache = useContext(APICacheContext);
  const [subtypes, setSubtypes] = useState<BeefCattleSubtype[]>([]);
  const [subtypeOptions, setSubtypeOptions] = useState<{ value: number; label: string }[]>([]);

  useEffect(() => {
    apiCache.callEndpoint('api/animal_subtypes/1/').then((response) => {
      if (response.status === 200) {
        const { data } = response;
        const s: BeefCattleSubtype[] = (
          data as { id: number; name: string; solidperpoundperanimalperday: number }[]
        ).map((row) => ({
          id: row.id,
          name: row.name,
          solidperpoundperanimalperday: row.solidperpoundperanimalperday,
        }));
        setSubtypes(s);
        const sOptions: { value: number; label: string }[] = (
          data as { id: number; name: string }[]
        ).map((row) => ({ value: row.id, label: row.name }));
        setSubtypeOptions(sOptions);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Props for expanded view //
  const [showCollectionDays, setShowCollectionDays] = useState<boolean>(
    typeof formData.animalsPerFarm === 'number',
  );

  const handleSubtypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, subtype: value }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const { getCollapseProps, isExpanded, setExpanded } = useEventfulCollapse({
    id: `beef-${myIndex}`,
    defaultExpanded: startExpanded,
  });

  const handleSave = (e: FormEvent) => {
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
          formData.daysCollected,
        ),
      },
    };
    saveData(withManureCalc, myIndex);
    setLastSaved(withManureCalc);
    setExpanded(false);
  };

  // When the form is saved or re-opened, update the validity and expanded trackers
  useEffect(() => {
    updateIsExpanded((prev) => {
      const next = [...prev];
      next[myIndex] = isExpanded;
      return next;
    });
  }, [isExpanded, updateIsExpanded, myIndex]);
  useEffect(() => {
    updateIsComplete((prev) => {
      const next = [...prev];
      next[myIndex] = isBeefCattleDataComplete(lastSaved);
      return next;
    });
  }, [lastSaved, updateIsComplete, myIndex]);

  return (
    <Grid
      container
      spacing={2}
    >
      <Grid size={6}>
        <Select
          isRequired
          label="Cattle Type"
          name="animalSubtype"
          value={formData.subtype || ''}
          options={subtypeOptions}
          onChange={handleSubtypeChange}
        />
      </Grid>
      <Grid size={12}>
        <TextField
          isRequired
          label="Average Animal Number on Farm"
          type="text"
          name="animalsPerFarm"
          value={formData.animalsPerFarm?.toString() || ''}
          onChange={handleInputChange}
          maxLength={7}
          onInput={(e) => {
            const elem = e.target as HTMLInputElement;
            const value = Number(elem.value);
            if (Number.isNaN(value) || !Number.isInteger(value) || value! < 0) {
              elem.setCustomValidity('Please enter a valid whole number.');
            } else {
              elem.setCustomValidity('');
            }
          }}
        />
      </Grid>
      <Grid size={12}>
        <YesNoRadioButtons
          orientation="horizontal"
          text="Do you pile or collect manure from these animals?"
          value={showCollectionDays}
          onChange={(val) => {
            setShowCollectionDays(val);
            if (!val) {
              setFormData((prev) => ({ ...prev, collectionDays: undefined }));
            }
          }}
        />
      </Grid>
      {showCollectionDays && (
        <Grid size={6}>
          <TextField
            isRequired
            label="How long is the manure collected?"
            type="text"
            name="daysCollected"
            value={formData.daysCollected?.toString() || ''}
            onChange={handleInputChange}
            maxLength={3}
            onInput={(e) => {
              const elem = e.target as HTMLInputElement;
              const value = Number(elem.value);
              if (Number.isNaN(value) || !Number.isInteger(value) || value < 0 || value > 365) {
                elem.setCustomValidity('Please enter a valid number of days. (0-365)');
              } else {
                elem.setCustomValidity('');
              }
            }}
          />
        </Grid>
      )}
    </Grid>
  );
}
