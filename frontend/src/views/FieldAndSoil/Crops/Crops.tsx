/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eqeqeq */
/**
 * @summary This is the Crops Tab
 */
import { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Modal, InputField, Dropdown, RadioButton, Button } from '../../../components/common';
import {
  ContentWrapper,
  Header,
  Column,
  ListItemContainer,
  ListItem,
  ButtonWrapper,
  LeftJustifiedText,
  ModalContent,
  FlexContainer,
  RightJustifiedText,
  Divider,
  FlexRowContainer,
  HeaderText,
  ValueText,
  ColumnContainer,
  RowContainer,
} from './crops.styles';
import NMPFileCropData from '@/types/NMPFileCropData';
import NMPFileFieldData from '@/types/NMPFileFieldData';
import defaultNMPFileCropsData from '@/constants/DefaultNMPFileCropsData';
import { APICacheContext } from '@/context/APICacheContext';

interface FieldListProps {
  fields: NMPFileFieldData[];
  setFields: (fields: any[]) => void;
}

function Crops({ fields, setFields }: FieldListProps) {
  const apiCache = useContext(APICacheContext);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentFieldIndex, setCurrentFieldIndex] = useState<number | null>(null);
  const [combinedCropsData, setCombinedCropsData] =
    useState<NMPFileCropData>(defaultNMPFileCropsData);
  const [filteredCrops, setFilteredCrops] = useState<{ value: number; label: string }[]>([]);
  const [cropTypesDatabase, setCropTypesDatabase] = useState<
    {
      id: number;
      name: string;
      covercrop: boolean;
      crudeproteinrequired: boolean;
      customcrop: boolean;
      modifynitrogen: boolean;
    }[]
  >([]);
  const [cropsDatabase, setCropsDatabase] = useState<
    {
      cropname: string;
      cropremovalfactork2o: number;
      cropremovalfactornitrogen: number;
      cropremovalfactorp2o5: number;
      croptypeid: number;
      harvestbushelsperton: number;
      id: number;
      manureapplicationhistory: number;
      nitrogenrecommendationid: number;
      nitrogenrecommendationpoundperacre: number;
      nitrogenrecommendationupperlimitpoundperacre: number;
      previouscropcode: number;
      sortnumber: number;
      yieldcd: number;
    }[]
  >([]);

  const handleChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setCombinedCropsData({ ...combinedCropsData, [name]: value });
    if (name === 'cropTypeId') {
      const selectedCropType = cropsDatabase.filter(
        (type) => type.croptypeid === parseInt(value, 10),
      );
      setFilteredCrops(selectedCropType.map((crop) => ({ value: crop.id, label: crop.cropname })));
    }
    if (name === 'cropId') {
      const selectedCrop = cropsDatabase.find((crop) => crop.id === parseInt(value, 10));
      setCombinedCropsData({
        ...combinedCropsData,
        cropName: selectedCrop?.cropname,
        reqN: selectedCrop?.nitrogenrecommendationpoundperacre,
      });
    }
  };

  const handleEditCrop = (fieldIndex: number) => {
    setCurrentFieldIndex(fieldIndex);
    setCombinedCropsData(fields[fieldIndex].Crops[0] || combinedCropsData);
    setIsModalVisible(true);
  };

  const handleDeleteCrop = (fieldIndex: number) => {
    const updatedFields = fields.map((field, index) =>
      index === fieldIndex ? { ...field, Crops: [] } : field,
    );
    setFields(updatedFields);
  };

  const handleSubmit = () => {
    if (currentFieldIndex !== null) {
      const updatedFields = fields.map((field, index) =>
        index === currentFieldIndex ? { ...field, Crops: [combinedCropsData] } : field,
      );
      setFields(updatedFields);
      setIsModalVisible(false);
    }
  };

  useEffect(() => {
    apiCache.callEndpoint('api/croptypes/').then((response: { status?: any; data: any }) => {
      if (response.status === 200) {
        const { data } = response;
        setCropTypesDatabase(data);
      }
    });
    apiCache.callEndpoint('api/crops/').then((response: { status?: any; data: any }) => {
      if (response.status === 200) {
        const { data } = response;
        setCropsDatabase(data);
      }
    });
  }, []);

  return (
    <div>
      <ContentWrapper hasFields={fields.length > 0}>
        <Header>
          <Column>Field Name</Column>
          <Column>Crop Name</Column>
          <Column align="right">Actions</Column>
        </Header>
        {fields.map((field, index) => (
          <ListItemContainer key={field.FieldName}>
            <ListItem>{field.FieldName}</ListItem>
            {field.Crops.length === 0 && <ListItem>None</ListItem>}
            {field.Crops.length === 0 ? (
              <ListItem align="right">
                <Button
                  text="Add Crop"
                  handleClick={() => {
                    handleEditCrop(index);
                  }}
                  aria-label={`Add Crop to ${field.FieldName}`}
                  variant="primary"
                  size="sm"
                  disabled={false}
                />
              </ListItem>
            ) : (
              <>
                <ListItem>{field.Crops[0].cropName}</ListItem>
                <ListItem align="right">
                  <button
                    type="button"
                    onClick={() => {
                      handleEditCrop(index);
                    }}
                    aria-label={`Edit Crop ${field.Crops[0].cropName}`}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleDeleteCrop(index);
                    }}
                    aria-label={`Delete Crop ${field.Crops[0].cropName}`}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </ListItem>
              </>
            )}
          </ListItemContainer>
        ))}
      </ContentWrapper>
      {isModalVisible && (
        <Modal
          isVisible={isModalVisible}
          title="Edit Crop"
          onClose={() => setIsModalVisible(false)}
          footer={
            <ButtonWrapper>
              <Button
                text="Cancel"
                handleClick={() => setIsModalVisible(false)}
                aria-label="Cancel"
                variant="secondary"
                size="sm"
                disabled={false}
              />
              <Button
                text="Submit"
                handleClick={handleSubmit}
                aria-label="Submit"
                variant="primary"
                size="sm"
                disabled={false}
              />
            </ButtonWrapper>
          }
        >
          <ModalContent>
            <Dropdown
              label="Crop Type"
              name="cropTypeId"
              value={combinedCropsData.cropTypeId || ''}
              options={cropTypesDatabase.map((cropType) => ({
                value: cropType.id,
                label: cropType.name,
              }))}
              onChange={handleChange}
            />
            <Dropdown
              label="Crop"
              name="cropId"
              value={combinedCropsData.cropId || ''}
              options={filteredCrops}
              onChange={handleChange}
            />
            {combinedCropsData.cropTypeId == 6 && (
              <InputField
                label="Crop Description"
                type="text"
                name="cropOther"
                value={combinedCropsData.cropOther || ''}
                onChange={handleChange}
              />
            )}
            <InputField
              label="Yield"
              type="text"
              name="yield"
              value={combinedCropsData.yield?.toString() || ''}
              onChange={handleChange}
            />
            {combinedCropsData.cropTypeId == 1 && (
              <InputField
                label="Crude Protein"
                type="text"
                name="crudeProtien"
                value={combinedCropsData.crudeProtien?.toString() || ''}
                onChange={handleChange}
              />
            )}
            {combinedCropsData.cropTypeId != 6 && (
              <FlexContainer>
                <LeftJustifiedText>
                  N credit (lb/ac)<div>{combinedCropsData.crudeProtien}</div>
                </LeftJustifiedText>
                {combinedCropsData.cropTypeId == 2 && (
                  <RightJustifiedText>
                    <span>Cover Crop Harvested?</span>
                    <RadioButton
                      label="Yes"
                      name="coverCropHarvested"
                      value="true"
                      checked={combinedCropsData.coverCropHarvested === 'true'}
                      onChange={handleChange}
                    />
                    <RadioButton
                      label="No"
                      name="coverCropHarvested"
                      value="false"
                      checked={combinedCropsData.coverCropHarvested === 'false'}
                      onChange={handleChange}
                    />
                  </RightJustifiedText>
                )}
              </FlexContainer>
            )}
            <Divider />
            <FlexRowContainer>
              <ColumnContainer>
                <HeaderText>Crop Requirement (lb/ac)</HeaderText>
                <RowContainer>
                  <ColumnContainer>
                    <HeaderText>N</HeaderText>
                    <ValueText>{combinedCropsData.reqN}</ValueText>
                  </ColumnContainer>
                  <ColumnContainer>
                    <HeaderText>P2O5</HeaderText>
                    <ValueText>{combinedCropsData.reqP2o5}</ValueText>
                  </ColumnContainer>
                  <ColumnContainer>
                    <HeaderText>K2O</HeaderText>
                    <ValueText>{combinedCropsData.reqK2o}</ValueText>
                  </ColumnContainer>
                </RowContainer>
              </ColumnContainer>
              <ColumnContainer>
                <HeaderText>Nutrient Removal (lb/ac)</HeaderText>
                <RowContainer>
                  <ColumnContainer>
                    <HeaderText>N</HeaderText>
                    <ValueText>{combinedCropsData.remN}</ValueText>
                  </ColumnContainer>
                  <ColumnContainer>
                    <HeaderText>P2O5</HeaderText>
                    <ValueText>{combinedCropsData.remP2o5}</ValueText>
                  </ColumnContainer>
                  <ColumnContainer>
                    <HeaderText>K2O</HeaderText>
                    <ValueText>{combinedCropsData.remK2o}</ValueText>
                  </ColumnContainer>
                </RowContainer>
              </ColumnContainer>
            </FlexRowContainer>
          </ModalContent>
        </Modal>
      )}
    </div>
  );
}

export default Crops;
