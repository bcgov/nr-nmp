/* eslint-disable react/jsx-props-no-spreading */
import React, { FormEvent, useContext, useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Button, Dropdown, InputField } from '@/components/common';
import { APICacheContext } from '@/context/APICacheContext';
import { ListItem } from '@/views/FieldAndSoil/FieldList/fieldList.styles';
import { AnimalData, DairyCattleData, perDayPerAnimalUnit } from '../types';
import { useEventfulCollapse } from '@/utils/useEventfulCollapse';
import MilkingFields from './MilkingFields';
import manureTypeOptions from '@/constants/ManureTypeOptions';
import { calculateAnnualLiquidManure, calculateAnnualSolidManure } from '../utils';
import {
  EditListItemBody,
  EditListItemHeader,
  FlexRowContainer,
  ListItemContainer,
} from '../addAnimals.styles';

const milkingCowId: string = '9';

interface DairyCattleSubtype {
  id: number;
  name: string;
  liquidpergalperanimalperday: number;
  solidperpoundperanimalperday: number;
  washwater: number;
  milkproduction: number;
}

interface DairyCattleBreed {
  id: number;
  breedname: string;
  breedmanurefactor: number;
}

interface DairyCattleProps {
  startData: Partial<DairyCattleData>;
  startExpanded?: boolean;
  saveData: (data: AnimalData, index: number) => void;
  onDelete: (index: number) => void;
  updateIsComplete: React.Dispatch<React.SetStateAction<(boolean | null)[]>>;
  updateIsExpanded: React.Dispatch<React.SetStateAction<(boolean | null)[]>>;
  myIndex: number;
}

const initData: (d: Partial<DairyCattleData>) => DairyCattleData = (data) => {
  if (data.id !== '2') {
    throw new Error('AddAnimals sent bad data to DairyCattle.');
  }
  // Assign default values to breed and grazing days
  return { id: '2', breed: '1', grazingDaysPerYear: 0, ...data };
};

const isDairyCattleDataComplete: (data: DairyCattleData) => boolean = (data) =>
  data.subtype !== undefined &&
  data.breed !== undefined &&
  data.animalsPerFarm !== undefined &&
  data.manureType !== undefined &&
  data.grazingDaysPerYear !== undefined;

