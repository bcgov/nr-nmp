/**
 * @summary This is the Add Animal list Tab
 */
import React, { useState } from 'react';
import BeefCattle from './AnimalFormComponents/BeefCattle';
import DairyCattle from './AnimalFormComponents/DairyCattle';
import Poultry from './AnimalFormComponents/Poultry';
import { AnimalData, BEEF_COW_ID, DAIRY_COW_ID, POULTRY_ID } from '@/types';
import UnselectedAnimal from './AnimalFormComponents/UnselectedAnimal';
import Modal, { ModalProps } from '@/components/common/Modal/Modal';
import { INITIAL_BEEF_FORM_DATA, INITIAL_DAIRY_FORM_DATA } from '@/constants';
import { INITIAL_POULTRY_FORM_DATA } from '@/constants/Animals';

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
      }

      if (prev === undefined) {
        throw new Error('AddAnimalsModal tried to change a property before animalId');
      }
      return { ...prev, ...changes };
    });
  };

  return (
    <Modal
      title="Add animals"
      onOpenChange={onClose}
      {...props}
    >
      {formData === undefined && (
        <UnselectedAnimal
          handleInputChanges={handleInputChanges}
          onCancel={onClose}
        />
      )}
      {formData?.animalId === BEEF_COW_ID && (
        <BeefCattle
          formData={formData}
          handleInputChanges={handleInputChanges}
          handleSubmit={handleSubmit}
          onCancel={onClose}
        />
      )}
      {formData?.animalId === DAIRY_COW_ID && (
        <DairyCattle
          formData={formData}
          handleInputChanges={handleInputChanges}
          handleSubmit={handleSubmit}
          onCancel={onClose}
        />
      )}
      {formData?.animalId === POULTRY_ID && (
        <Poultry
          formData={formData}
          handleInputChanges={handleInputChanges}
          handleSubmit={handleSubmit}
          onCancel={onClose}
        />
      )}
    </Modal>
  );
}
