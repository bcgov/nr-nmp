/**
 * @summary This is the Field list Tab
 */
import React, { useState } from 'react';
import { Dropdown, InputField, Button } from '../../../components/common';
import Modal from '@/components/common/Modal/Modal';
import { ListItemContainer, ButtonWrapper } from './fieldList.styles';
import NMPFileFieldData from '@/types/NMPFileFieldData';

interface FieldListProps {
  fields: NMPFileFieldData[];
  setFields: (fields: NMPFileFieldData[]) => void;
}

const initialFieldFormData = {
  FieldName: '',
  Area: '',
  PreviousYearManureApplicationFrequency: '0',
  Comment: '',
  SoilTest: {},
  Crops: [{}],
};

export default function FieldList({ fields, setFields }: FieldListProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [fieldFormData, setFieldFormData] = useState<NMPFileFieldData>(initialFieldFormData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFieldFormData({ ...fieldFormData, [name]: value });
  };

  const handleEdit = (index: number) => {
    setFieldFormData(fields[index]);
    setEditIndex(index);
    setIsModalVisible(true);
  };

  const handleDelete = (index: number) => {
    const updatedFields = fields.filter((_, i) => i !== index);
    setFields(updatedFields);
  };

  const handleSubmit = () => {
    if (editIndex !== null) {
      const updatedFields = fields.map((field, index) =>
        index === editIndex ? fieldFormData : field,
      );
      setFields(updatedFields);
      setEditIndex(null);
    } else {
      setFields([...fields, fieldFormData]);
    }
    setFieldFormData(initialFieldFormData);
    setIsModalVisible(false);
  };

  const manureOptions = [
    { value: 0, label: 'Select' },
    { value: 1, label: 'No Manure in the last 2 years' },
    { value: 2, label: 'Manure applied in 1 of the 2 years' },
    { value: 3, label: 'Manure applied in each of the 2 years' },
  ];

  return (
    <div>
      {fields
        .filter((field) => field.FieldName.trim() !== '')
        .map((field, index) => (
          <ListItemContainer key={field.FieldName}>
            <p>Field Name: {field.FieldName}</p>
            <p>Area: {field.Area}</p>
            <p>Comment: {field.Comment}</p>
            <button
              type="button"
              onClick={() => handleEdit(index)}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => handleDelete(index)}
            >
              Delete
            </button>
          </ListItemContainer>
        ))}
      <ButtonWrapper>
        <Button
          text="Add Field"
          handleClick={() => setIsModalVisible(true)}
          aria-label="Add Field"
          variant="primary"
          size="sm"
          disabled={false}
        />
      </ButtonWrapper>
      <Modal
        isVisible={isModalVisible}
        title={editIndex !== null ? 'Edit Field' : 'Add Field'}
        onClose={() => setIsModalVisible(false)}
        footer={
          <button
            type="button"
            onClick={handleSubmit}
          >
            Submit
          </button>
        }
      >
        <InputField
          label="Field Name"
          type="text"
          name="FieldName"
          value={fieldFormData.FieldName}
          onChange={handleChange}
        />
        <InputField
          label="Area"
          type="text"
          name="Area"
          value={fieldFormData.Area}
          onChange={handleChange}
        />
        <Dropdown
          label="Manure application in previous years"
          name="PreviousYearManureApplicationFrequency"
          value={fieldFormData.PreviousYearManureApplicationFrequency}
          options={manureOptions}
          onChange={handleChange}
        />
        <InputField
          label="Comments (optional)"
          type="text"
          name="Comment"
          value={fieldFormData.Comment}
          onChange={handleChange}
        />
      </Modal>
    </div>
  );
}
