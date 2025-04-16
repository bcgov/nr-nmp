/* eslint-disable react/jsx-props-no-spreading */
import React, { useContext, useEffect, useState } from 'react';
import Grid from '@mui/material/Grid2';
import { APICacheContext } from '@/context/APICacheContext';
import YesNoRadioButtons from '@/components/common/YesNoRadioButtons/YesNoRadioButtons';
import { BeefCattleData } from './types';
import { Dropdown, InputField } from '@/components/common';

interface BeefCattleSubtype {
  id: number;
  name: string;
  solidperpoundperanimalperday: number;
}

type tempBeefData = BeefCattleData & { id?: string };

const initialBeefFormData: tempBeefData = {
  animalId: '1',
  subtype: '',
  animalsPerFarm: undefined,
  daysCollected: undefined,
  manureData: undefined,
  date: new Date().toISOString(),
};

export default function BeefCattle() {
  const apiCache = useContext(APICacheContext);
  const [formData, setFormData] = useState<BeefCattleData>(initialBeefFormData);
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

  // save to form data on change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: BeefCattleData) => ({ ...prev, [name]: value }));
  };

  return (
    <>
      {!isExpanded ? (
        <ListItemContainer key={`beef-${myIndex}`}>
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
