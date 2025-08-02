/**
 * @summary This is the Add Animal list Tab
 */
import React, { useContext, useEffect, useState } from 'react';
import BeefCattle from './AnimalFormComponents/BeefCattle';
import DairyCattle from './AnimalFormComponents/DairyCattle';
import OtherAnimals from './AnimalFormComponents/OtherAnimals';
import Poultry from './AnimalFormComponents/Poultry';
import {
  AnimalData,
  ManureType,
  BEEF_COW_ID,
  DAIRY_COW_ID,
  POULTRY_ID,
  OTHER_ANIMAL_IDS,
  OtherAnimalData,
  OtherAnimalId,
  SelectOption,
  Animal,
} from '@/types';
import UnselectedAnimal from './AnimalFormComponents/UnselectedAnimal';
import Modal, { ModalProps } from '@/components/common/Modal/Modal';
import { INITIAL_BEEF_FORM_DATA, INITIAL_DAIRY_FORM_DATA } from '@/constants';
import { INITIAL_POULTRY_FORM_DATA } from '@/constants/Animals';
import { APICacheContext } from '@/context/APICacheContext';

type AddAnimalsModalProps = {
  initialModalData: AnimalData | undefined;
  rowEditIndex: number | undefined;
  setAnimalList: React.Dispatch<React.SetStateAction<AnimalData[]>>;
  onClose: () => void;
};

export default function AddAnimalsModal({
  initialModalData,
  rowEditIndex,
  setAnimalList,
  onClose,
  ...props
}: AddAnimalsModalProps & Omit<ModalProps, 'title' | 'children' | 'onOpenChange'>) {
  const [formData, setFormData] = useState<AnimalData | undefined>(initialModalData);
  const [animals, setAnimals] = useState<SelectOption<Animal>[]>([]);
  const apiCache = useContext(APICacheContext);

  const handleSubmit = (newFormData: AnimalData) => {
    if (rowEditIndex !== undefined) {
      // If editing, find and replace field instead of adding new field
      setAnimalList((prev) => {
        const newList = [...prev];
        newList[rowEditIndex] = { ...newFormData };
        return newList;
      });
    } else {
      setAnimalList((prev) => [...prev, { ...newFormData }]);
    }
    onClose();
  };

  const handleInputChanges = (changes: { [name: string]: string | number | undefined }) => {
    setFormData((prev: AnimalData | undefined) => {
      // Whenever the animal type changes, reset the form
      if (changes.animalId !== undefined) {
        if (changes.animalId === BEEF_COW_ID) {
          return { ...INITIAL_BEEF_FORM_DATA, ...changes, manureId: crypto.randomUUID() };
        }
        if (changes.animalId === DAIRY_COW_ID) {
          return { ...INITIAL_DAIRY_FORM_DATA, ...changes, manureId: crypto.randomUUID() };
        }
        if (changes.animalId === POULTRY_ID) {
          return { ...INITIAL_POULTRY_FORM_DATA, ...changes, manureId: crypto.randomUUID() };
        }

        if (!OTHER_ANIMAL_IDS.some((id) => id === changes.animalId)) {
          throw new Error(`Invalid animalId: ${changes.animalId}`);
        }
        return {
          manureType: ManureType.Solid,
          daysCollected: 0,
          ...changes,
          animalId: changes.animalId as OtherAnimalId,
          manureId: crypto.randomUUID(),
        };
      }

      if (prev === undefined) {
        throw new Error('AddAnimalsModal tried to change a property before animalId');
      }
      return { ...prev, ...changes };
    });
  };

  useEffect(() => {
    apiCache.callEndpoint('/api/animals/').then((response: { status?: any; data: any }) => {
      if (response.status === 200) {
        const { data } = response;
        const options: SelectOption<Animal>[] = (data as Animal[]).map((row) => ({
          id: String(row.id),
          label: row.name,
          value: row,
        }));
        // TODO: REMOVE ONCE WE HAVE SWINE
        // This is a lazy way to take it out of the list
        options.splice(options.length - 1, 1);
        setAnimals(options);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Modal
      title="Add animals"
      onOpenChange={onClose}
      {...props}
    >
      {formData === undefined && (
        <UnselectedAnimal
          animals={animals}
          handleInputChanges={handleInputChanges}
          onCancel={onClose}
        />
      )}
      {formData?.animalId === BEEF_COW_ID && (
        <BeefCattle
          animals={animals}
          formData={formData}
          handleInputChanges={handleInputChanges}
          handleSubmit={handleSubmit}
          onCancel={onClose}
        />
      )}
      {formData?.animalId === DAIRY_COW_ID && (
        <DairyCattle
          animals={animals}
          formData={formData}
          handleInputChanges={handleInputChanges}
          handleSubmit={handleSubmit}
          onCancel={onClose}
        />
      )}
      {formData?.animalId === POULTRY_ID && (
        <Poultry
          animals={animals}
          formData={formData}
          handleInputChanges={handleInputChanges}
          handleSubmit={handleSubmit}
          onCancel={onClose}
        />
      )}
      {formData !== undefined && OTHER_ANIMAL_IDS.some((id) => id === formData.animalId) && (
        <OtherAnimals
          animals={animals}
          formData={formData as OtherAnimalData}
          handleInputChanges={handleInputChanges}
          handleSubmit={handleSubmit}
          onCancel={onClose}
        />
      )}
    </Modal>
  );
}
