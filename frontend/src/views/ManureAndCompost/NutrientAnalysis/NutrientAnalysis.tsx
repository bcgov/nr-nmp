/**
 * @summary The nutrient analysis tab on the manure page for the application
 */

import { useContext, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { APICacheContext } from '@/context/APICacheContext';
import NMPFileImportedManureData from '@/types/NMPFileImportedManureData';
import { Button, Modal } from '../../../components/common';
import {
  ContentWrapper,
  Column,
  ListItemContainer,
  ListItem,
  ButtonContainer,
  Header,
  ButtonWrapper,
} from './nutrientAnalsysis.styles';
import AnalysisModal from './AnalysisModal/AnalysisModal';

interface ManureListProps {
  manures: NMPFileImportedManureData[];
}

export default function NutrientAnalysis({ manures }: ManureListProps) {
  const apiCache = useContext(APICacheContext);
  const [isModalVisible, setIsModalVisible] = useState(false);
  // manure data from db
  const [manureData, setManureData] = useState<NMPFileImportedManureData[]>([]);
  // an array of objects to hold nutrient analysis form data
  // for each manuresource user can create nutrient analysis' objects
  const [nutrientAnalysisFormData, setNutrientAnalysisFormData] = useState<
    {
      ManureSource: string;
      ManureName: string;
      MaterialType: string;
      BookLab: string;
      MaterialName: string;
      Nutrients: { Moisture: number; N: number; NH4N: number; P: number; K: number };
    }[]
  >([
    {
      ManureSource: '',
      ManureName: '',
      MaterialType: '',
      BookLab: '',
      MaterialName: '',
      Nutrients: { Moisture: 0, N: 0, NH4N: 0, P: 0, K: 0 },
    },
  ]);

  // add new nutrient analysis, open modal
  // const handleAdd = () => {
  //   setIsModalVisible(true);
  //   setAnalysisIndex(nutrientAnalysisFormData.length);
  //   setNutrientAnalysisFormData((prevData) => [
  //     ...prevData,
  //     {
  //       ManureSource: '',
  //       ManureName: '',
  //       MaterialType: '',
  //       BookLab: '',
  //       MaterialName: '',
  //       Nutrients: { Moisture: 0, N: 0, NH4N: 0, P: 0, K: 0 },
  //     },
  //   ]);
  // };

  // how to handle radio buttons?
  // const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  //   const { name, value } = e.target;
  //   setNutrientAnalysisFormData({ ...nutrientAnalysisFormData, [name]: value });
  // };

  const handleEdit = () => {
    setIsModalVisible(true);
  };

  const handleDelete = () => {
    setNutrientAnalysisFormData(nutrientAnalysisFormData);
  };

  const handleSubmit = () => {
    setIsModalVisible(false);
  };

  // get manure types
  useEffect(() => {
    apiCache.callEndpoint('api/manures/').then((response: { status?: any; data: any }) => {
      if (response.status === 200) {
        const { data } = response;
        setManureData(data);
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
      {manures.length > 0 && (
        <ButtonContainer>
          {/* button to add a nutrient analysis if there are manures to add it to */}
          {/* add a new nutrient analysis */}
          <Button
            variant="default"
            size="sm"
            disabled={manures.length === 0}
            text="Add a Nutrient Analysis"
            handleClick={() => setIsModalVisible(true)}
          />
        </ButtonContainer>
      )}
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
        <AnalysisModal
          manures={manures}
          manureData={manureData}
        />
      </Modal>
    </div>
  );
}
