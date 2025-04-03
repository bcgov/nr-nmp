/**
 * @summary This is the Field list Tab
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Dropdown, InputField, Button } from '../../components/common';
import Modal from '@/components/common/Modal/Modal';
import {
  ListItemContainer,
  ButtonWrapper,
  Header,
  Column,
  ListItem,
  ContentWrapper,
  ButtonContainer,
  ErrorText,
} from './fieldList.styles';
import NMPFileFieldData from '@/types/NMPFileFieldData';
import ViewCard from '@/components/common/ViewCard/ViewCard';
import { FARM_INFORMATION, SOIL_TESTS } from '@/constants/RouteConstants';
import { initFields, saveFieldsToFile } from '../../utils/utils';
import useAppService from '@/services/app/useAppService';

const initialFieldFormData = {
  FieldName: '',
  Area: '',
  PreviousYearManureApplicationFrequency: '0',
  Comment: '',
  SoilTest: {},
  Crops: [],
};

const manureOptions = [
  { value: 0, label: 'Select' },
  { value: 1, label: 'No Manure in the last 2 years' },
  { value: 2, label: 'Manure applied in 1 of the 2 years' },
  { value: 3, label: 'Manure applied in each of the 2 years' },
];

export default function FieldList() {
  const { state, setNMPFile, setProgressStep } = useAppService();
  const navigate = useNavigate();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [fieldFormData, setFieldFormData] = useState<NMPFileFieldData>(initialFieldFormData);
  const [fields, setFields] = useState<NMPFileFieldData[]>(initFields(state));
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!fieldFormData.FieldName.trim()) {
      newErrors.FieldName = 'Field Name is required';
    } else if (
      fields.some(
        (field, index) =>
          field.FieldName.trim().toLowerCase() === fieldFormData.FieldName.trim().toLowerCase() &&
          index !== editIndex,
      )
    ) {
      newErrors.FieldName = 'Field Name must be unique';
    }
    if (!fieldFormData.Area.trim() || Number.isNaN(Number(fieldFormData.Area))) {
      newErrors.Area = 'Area is required and must be a number';
    }
    if (fieldFormData.PreviousYearManureApplicationFrequency === '0') {
      newErrors.PreviousYearManureApplicationFrequency =
        'Please select a manure application frequency';
    }
    return newErrors;
  };

  const handleSubmit = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
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

  const handleNext = () => {
    saveFieldsToFile(fields, state.nmpFile, setNMPFile);
    navigate(SOIL_TESTS);
  };

  const handlePrevious = () => {
    navigate(FARM_INFORMATION);
  };

  useEffect(() => {
    setProgressStep(3);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredFields = fields.filter((field) => field.FieldName.trim() !== '');

  return (
    <ViewCard
      heading="Field List"
      handlePrevious={handlePrevious}
      handleNext={handleNext}
      nextDisabled={fields.length === 0}
    >
      <ButtonContainer hasFields={filteredFields.length > 0}>
        <Button
          text="Add Field"
          handleClick={() => setIsModalVisible(true)}
          aria-label="Add Field"
          variant="primary"
          size="sm"
          disabled={false}
        />
      </ButtonContainer>
      <ContentWrapper hasFields={filteredFields.length > 0}>
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
        {errors.FieldName && <ErrorText>{errors.FieldName}</ErrorText>}
        <InputField
          label="Field Name"
          type="text"
          name="FieldName"
          value={fieldFormData.FieldName}
          onChange={handleChange}
        />
        {errors.Area && <ErrorText>{errors.Area}</ErrorText>}
        <InputField
          label="Area"
          type="text"
          name="Area"
          value={fieldFormData.Area}
          onChange={handleChange}
        />
        {errors.PreviousYearManureApplicationFrequency && (
          <ErrorText>{errors.PreviousYearManureApplicationFrequency}</ErrorText>
        )}
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
    </ViewCard>
  );
}
