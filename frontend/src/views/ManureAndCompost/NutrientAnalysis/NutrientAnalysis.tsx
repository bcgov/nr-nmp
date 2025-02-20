/**
 * @summary The nutrient analysis tab on the manure page for the application
 */

import React, { useContext, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { APICacheContext } from '@/context/APICacheContext';
import NMPFileImportedManureData from '@/types/NMPFileImportedManureData';
import { Button, Dropdown, InputField, Modal, RadioButton } from '../../../components/common';
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
import { ModalContent } from '@/components/common/Modal/modal.styles';
import { DropdownWrapper } from '@/components/common/Dropdown/dropdown.styles';
import { RadioButtonWrapper } from '@/components/common/RadioButton/radioButton.styles';

interface ManureListProps {
  manures: NMPFileImportedManureData[];
}

interface ManureType {
  id: number;
  name: string;
  manureClass: string;
  solidLiquid: string;
  moisture: number;
  nitrogen: number;
  ammonia: number;
  phosphorous: number;
  potassium: number;
  dryMatterId: number;
  nMineralizationId: number;
  sortNum: number;
  cubicYardConversion: number;
  nitrate: number;
  defaultSolidMoisture: number;
}

export default function NutrientAnalysis({ manures }: ManureListProps) {
  const apiCache = useContext(APICacheContext);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  // manure types data from db
  const [manureTypesData, setManureTypesData] = useState<ManureType[]>([]);
  // an array of objects to hold nutrient analysis form data
  // for each manuresource user can create nutrient analysis' objects
  const [nutrientAnalysisFormData, setNutrientAnalysisFormData] = useState<
    {
      ManureSource: string;
      MaterialType: string;
      BookLab: string;
      MaterialName: string;
      Nutrients: { Moisture: number; N: number; NH4N: number; P: number; K: number };
    }[]
  >([]);
  // for each manuresource user can create nutrient analysis' objects
  const [analysisForm, setAnalysisForm] = useState({
    ManureSource: '',
    MaterialType: '',
    BookLab: '',
    MaterialName: '',
    Nutrients: { Moisture: 0, N: 0, NH4N: 0, P: 0, K: 0 },
  });

  const mockImportedManures = [
    {
      Id: 1,
      Name: 'Manure A',
      ManureClass: 'Class 1',
      SolidLiquid: 'Solid',
      Moisture: '10',
      Nitrogen: 5,
      Ammonia: 1.2,
      Phosphorous: 2.3,
      Potassium: 3.4,
      DryMatterId: 100,
      NMineralizationId: 200,
      SortNum: 1,
      CubicYardConversion: 1.1,
      Nitrate: 0.5,
      StaticDataVersionId: 1,
      DefaultSolidMoisture: 8,
    },
    {
      Id: 2,
      Name: 'Manure B',
      ManureClass: 'Class 2',
      SolidLiquid: 'Liquid',
      Moisture: '15',
      Nitrogen: 4,
      Ammonia: 0.9,
      Phosphorous: 1.7,
      Potassium: 2.1,
      DryMatterId: 101,
      NMineralizationId: 201,
      SortNum: 2,
      CubicYardConversion: 1.2,
      Nitrate: 0.3,
      StaticDataVersionId: 2,
      DefaultSolidMoisture: 7,
    },
  ];

  const handleEdit = (index: number) => {
    setEditIndex(index);
    setAnalysisForm(nutrientAnalysisFormData[index]); // Pre-fill the form with the existing analysis data
    setIsModalVisible(true);
  };

  const handleDelete = (index: number) => {
    setNutrientAnalysisFormData((prevState) => prevState.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    // If editing, update the existing analysis; if adding, push the new data
    if (editIndex !== null) {
      const updatedFormData = [...nutrientAnalysisFormData];
      updatedFormData[editIndex] = analysisForm;
      setNutrientAnalysisFormData(updatedFormData);
    } else {
      setNutrientAnalysisFormData([...nutrientAnalysisFormData, analysisForm]);
    }
    setIsModalVisible(false);
    setEditIndex(null); // Reset editIndex after submitting
  };

  // const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  //   const { name, value } = e.target;
  //   setAnalysisForm({ ...analysisForm, [name]: value });
  //   console.log(manureTypesData);
  //   console.log(manures);
  //   console.log(analysisForm);
  // };

  const handleChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setAnalysisForm({ ...analysisForm, [name]: value });
    console.log(manureTypesData);
    console.log(manures);
    console.log(analysisForm);
  };

  // get manure types
  useEffect(() => {
    apiCache.callEndpoint('api/manures/').then((response: { status?: any; data: any }) => {
      if (response.status === 200) {
        const { data } = response;
        setManureTypesData(data);
      }
    });
  }, [apiCache]);

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
      {mockImportedManures.length > 0 && (
        <ButtonContainer>
          {/* button to add a nutrient analysis if there are manures to add it to */}
          {/* add a new nutrient analysis */}
          <Button
            variant="primary"
            size="sm"
            disabled={mockImportedManures.length === 0}
            text="Add Nutrient Analysis"
            handleClick={() => setIsModalVisible(true)}
          />
        </ButtonContainer>
      )}
      <Modal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        title={editIndex !== null ? 'Edit Field' : 'Add a Nutrient Analysis'}
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
        <ModalContent>
          {/* // modal has "Source of Material" dropdown which maps manures input using a mock value replace when manure tab is completed */}
          <Dropdown
            label="Source of Material"
            name="ManureSource"
            value={analysisForm.ManureSource}
            options={mockImportedManures.map((manure) => ({
              value: manure.Name,
              label: manure.Name,
            }))}
            onChange={handleChange}
          />
          {mockImportedManures.length > 0 && (
            <>
              <DropdownWrapper>
                <Dropdown
                  label="Material Type"
                  name="MaterialType"
                  value={analysisForm.MaterialType}
                  options={manureTypesData.map((manure) => ({
                    value: manure.name,
                    label: manure.name,
                  }))}
                  onChange={handleChange}
                />
              </DropdownWrapper>
              <RadioButtonWrapper>
                {/* // radio button "Book Value" and "Lab Analysis" */}
                <RadioButton
                  label="Book Value"
                  name="booklab"
                  value="book"
                  checked={analysisForm.BookLab === 'book'}
                  onChange={handleChange}
                />
                <RadioButton
                  label="Lab Analysis"
                  name="booklab"
                  value="lab"
                  checked={analysisForm.BookLab === 'lab'}
                  onChange={handleChange}
                />
              </RadioButtonWrapper>
              {/* // Lab Analysis
            // material name Custom - material type here as default?
            // turns nutrient values into inputs */}
              {analysisForm.BookLab === 'lab' && (
                <InputField
                  label="Material Name"
                  type="text"
                  name="materialName"
                  value={`Custom - ${analysisForm.MaterialName}`}
                  onChange={handleChange}
                />
              )}
              {/* 
            // Book value
            // Moisture, N, NH4-N, P, K
          */}
              {analysisForm.BookLab === 'book' && (
                <>
                  <div>
                    <span>Moisture (%)</span>
                    <div>{analysisForm.Nutrients.Moisture}</div>
                  </div>
                  <div>
                    <span>N (%)</span>
                    <div>{analysisForm.Nutrients.N}</div>
                  </div>
                  <div>
                    <span>NH4-N (ppm)</span>
                    <div>{analysisForm.Nutrients.NH4N}</div>
                  </div>
                  <div>
                    <span>P (%)</span>
                    <div>{analysisForm.Nutrients.P}</div>
                  </div>
                  <div>
                    <span>K (%)</span>
                    <div>{analysisForm.Nutrients.K}</div>
                  </div>
                </>
              )}
              {analysisForm.BookLab === 'lab' && (
                <>
                  <div>
                    <span>Moisture (%)</span>
                    <div>
                      <InputField
                        label="Moisture"
                        type="text"
                        name="moisture"
                        value={analysisForm.Nutrients.Moisture}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div>
                    <span>N (%)</span>
                    <div>{analysisForm.Nutrients.N}</div>
                  </div>
                  <div>
                    <span>NH4-N (ppm)</span>
                    <div>{analysisForm.Nutrients.NH4N}</div>
                  </div>
                  <div>
                    <span>P (%)</span>
                    <div>{analysisForm.Nutrients.P}</div>
                  </div>
                  <div>
                    <span>K (%)</span>
                    <div>{analysisForm.Nutrients.K}</div>
                  </div>
                </>
              )}
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
