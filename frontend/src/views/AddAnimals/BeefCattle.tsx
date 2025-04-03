/* eslint-disable react/jsx-props-no-spreading */
import React, { FormEvent, useContext, useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Button, Dropdown, InputField } from '@/components/common';
import { APICacheContext } from '@/context/APICacheContext';
import YesNoRadioButtons from '@/components/common/YesNoRadioButtons/YesNoRadioButtons';
import { ListItem } from '@/views/FieldList/fieldList.styles';
import { AnimalData, BeefCattleData } from './types';
import { useEventfulCollapse } from '@/utils/useEventfulCollapse';
import {
  BeefCattleYesNoWrapper,
  EditListItemBody,
  EditListItemHeader,
  FlexRowContainer,
  ListItemContainer,
} from './addAnimals.styles';
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
  onDelete: (index: number) => void;
  updateIsComplete: React.Dispatch<React.SetStateAction<(boolean | null)[]>>;
  updateIsExpanded: React.Dispatch<React.SetStateAction<(boolean | null)[]>>;
  myIndex: number;
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
  onDelete,
  updateIsComplete,
  updateIsExpanded,
  myIndex,
}: BeefCattleProps) {
  const [formData, setFormData] = useState<BeefCattleData>(initData(startData));
  const [lastSaved, setLastSaved] = useState<BeefCattleData>(formData);
  const apiCache = useContext(APICacheContext);
  const [subtypes, setSubtypes] = useState<BeefCattleSubtype[]>([]);
  const [subtypeOptions, setSubtypeOptions] = useState<{ value: number; label: string }[]>([]);

  // Props for the collapsed view //
  const selectedSubtypeName = useMemo(() => {
    if (!lastSaved.subtype || subtypes.length === 0) return '';
    const subtype = subtypes.find((s) => s.id.toString() === lastSaved.subtype);
    if (subtype === undefined) throw new Error('Chosen subtype is missing from list.');
    return subtype.name;
  }, [lastSaved.subtype, subtypes]);

  const manureInTons = useMemo(() => {
    if (
      !lastSaved.subtype ||
      !lastSaved.animalsPerFarm ||
      !lastSaved.daysCollected ||
      subtypes.length === 0
    )
      return 0;
    const subtype = subtypes.find((s) => s.id.toString() === lastSaved.subtype);
    if (subtype === undefined) throw new Error('Chosen subtype is missing from list.');
    return calculateAnnualSolidManure(
      subtype.solidperpoundperanimalperday,
      lastSaved.animalsPerFarm,
      lastSaved.daysCollected,
    );
  }, [lastSaved, subtypes]);

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

  const { getToggleProps, getCollapseProps, isExpanded, setExpanded } = useEventfulCollapse({
    id: `beef-${myIndex}`,
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
      next[myIndex] = isBeefCattleDataComplete(lastSaved);
      return next;
    });
  }, [lastSaved, updateIsComplete, myIndex]);

  return (
    <>
      {!isExpanded ? (
        <ListItemContainer key={`beef-${myIndex}`}>
          <ListItem>{selectedSubtypeName}</ListItem>
          <ListItem>{`${Math.round(manureInTons)} ton${manureInTons === 1 ? '' : 's'}`}</ListItem>
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
      ) : (
        <EditListItemHeader>Edit Animal</EditListItemHeader>
      )}
      <EditListItemBody {...getCollapseProps()}>
        <form onSubmit={handleSave}>
          <FlexRowContainer>
            <Dropdown
              label="Cattle Type"
              name="animalSubtype"
              value={formData.subtype || ''}
              options={subtypeOptions}
              onChange={handleSubtypeChange}
              required
            />
            <InputField
              label="Average Animal Number on Farm"
              type="text"
              name="animalsPerFarm"
              value={formData.animalsPerFarm?.toString() || ''}
              onChange={handleInputChange}
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
            <BeefCattleYesNoWrapper>
              <YesNoRadioButtons
                name="yes-no"
                text="Do you pile or collect manure from these animals?"
                handleYes={() => setShowCollectionDays(true)}
                handleNo={() => {
                  setShowCollectionDays(false);
                  setFormData((prev) => ({ ...prev, collectionDays: undefined }));
                }}
                omitWrapper
              />
            </BeefCattleYesNoWrapper>
            {showCollectionDays && (
              <InputField
                label="How long is the manure collected?"
                type="text"
                name="daysCollected"
                value={formData.daysCollected?.toString() || ''}
                onChange={handleInputChange}
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
