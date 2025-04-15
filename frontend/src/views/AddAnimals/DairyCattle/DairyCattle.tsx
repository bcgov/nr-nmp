/* eslint-disable react/jsx-props-no-spreading */
import React, { useContext, useEffect, useMemo, useState } from 'react';
import Grid from '@mui/material/Grid2';
import { Dropdown, InputField } from '@/components/common';
import { APICacheContext } from '@/context/APICacheContext';
import { DairyCattleData, MILKING_COW_ID } from '../types';
import MilkingFields from './MilkingFields';
import manureTypeOptions from '@/constants/ManureTypeOptions';

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

type tempDairyData = DairyCattleData & { id?: string };

const initialDairyFormData: tempDairyData = {
  id: '2',
  subtype: '',
  breed: '1',
  manureType: undefined,
  grazingDaysPerYear: 0,
  animalsPerFarm: undefined,
  milkProduction: undefined,
  washWater: undefined,
  washWaterUnit: undefined,
  manureData: undefined,
  date: new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }),
};

export default function DairyCattle() {
  const apiCache = useContext(APICacheContext);
  const [formData, setFormData] = useState<DairyCattleData>(initialDairyFormData);
  const [subtypes, setSubtypes] = useState<DairyCattleSubtype[]>([]);
  const [subtypeOptions, setSubtypeOptions] = useState<{ value: number; label: string }[]>([]);
  const [breeds, setBreeds] = useState<DairyCattleBreed[]>([]);
  const [breedOptions, setBreedOptions] = useState<{ value: number; label: string }[]>([]);

  // Initial values for milking fields, if "Milking cow" is selected //
  const washWaterInit = useMemo(() => {
    if (subtypes.length === 0) return undefined;
    const milkingCow = subtypes.find((s) => s.id.toString() === MILKING_COW_ID);
    if (milkingCow === undefined) throw new Error('Milking cow is missing from list.');
    return milkingCow.washwater;
  }, [subtypes]);
  const milkProductionInit = useMemo(() => {
    if (subtypes.length === 0 || breeds.length === 0) return undefined;
    const milkingCow = subtypes.find((s) => s.id.toString() === MILKING_COW_ID);
    if (milkingCow === undefined) throw new Error('Milking cow is missing from list.');
    const breed = breeds.find((b) => b.id.toString() === formData.breed);
    if (breed === undefined) throw new Error('Chosen breed is missing from list.');
    return milkingCow.milkproduction * breed.breedmanurefactor;
  }, [subtypes, breeds, formData.breed]);

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
    setFormData((prev: DairyCattleData) => ({ ...prev, [name]: value }));
  };

  return (
    <>
      {!isExpanded ? (
        <div key={`dairy-${myIndex}`}>
          <ListItemContainer>
            <ListItem>{lastSaved.manureData?.name || ''}</ListItem>
            <ListItem>{manureDisplay}</ListItem>
            <ListItem align="right">
              <div
                className="list-item"
                style={{ position: 'relative' }}
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <FontAwesomeIcon
                  icon={faEllipsisH}
                  style={{ cursor: 'pointer' }}
                />
                {isDropdownOpen && (
                  <DropdownMenu className="dropdown-menu">
                    <DropdownButton
                      type="button"
                      {...getToggleProps()}
                    >
                      <FontAwesomeIcon icon={faEdit} /> Edit
                    </DropdownButton>
                    <DropdownButton
                      type="button"
                      onClick={() => onDelete(myIndex)}
                    >
                      <FontAwesomeIcon icon={faTrash} /> Delete
                    </DropdownButton>
                  </DropdownMenu>
                )}
              </div>
            </ListItem>
          </ListItemContainer>
          {formData.washWater && formData.washWaterUnit && (
            <ListItemContainer>
              <ListItem>Milking Centre Wash Water</ListItem>
              <ListItem>{`${calculateAnnualWashWater(formData.washWater, formData.washWaterUnit, formData.animalsPerFarm || 0)} U.S. gallons`}</ListItem>
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
            {formData.subtype === MILKING_COW_ID &&
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
