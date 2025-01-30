/**
 * @summary This is the Field list Tab
 */
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Dropdown, InputField, Button } from '../../../components/common';
import Modal from '@/components/common/Modal/Modal';
import {
  ListItemContainer,
  ButtonWrapper,
  Header,
  Column,
  ListItem,
  ContentWrapper,
} from './fieldList.styles';
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

const manureOptions = [
  { value: 0, label: 'Select' },
  { value: 1, label: 'No Manure in the last 2 years' },
  { value: 2, label: 'Manure applied in 1 of the 2 years' },
  { value: 3, label: 'Manure applied in each of the 2 years' },
];

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

  const filteredFields = fields.filter((field) => field.FieldName.trim() !== '');

  return (
    <div>
      <ContentWrapper>
        {filteredFields.length > 0 && (
          <Header>
            <Column>Field Name</Column>
            <Column>Area</Column>
            <Column>Comments</Column>
            <Column align="right">Actions</Column>
          </Header>
        )}
        {filteredFields.map((field, index) => (
          <ListItemContainer key={field.FieldName}>
            <ListItem>{field.FieldName}</ListItem>
            <ListItem>{field.Area}</ListItem>
            <ListItem>{field.Comment}</ListItem>
            <ListItem align="right">
              <button
                type="button"
                onClick={() => handleEdit(index)}
              >
                <FontAwesomeIcon icon={faEdit} />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(index)}
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </ListItem>
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
      </ContentWrapper>
      <Modal
        isVisible={isModalVisible}
        title={editIndex !== null ? 'Edit Field' : 'Add Field'}
        onClose={() => setIsModalVisible(false)}
        footer={
          <>
            <ButtonWrapper>
              <Button
                text="Cancel"
                handleClick={() => setIsModalVisible(false)}
                aria-label="Cancel"
                variant="secondary"
                size="sm"
                disabled={false}
              />
            </ButtonWrapper>
            <ButtonWrapper>
              <Button
                text="Submit"
                handleClick={handleSubmit}
                aria-label="Submit"
                variant="primary"
                size="sm"
                disabled={false}
              />
            </ButtonWrapper>
          </>
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
