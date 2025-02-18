/**
 * @summary The nutrient analysis tab on the manure page for the application
 */

import { useContext, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { APICacheContext } from '@/context/APICacheContext';
import NMPFileImportedManureData from '@/types/NMPFileImportedManureData';
import { Dropdown, InputField, Button, Modal, RadioButton } from '../../../components/common';
import {
  ContentWrapper,
  Column,
  ListItemContainer,
  ListItem,
  ButtonContainer,
  Header,
  ButtonWrapper,
  ButtonWrapper,
} from './nutrientAnalsysis.styles';
import { ModalContent } from '@/components/common/Modal/modal.styles';
import { DropdownWrapper } from '@/components/common/Dropdown/dropdown.styles';
import { RadioButtonWrapper } from '@/components/common/RadioButton/radioButton.styles';

interface ManureListProps {
  manures: NMPFileImportedManureData[];
}

export default function NutrientAnalysis({ manures }: ManureListProps) {
  const apiCache = useContext(APICacheContext);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [nutrientAnalysisFormData, setNutrientAnalysisFormData] = useState<NutrientAnalysisForm[]>(
    [],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNutrientAnalysisFormData({ ...nutrientAnalysisFormData, [name]: value });
  };

  const handleEdit = (index: number) => {
    setNutrientAnalysisFormData(nutrientAnalysisFormData[index]); // Fix here
    setEditIndex(index);
    setIsModalVisible(true);
  };

  const handleDelete = (index: number) => {
    const updatedAnalysis = nutrientAnalysisFormData.filter((_, i) => i !== index);
    setNutrientAnalysisFormData(updatedAnalysis);
  };

  const handleSubmit = () => {
    setIsModalVisible(false);
  };

  return (
    <div>
      {/* table with source of Material, material type, moisture, N, P, K, edit and delete button */}
      <ContentWrapper hasAnalysis={nutrientAnalysisFormData.length > 0}>
        {nutrientAnalysisFormData.length > 0 && (
          <Header>
            <Column>Source of Material</Column>
            <Column>Material Type</Column>
            <Column>Moisture(%)</Column>
            <Column>N(%)</Column>
            <Column>NH4N(%)</Column>
            <Column>P(%)</Column>
            <Column>K(%)</Column>
            <Column align="right">Actions</Column>
          </Header>
        )}
        {nutrientAnalysisFormData.map((NAnalysis, index) => (
          <ListItemContainer key={NAnalysis.MaterialName}>
            <ListItem>{NAnalysis.MaterialType}</ListItem>
            <ListItem>{NAnalysis.Nutrients.Moisture}</ListItem>
            <ListItem>{NAnalysis.Nutrients.N}</ListItem>
            <ListItem>{NAnalysis.Nutrients.NH4N}</ListItem>
            <ListItem>{NAnalysis.Nutrients.P}</ListItem>
            <ListItem>{NAnalysis.Nutrients.K}</ListItem>
            <ListItem align="right">
              <button
                type="button"
                onClick={() => handleEdit()}
              >
                <FontAwesomeIcon icon={faEdit} />
              </button>
              <button
                type="button"
                onClick={() => handleDelete()}
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </ListItem>
          </ListItemContainer>
        ))}
      </ContentWrapper>
      <ButtonContainer>
        {/* button to add a nutrient analysis if there are manures to add it to */}
        <Button
          variant="default"
          size="sm"
          disabled={manures.length === 0}
          text="Add a Nutrient Analysis"
          handleClick={() => setIsModalVisible(true)}
        />
      </ButtonContainer>
      <Modal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        title="Add Nutrient Analysis"
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
        <div />
        <DropdownWrapper>
          {/* // modal has "Source of Material" dropdown which maps manures input */}
          {/* <Dropdown
            label="Source of Material"
            name="Source of Material"
            value={nutrientAnalysisFormData.MaterialType}
            options={[]}
            onChange={handleChange}
          /> */}
          {/* // material type dropdown is this a db to get? */}
          <Dropdown
            label="Material Type"
            name="MaterialType"
            value={nutrientAnalysisFormData.MaterialType}
            options={[]}
            onChange={handleChange}
          />
        </DropdownWrapper>
        <RadioButtonWrapper>
          {/* // radio button "Book Value" and "Lab Analysis" auto sleected based on material type */}
          <RadioButton
            label={''}
            name={''}
            value={''}
            checked={false}
            onChange={handleChange}
          />
        </RadioButtonWrapper>
        {/* 
          // Book value

          // Lab Analysis
          // material name Custom - material tye here
          // turns nutrient values into inputs

          // Moisture, N, NH4-N, P, K
          // N03-N for lab analysis
        */}
      </Modal>
    </div>
  );
}