export default function DairyCattle({
  startData,
  startExpanded = false,
  saveData,
  onDelete,
  updateIsComplete,
  updateIsExpanded,
  myIndex,
}: DairyCattleProps) {
  const [formData, setFormData] = useState<DairyCattleData>(initData(startData));
  const [lastSaved, setLastSaved] = useState<DairyCattleData>(formData);
  const apiCache = useContext(APICacheContext);
  const [subtypes, setSubtypes] = useState<DairyCattleSubtype[]>([]);
  const [subtypeOptions, setSubtypeOptions] = useState<{ value: number; label: string }[]>([]);
  const [breeds, setBreeds] = useState<DairyCattleBreed[]>([]);
  const [breedOptions, setBreedOptions] = useState<{ value: number; label: string }[]>([]);

  // Initial values for milking fields, if "Milking cow" is selected //
  const washWaterInit = useMemo(() => {
    if (subtypes.length === 0) return undefined;
    const milkingCow = subtypes.find((s) => s.id.toString() === milkingCowId);
    if (milkingCow === undefined) throw new Error('Milking cow is missing from list.');
    return milkingCow.washwater;
  }, [subtypes]);
  const milkProductionInit = useMemo(() => {
    if (subtypes.length === 0 || breeds.length === 0) return undefined;
    const milkingCow = subtypes.find((s) => s.id.toString() === milkingCowId);
    if (milkingCow === undefined) throw new Error('Milking cow is missing from list.');
    const breed = breeds.find((b) => b.id.toString() === formData.breed);
    if (breed === undefined) throw new Error('Chosen breed is missing from list.');
    return milkingCow.milkproduction * breed.breedmanurefactor;
  }, [subtypes, breeds, formData.breed]);

  // Props for the collapsed view //
  const selectedSubtypeName = useMemo(() => {
    if (!lastSaved.subtype || subtypes.length === 0) return '';
    const subtype = subtypes.find((s) => s.id.toString() === lastSaved.subtype);
    if (subtype === undefined) throw new Error('Chosen subtype is missing from list.');
    return subtype.name;
  }, [lastSaved.subtype, subtypes]);

  const annualManure = useMemo(() => {
    if (
      !lastSaved.subtype ||
      !lastSaved.animalsPerFarm ||
      !lastSaved.manureType ||
      lastSaved.grazingDaysPerYear === undefined ||
      subtypes.length === 0
    )
      return 0;
    const subtype = subtypes.find((s) => s.id.toString() === lastSaved.subtype);
    if (subtype === undefined) throw new Error('Chosen subtype is missing from list.');
    const breed = breeds.find((b) => b.id.toString() === lastSaved.breed);
    if (breed === undefined) throw new Error('Chosen breed is missing from list.');
    const nonGrazingDays = 365 - lastSaved.grazingDaysPerYear;

    let extraCoefficient;
    if (lastSaved.subtype === milkingCowId) {
      if (lastSaved.milkProduction === undefined) return 0;
      const expectedMilkProduction = subtype.milkproduction * breed.breedmanurefactor;
      // Due to potential floating point issues, round factor to 1 if numbers are close
      const milkProdPercent =
        Math.abs(expectedMilkProduction - lastSaved.milkProduction) < 1
          ? 1
          : lastSaved.milkProduction / expectedMilkProduction;
      extraCoefficient = breed.breedmanurefactor * milkProdPercent;
    } else {
      extraCoefficient = breed.breedmanurefactor;
    }

    if (lastSaved.manureType === 'liquid') {
      return calculateAnnualLiquidManure(
        subtype.liquidpergalperanimalperday,
        lastSaved.animalsPerFarm,
        nonGrazingDays,
        extraCoefficient,
      );
    }
    return calculateAnnualSolidManure(
      subtype.solidperpoundperanimalperday,
      lastSaved.animalsPerFarm,
      nonGrazingDays,
      extraCoefficient,
    );
  }, [lastSaved, subtypes, breeds]);

  useEffect(() => {
    apiCache.callEndpoint('api/animal_subtypes/2/').then((response) => {
      if (response.status === 200) {
        const { data } = response;
        // The data in the response has more properties, but we want to trim it down
        const subtypez: DairyCattleSubtype[] = (data as DairyCattleSubtype[]).map((row) => ({
          id: row.id,
          name: row.name,
          solidperpoundperanimalperday: row.solidperpoundperanimalperday,
          liquidpergalperanimalperday: row.liquidpergalperanimalperday,
          washwater: row.washwater,
          milkproduction: row.milkproduction,
        }));
        setSubtypes(subtypez);
        const subtypeOptionz: { value: number; label: string }[] = (
          data as { id: number; name: string }[]
        ).map((row) => ({ value: row.id, label: row.name }));
        setSubtypeOptions(subtypeOptionz);
      }
    });

    apiCache.callEndpoint('api/breeds/').then((response) => {
      if (response.status === 200) {
        const { data } = response;
        // The data in the response has more properties, but we want to trim it down
        const breedz: DairyCattleBreed[] = (data as DairyCattleBreed[]).map((row) => ({
          id: row.id,
          breedname: row.breedname,
          breedmanurefactor: row.breedmanurefactor,
        }));
        setBreeds(breedz);
        const breedOptionz = breedz.map((breed) => ({ value: breed.id, label: breed.breedname }));
        setBreedOptions(breedOptionz);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Props for expanded view //
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const { getToggleProps, getCollapseProps, isExpanded, setExpanded } = useEventfulCollapse({
    id: `dairy-${myIndex}`,
    defaultExpanded: startExpanded,
  });

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    saveData(formData, myIndex);
    setLastSaved(formData);
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
      next[myIndex] = isDairyCattleDataComplete(lastSaved);
      return next;
    });
  }, [lastSaved, updateIsComplete, myIndex]);

  return (
    <>
      {!isExpanded ? (
        <div key={`dairy-${myIndex}`}>
          <ListItemContainer>
            <ListItem>{selectedSubtypeName}</ListItem>
            <ListItem>{`${Math.round(annualManure)} ${formData.manureType === 'liquid' ? 'U.S. gallon' : 'ton'}${annualManure === 1 ? '' : 's'}`}</ListItem>
            <ListItem align="right">
              <button
                type="button"
                {...getToggleProps()}
              >
                <FontAwesomeIcon icon={faEdit} />
              </button>
              <button
                type="button"
                onClick={() => onDelete(myIndex)}
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </ListItem>
          </ListItemContainer>
          {formData.washWater && formData.washWaterUnit && (
            <ListItemContainer>
              <ListItem>Milking Centre Wash Water</ListItem>
              <ListItem>{`${formData.washWater * 365 * (formData.washWaterUnit === perDayPerAnimalUnit ? formData.animalsPerFarm || 0 : 1)} U.S. gallons`}</ListItem>
              <div />
            </ListItemContainer>
          )}
        </div>
      ) : (
        <EditListItemHeader>Edit Animal</EditListItemHeader>
      )}
      <EditListItemBody {...getCollapseProps()}>
        <form onSubmit={handleSave}>
          <FlexRowContainer>
            <Dropdown
              label="Sub Type"
              name="subtype"
              value={formData.subtype || ''}
              options={subtypeOptions}
              onChange={handleChange}
              required
            />
            <Dropdown
              label="Breed"
              name="breed"
              value={formData.breed || ''}
              options={breedOptions}
              onChange={handleChange}
              required
            />
            <InputField
              label="Average Animal Number on Farm"
              type="text"
              name="animalsPerFarm"
              value={formData.animalsPerFarm?.toString() || ''}
              onChange={handleChange}
              maxLength={7}
              required
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
            <Dropdown
              label="Manure Type"
              name="manureType"
              value={formData.manureType || ''}
              options={manureTypeOptions}
              onChange={handleChange}
              required
            />
            <InputField
              label="Grazing Days per Year"
              type="text"
              name="grazingDaysPerYear"
              value={formData.grazingDaysPerYear?.toString() || ''}
              onChange={handleChange}
              maxLength={3}
              required
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
            {formData.subtype === milkingCowId &&
              milkProductionInit !== undefined &&
              washWaterInit !== undefined && (
                <MilkingFields
                  milkProductionInit={milkProductionInit}
                  washWaterInit={washWaterInit}
                  animalsPerFarm={formData.animalsPerFarm || 0}
                  washWaterUnit={formData.washWaterUnit}
                  handleChange={handleChange}
                  setFormData={setFormData}
                />
              )}
          </FlexRowContainer>
          <Button
            text="Submit"
            aria-label="Submit"
            variant="primary"
            size="sm"
            disabled={false}
          />
        </form>
      </EditListItemBody>
    </>
  );
}
