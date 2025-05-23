/**
 * @summary The nutrient analysis tab on the manure page for the application
 */

import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { APICacheContext } from '@/context/APICacheContext';
import { Button, Dropdown, InputField, Modal, RadioButton } from '../../components/common';
import {
  ContentWrapper,
  Column,
  ListItemContainer,
  ListItem,
  Header,
  NutrientContent,
  NutrientInputField,
  NutrientRadioWrapper,
  NutrientContainer,
  CenterButtonWrapper,
} from './nutrientAnalsysis.styles';
import { DropdownWrapper } from '@/components/common/Dropdown/dropdown.styles';
import { ColumnContainer, HeaderText, RowContainer, ValueText } from '@/views/Crops/crops.styles';
import { NMPFile, NMPFileImportedManureData } from '@/types';
import useAppService from '@/services/app/useAppService';
import ViewCard from '@/components/common/ViewCard/ViewCard';
import { CALCULATE_NUTRIENTS, MANURE_IMPORTS } from '@/constants/RouteConstants';
import { saveFarmManuresToFile } from '@/utils/utils';
import { NMPFileFarmManureData } from '@/types/NMPFileFarmManureData';
import NMPFileGeneratedManureData from '@/types/NMPFileGeneratedManureData';
import { defaultNMPFile, defaultNMPFileYear } from '@/constants';
import ManureType from '@/types/ManureType';
import Form from '@/components/common/Form/Form';

