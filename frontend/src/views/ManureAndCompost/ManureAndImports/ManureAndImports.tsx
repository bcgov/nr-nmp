import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import NMPFileImportedManureData from '@/types/NMPFileImportedManureData';
import { Button, Modal, InputField, Dropdown } from '@/components/common';
import {
  ContentWrapper,
  ButtonContainer,
  ButtonWrapper,
  ErrorText,
  Header,
  Column,
  ListItem,
  ListItemContainer,
} from './manureAndImports.styles';

interface ManureAndImportsProps {
  manures: NMPFileImportedManureData[];
  setManures: (manures: NMPFileImportedManureData[]) => void;
}

const initialManureFormData: NMPFileImportedManureData = {
  MaterialName: '',
  ManureTypeName: '',
  AnnualAmount: 0,
  AnnualAmountUSGallonsVolume: 0,
  AnnualAmountCubicYardsVolume: 0,
  AnnualAmountCubicMetersVolume: 0,
  AnnualAmountTonsWeight: 0,
  AnnualAmountDisplayVolume: '',
  AnnualAmountDisplayWeight: '',
  Units: 0,
  Moisture: '50',
  StandardSolidMoisture: 0,
  IsMaterialStored: false,
  ManureId: '',
  ManagedManureName: '',
  ManureType: 0,
  AssignedToStoredSystem: false,
  AssignedWithNutrientAnalysis: false,
};

const manureTypeOptions = [
  { label: 'Liquid', value: 1 },
  { label: 'Solid', value: 2 },
];

const unitsSolidDropdownOptions = [
  { label: 'Tons', value: 1 },
  { label: 'Cubic Yards', value: 2 },
  { label: 'Cubic Meters', value: 3 },
  { label: 'Tonnes', value: 4 },
];

const UnitsLiquidDropdownOptions = [
  { label: 'US Gallons', value: 1 },
  { label: 'Imperial Gallons', value: 2 },
  { label: 'Cubic Meters', value: 3 },
];

export default function ManureAndImports({ manures, setManures }: ManureAndImportsProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [manureFormData, setManureFormData] =
    useState<NMPFileImportedManureData>(initialManureFormData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setManureFormData({ ...manureFormData, [name]: value });
  };

  const handleEdit = (index: number) => {
    setManureFormData(manures[index]);
    setEditIndex(index);
    setIsModalVisible(true);
  };

  const handleDelete = (index: number) => {
    const updatedManures = manures.filter((_, i) => i !== index);
    setManures(updatedManures);
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!manureFormData.MaterialName?.trim()) {
      newErrors.FieldName = 'Field Name is required';
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

    let annualAmountUSGallonsVolume = 0;
    if (manureFormData.Units === 1) {
      // US Gallons
      annualAmountUSGallonsVolume = (manureFormData.AnnualAmount ?? 0) * 1;
    } else if (manureFormData.Units === 2) {
      // Imperial Gallons
      annualAmountUSGallonsVolume = (manureFormData.AnnualAmount ?? 0) * 1.2;
    } else if (manureFormData.Units === 3) {
      // Cubic Meters
      annualAmountUSGallonsVolume = (manureFormData.AnnualAmount ?? 0) * 264.172;
    }

    const updatedManureFormData = {
      ...manureFormData,
      AnnualAmountUSGallonsVolume: annualAmountUSGallonsVolume,
      AnnualAmountDisplayVolume: annualAmountUSGallonsVolume.toString(),
    };

    if (editIndex !== null) {
      const updatedManures = manures.map((manure, index) =>
        index === editIndex ? updatedManureFormData : manure,
      );
      setManures(updatedManures);
      setEditIndex(null);
    } else {
      setManures([...manures, updatedManureFormData]);
    }
    setManureFormData(initialManureFormData);
    setIsModalVisible(false);
  };

  return (
    <div>
      <ButtonContainer hasManure={manures.length > 0}>
        <Button
          text="Add Imported Manure"
          handleClick={() => setIsModalVisible(true)}
          aria-label="Add Imported Manure"
          variant="primary"
          size="sm"
          disabled={false}
        />
      </ButtonContainer>
      <ContentWrapper hasManure={manures.length > 0}>
        {manures.length > 0 && (
          <Header>
            <Column>Material Type</Column>
            <Column>Annual Amount (Volume)</Column>
            <Column>Annual Amount (Weight)</Column>
            <Column>Stored</Column>
            <Column align="right">Actions</Column>
          </Header>
        )}
        {manures.map((manure, index) => (
          <ListItemContainer key={manure.MaterialName}>
            <ListItem>
              {manure.MaterialName} {manure.ManureTypeName}
            </ListItem>
            <ListItem>{manure.AnnualAmountDisplayVolume}</ListItem>
            <ListItem>{manure.AnnualAmountDisplayWeight}</ListItem>
            <ListItem>{manure.IsMaterialStored ? 'Yes' : 'No'}</ListItem>
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
          label="Material Name"
          type="text"
          name="MaterialName"
          value={manureFormData.MaterialName || ''}
          onChange={handleChange}
        />
        <Dropdown
          label="Manure Type"
          name="ManureTypeName"
          value={manureFormData.ManureTypeName || ''}
          options={manureTypeOptions}
          onChange={handleChange}
        />
        <InputField
          label="Amount per year"
          type="text"
          name="AnnualAmount"
          value={(manureFormData.AnnualAmount ?? 0).toString() || ''}
          onChange={handleChange}
        />
        <Dropdown
          label="(Units)"
          name="Units"
          value={manureFormData.Units || ''}
          options={
            manureFormData.ManureTypeName === '1'
              ? UnitsLiquidDropdownOptions
              : unitsSolidDropdownOptions
          }
          onChange={handleChange}
        />
        {manureFormData.ManureTypeName === '2' && (
          <InputField
            label="Moisture (%)"
            type="text"
            name="Moisture"
            value={manureFormData.Moisture || ''}
            onChange={handleChange}
          />
        )}
      </Modal>
    </div>
  );
}
