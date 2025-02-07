import React, { useContext, useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Button, Dropdown, InputField } from '@/components/common';
import { APICacheContext } from '@/context/APICacheContext';
import YesNoRadioButtons from '@/components/common/YesNoRadioButtons/YesNoRadioButtons';
import { ListItem, ListItemContainer } from '@/views/FieldAndSoil/FieldList/fieldList.styles';
import { AnimalData, BeefCattleData } from './types';

interface BeefCattleSubtype {
  id: number;
  name: string;
  solidperpoundperanimalperday: number;
}

const initData: (d: Partial<BeefCattleData>) => BeefCattleData = (data) => {
  if (data.id !== '1') {
    throw new Error('AddAnimals sent bad data to BeefCattle.');
  }
  return { id: '1', ...data };
};

interface BeefCattleProps {
  startData: Partial<BeefCattleData>;
  saveData: (data: AnimalData, index: number) => void;
  onDelete: (index: number) => void;
  myIndex: number;
}

export default function BeefCattle({ startData, saveData, onDelete, myIndex }: BeefCattleProps) {
  const [formData, setFormData] = useState<BeefCattleData>(initData(startData));
  const apiCache = useContext(APICacheContext);

  const [subtypes, setSubtypes] = useState<BeefCattleSubtype[]>([]);
  const [subtypeOptions, setSubtypeOptions] = useState<{ value: number; label: string }[]>([]);
  const selectedSubtypeName = useMemo(() => {
    if (!formData.subtype || subtypes.length === 0) return '';
    const subtype = subtypes.find((s) => s.id.toString() === formData.subtype);
    if (subtype === undefined) throw new Error('Chosen subtype is missing from list.');
    return subtype.name;
  }, [formData.subtype, subtypes]);

  const manureInTons = useMemo(() => {
    if (
      !formData.subtype ||
      !formData.animalsPerFarm ||
      !formData.daysCollected ||
      subtypes.length === 0
    )
      return 0;
    const subtype = subtypes.find((s) => s.id.toString() === formData.subtype);
    if (subtype === undefined) throw new Error('Chosen subtype is missing from list.');
    // 2000 is not the proper conversion for pounds to tons. But this was the number used in agri-nmp
    // TODO: Ask Josh about this
    return Math.round(
      (subtype.solidperpoundperanimalperday * formData.animalsPerFarm * formData.daysCollected) /
        2000,
    );
  }, [formData, subtypes]);

  const [showCollectionDays, setShowCollectionDays] = useState<boolean>(
    typeof formData.animalsPerFarm === 'number',
  );

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

  const handleSubtypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, subtype: value }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    saveData(formData, myIndex);
  };

  return (
    <>
      <ListItemContainer key={`beef-${myIndex}`}>
        <ListItem>{selectedSubtypeName}</ListItem>
        <ListItem>{`${manureInTons} ton${manureInTons === 1 ? '' : 's'}`}</ListItem>
        <ListItem align="right">
          <button
            type="button"
            onClick={() => {}}
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
      <div>
        <Dropdown
          label="Cattle Type"
          name="animalSubtype"
          value={formData.subtype || ''}
          options={subtypeOptions}
          onChange={handleSubtypeChange}
        />
        <InputField
          label="Average Animal Number on Farm"
          type="text"
          name="animalsPerFarm"
          value={formData.animalsPerFarm?.toString() || ''}
          onChange={handleInputChange}
        />
        <YesNoRadioButtons
          name="yes-no"
          text="Do you pile or collect manure from these animals?"
          handleYes={() => setShowCollectionDays(true)}
          handleNo={() => {
            setShowCollectionDays(false);
            setFormData((prev) => ({ ...prev, collectionDays: undefined }));
          }}
        />
        {showCollectionDays && (
          <InputField
            label="How long is the manure collected?"
            type="text"
            name="daysCollected"
            value={formData.daysCollected?.toString() || ''}
            onChange={handleInputChange}
          />
        )}
        <Button
          text="Submit"
          handleClick={handleSave}
          aria-label="Submit"
          variant="primary"
          size="sm"
          disabled={false}
        />
      </div>
    </>
  );
}