export default function NutrientAnalysis() {
  const { state, setNMPFile } = useAppService();
  const parsedFile: NMPFile = useMemo(() => {
    if (state.nmpFile) {
      return JSON.parse(state.nmpFile);
    }
    // TODO: Once we cache state, throw error if uninitialized
    return { ...defaultNMPFile, years: [{ ...defaultNMPFileYear }] };
  }, [state.nmpFile]);
  const manures: (NMPFileImportedManureData | NMPFileGeneratedManureData)[] = useMemo(
    () =>
      (parsedFile.years[0]?.ImportedManures || []).concat(
        parsedFile.years[0]?.GeneratedManures || [],
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const navigate = useNavigate();
  const apiCache = useContext(APICacheContext);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  // manure types data from db
  const [manureTypesData, setManureTypesData] = useState<ManureType[]>([]);
  // for each manuresource user can create nutrient analysis' objects
  // replace with nmpfile
  const [nutrientAnalysisData, setNutrientAnalysisData] = useState<NMPFileFarmManureData[]>([]);
  // for each manuresource user can create nutrient analysis' objects
  const [analysisForm, setAnalysisForm] = useState<NMPFileFarmManureData>({
    ManureSource: '',
    MaterialType: '',
    BookLab: '',
    UniqueMaterialName: '',
    Nutrients: { Moisture: '', N: 0, NH4N: 0, P: 0, K: 0 },
  });

  const handleEdit = (index: number) => {
    setEditIndex(index);
    setAnalysisForm(nutrientAnalysisData[index]); // Pre-fill the form with the existing analysis data
    setIsModalVisible(true);
  };

  const handleDelete = (index: number) => {
    setNutrientAnalysisData((prevState) => prevState.filter((_, i) => i !== index));
  };

  // submits to nutrient analysis form data and clears modal analysis form
  const handleSubmit = () => {
    setNutrientAnalysisData((prevState) => {
      // if editing an entry then updates that entry
      if (editIndex !== null) {
        return prevState.map((item, index) => (index === editIndex ? { ...analysisForm } : item));
      }
      // else add this new entry
      return [...prevState, { ...analysisForm }];
    });
    setIsModalVisible(false);
    // reset analysis form
    setAnalysisForm({
      ManureSource: '',
      MaterialType: '',
      BookLab: '',
      UniqueMaterialName: '',
      Nutrients: { Moisture: '', N: 0, NH4N: 0, P: 0, K: 0 },
    });
    // resets index
    setEditIndex(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setAnalysisForm((prevForm) => {
      // update nutrients and material type when type is changed
      if (name === 'MaterialType') {
        const updatedUniqueMaterialName =
          prevForm.UniqueMaterialName === '' ||
          prevForm.UniqueMaterialName !== `Custom - ${prevForm.MaterialType}`
            ? `Custom - ${value}`
            : prevForm.UniqueMaterialName;
        const selectedManure = manureTypesData.find((manure) => manure.name === value);
        if (!selectedManure) {
          throw new Error(`Manure type "${value}" not found.`);
        }

        return {
          ...prevForm,
          MaterialType: value,
          UniqueMaterialName: updatedUniqueMaterialName,
          Nutrients: {
            Moisture: String(selectedManure.moisture),
            N: selectedManure.nitrogen,
            NH4N: selectedManure.ammonia,
            P: selectedManure.phosphorous,
            K: selectedManure.potassium,
          },
        };
      }

      // reset nutrient values when book value is selected
      if (name === 'BookLab' && prevForm.BookLab !== value) {
        const selectedManure = manureTypesData.find(
          (manure) => manure.name === prevForm.MaterialType,
        );
        if (!selectedManure) {
          throw new Error(`Manure type "${value}" not found.`);
        }
        return {
          ...prevForm,
          BookLab: value,
          Nutrients: {
            Moisture: String(selectedManure.moisture),
            N: selectedManure.nitrogen,
            NH4N: selectedManure.ammonia,
            P: selectedManure.phosphorous,
            K: selectedManure.potassium,
          },
        };
      }

      // update nutrients if changed
      if (name in prevForm.Nutrients) {
        return {
          ...prevForm,
          Nutrients: {
            ...prevForm.Nutrients,
            [name]: value === '' ? '' : Number(value),
          },
        };
      }

      return {
        ...prevForm,
        [name]: value,
      };
    });
  };

  const handlePrevious = () => {
    navigate(MANURE_IMPORTS);
  };

  const handleNext = () => {
    saveFarmManuresToFile(nutrientAnalysisData, state.nmpFile, setNMPFile);
    navigate(CALCULATE_NUTRIENTS);
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
    <ViewCard
      heading="Nutrient Analysis"
      height="700px"
      width="700px"
      handlePrevious={handlePrevious}
      handleNext={handleNext}
    >
      {/* table with source of Material, material type, moisture, N, P, K, edit and delete button */}
      <ContentWrapper hasAnalysis={nutrientAnalysisData.length > 0}>
        {nutrientAnalysisData.length > 0 && (
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
        {nutrientAnalysisData.map((NAnalysis, index) => (
          <ListItemContainer key={NAnalysis.UniqueMaterialName}>
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
      <CenterButtonWrapper>
        {/* button to add a nutrient analysis if there are manures to add it to */}
        <Button
          variant="primary"
          size="sm"
          disabled={manures.length === 0}
          text="Add Nutrient Analysis"
          handleClick={() => setIsModalVisible(true)}
        />
      </CenterButtonWrapper>
      <Modal
        isOpen={isModalVisible}
        onOpenChange={(isOpen) => setIsModalVisible(isOpen)}
        title={editIndex !== null ? 'Edit Field' : 'Add a Nutrient Analysis'}
      >
        <Form
          onCancel={() => {
            setIsModalVisible(false);
            setAnalysisForm({
              ManureSource: '',
              MaterialType: '',
              BookLab: '',
              UniqueMaterialName: '',
              Nutrients: { Moisture: '', N: 0, NH4N: 0, P: 0, K: 0 },
            });
          }}
          onConfirm={handleSubmit}
        >
          {/* // modal has "Source of Material" dropdown which maps users manures input from ManureAndCompost page */}
          <Dropdown
            label="Source of Material"
            name="ManureSource"
            value={analysisForm.ManureSource}
            options={manures.map((manure) => ({
              value: manure.UniqueMaterialName,
              label: manure.UniqueMaterialName,
            }))}
            onChange={handleChange}
          />
          {manures.length > 0 && (
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
              <NutrientRadioWrapper>
                {/* // radio button "Book Value" and "Lab Analysis" */}
                <RadioButton
                  label="Book Value"
                  name="BookLab"
                  value="book"
                  checked={analysisForm.BookLab === 'book'}
                  onChange={handleChange}
                />
                <RadioButton
                  label="Lab Analysis"
                  name="BookLab"
                  value="lab"
                  checked={analysisForm.BookLab === 'lab'}
                  onChange={handleChange}
                />
              </NutrientRadioWrapper>
              {/* // Lab Analysis
            // material name Custom - material type here as default?
            // turns nutrient values into inputs */}
              {analysisForm.BookLab === 'lab' && (
                <InputField
                  label="Material Name"
                  type="text"
                  name="UniqueMaterialName"
                  value={analysisForm.UniqueMaterialName}
                  onChange={handleChange}
                />
              )}
              {/* 
            // Book value shows moisture, N, NH4-N, P, K from manure
          */}
              {analysisForm.BookLab === 'book' && (
                <NutrientContent>
                  <ColumnContainer>
                    <RowContainer>
                      <NutrientContainer>
                        <HeaderText>Moisture</HeaderText>
                        <ValueText>{analysisForm.Nutrients.Moisture}</ValueText>
                      </NutrientContainer>
                      <NutrientContainer>
                        <HeaderText>N (%)</HeaderText>
                        <ValueText>{analysisForm.Nutrients.N}</ValueText>
                      </NutrientContainer>
                      <NutrientContainer>
                        <HeaderText>NH4-N (%)</HeaderText>
                        <ValueText>{analysisForm.Nutrients.NH4N}</ValueText>
                      </NutrientContainer>
                      <NutrientContainer>
                        <HeaderText>P (%)</HeaderText>
                        <ValueText>{analysisForm.Nutrients.P}</ValueText>
                      </NutrientContainer>
                      <NutrientContainer>
                        <HeaderText>K (%)</HeaderText>
                        <ValueText>{analysisForm.Nutrients.K}</ValueText>
                      </NutrientContainer>
                    </RowContainer>
                  </ColumnContainer>
                </NutrientContent>
              )}
              {analysisForm.BookLab === 'lab' && (
                <NutrientContent>
                  <ColumnContainer>
                    <RowContainer>
                      <ColumnContainer>
                        <HeaderText>Moisture</HeaderText>
                        <NutrientInputField
                          type="text"
                          name="Moisture"
                          value={analysisForm.Nutrients.Moisture}
                          onChange={handleChange}
                        />
                      </ColumnContainer>
                      <ColumnContainer>
                        <HeaderText>N (%)</HeaderText>
                        <NutrientInputField
                          type="number"
                          name="N"
                          value={analysisForm.Nutrients.N}
                          onChange={handleChange}
                        />
                      </ColumnContainer>
                      <ColumnContainer>
                        <HeaderText>NH4-N (%)</HeaderText>
                        <NutrientInputField
                          type="number"
                          name="NH4N"
                          value={analysisForm.Nutrients.NH4N}
                          onChange={handleChange}
                        />
                      </ColumnContainer>
                      <ColumnContainer>
                        <HeaderText>P (%)</HeaderText>
                        <NutrientInputField
                          type="number"
                          name="P"
                          value={analysisForm.Nutrients.P}
                          onChange={handleChange}
                        />
                      </ColumnContainer>
                      <ColumnContainer>
                        <HeaderText>K (%)</HeaderText>
                        <NutrientInputField
                          type="number"
                          name="K"
                          value={analysisForm.Nutrients.K}
                          onChange={handleChange}
                        />
                      </ColumnContainer>
                    </RowContainer>
                  </ColumnContainer>
                </NutrientContent>
              )}
            </>
          )}
        </Form>
      </Modal>
    </ViewCard>
  );
}
