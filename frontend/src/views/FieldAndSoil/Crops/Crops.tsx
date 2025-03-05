/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eqeqeq */
/**
 * @summary This is the Crops Tab
 */
import { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import useAppService from '@/services/app/useAppService';
import { Modal, InputField, Dropdown, RadioButton, Button } from '../../../components/common';
import {
  getRegion,
  getCrop,
  getCropRequirementP205,
  getCropRequirementK2O,
  getCropRequirementN,
  getCropRemovalN,
  getCropRemovalP205,
  getCropRemovalK20,
} from '@/calculations/FieldAndSoil/Crops/Calculations';
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
  ErrorText,
} from './crops.styles';
import {
  CropTypesDatabase,
  NMPFileCropData,
  NMPFileFieldData,
  CropsDatabase,
  PreviousCropsDatabase,
} from '@/types';
import defaultNMPFileCropsData from '@/constants/DefaultNMPFileCropsData';
import { APICacheContext } from '@/context/APICacheContext';

interface FieldListProps {
  fields: NMPFileFieldData[];
  setFields: (fields: any[]) => void;
}

function Crops({ fields, setFields }: FieldListProps) {
  const { state } = useAppService();
  const [ncredit, setNcredit] = useState<number>(0);
  const apiCache = useContext(APICacheContext);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentFieldIndex, setCurrentFieldIndex] = useState<number | null>(null);
  const [combinedCropsData, setCombinedCropsData] =
    useState<NMPFileCropData>(defaultNMPFileCropsData);
  const [filteredCrops, setFilteredCrops] = useState<{ value: number; label: string }[]>([]);
  const [cropTypesDatabase, setCropTypesDatabase] = useState<CropTypesDatabase[]>([]);
  const [cropsDatabase, setCropsDatabase] = useState<CropsDatabase[]>([]);
  const [previousCropDatabase, setPreviousCropDatabase] = useState<PreviousCropsDatabase[]>([]);
  const [calculationsPerformed, setCalculationsPerformed] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setCombinedCropsData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Clear the error for the field being changed
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }

    if (name === 'cropTypeId') {
      const selectedCropType = cropsDatabase.filter(
        (type) => type.croptypeid === parseInt(value, 10),
      );
      setFilteredCrops(selectedCropType.map((crop) => ({ value: crop.id, label: crop.cropname })));
    }

    if (name === 'cropId') {
      const selectedCrop = cropsDatabase.find((crop) => crop.id === parseInt(value, 10));
      setCombinedCropsData((prevData) => ({
        ...prevData,
        cropName: selectedCrop?.cropname,
      }));
    }
  };

  const handleEditCrop = (fieldIndex: number) => {
    setCurrentFieldIndex(fieldIndex);
    setCombinedCropsData(fields[fieldIndex].Crops[0] || combinedCropsData);
    setCalculationsPerformed(false);
    setErrors({}); // Clear errors when modal is opened
    setIsModalVisible(true);
  };

  const handleDeleteCrop = (fieldIndex: number) => {
    const updatedFields = fields.map((field, index) =>
      index === fieldIndex ? { ...field, Crops: [] } : field,
    );
    setFields(updatedFields);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!combinedCropsData.cropTypeId) {
      newErrors.cropTypeId = 'Crop Type is required';
    }

    if (!combinedCropsData.cropId) {
      newErrors.cropId = 'Crop is required';
    }

    if (!combinedCropsData.yield) {
      newErrors.yield = 'Yield is required';
    } else if (
      Number.isNaN(Number(combinedCropsData.yield)) ||
      Number(combinedCropsData.yield) <= 0
    ) {
      newErrors.yield = 'Yield must be a valid number greater than zero';
    }

    if (combinedCropsData.cropTypeId == 6 && !combinedCropsData.cropOther) {
      newErrors.cropOther = 'Crop Description is required';
    }

    if (combinedCropsData.cropTypeId == 1 && !combinedCropsData.crudeProtien) {
      newErrors.crudeProtien = 'Crude Protein is required';
    } else if (
      combinedCropsData.cropTypeId == 1 &&
      (Number.isNaN(Number(combinedCropsData.crudeProtien)) ||
        Number(combinedCropsData.crudeProtien) <= 0)
    ) {
      newErrors.crudeProtien = 'Crude Protein must be a valid number greater than zero';
    }

    // Only validate previous crop if options are available
    if (
      combinedCropsData.cropTypeId != 6 &&
      combinedCropsData.cropId &&
      !combinedCropsData.prevCropId
    ) {
      // Check if there are previous crop options for this crop
      const hasPreviousCropOptions = previousCropDatabase.some(
        (crop) => crop.cropid === Number(combinedCropsData.cropId),
      );

      if (hasPreviousCropOptions) {
        newErrors.prevCropId = 'Previous crop selection is required';
      }
    }

    if (combinedCropsData.cropTypeId == 2 && !combinedCropsData.coverCropHarvested) {
      newErrors.coverCropHarvested = 'Please specify if cover crop was harvested';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCalculate = async () => {
    if (!validateForm()) {
      return; // Stop if validation fails
    }

    if (currentFieldIndex !== null) {
      try {
        const cropRequirementP205 = await getCropRequirementP205(
          fields[currentFieldIndex],
          setFields,
          combinedCropsData,
          JSON.parse(state.nmpFile).farmDetails.FarmRegion,
        );

        const cropRequirementK2O = await getCropRequirementK2O(
          fields[currentFieldIndex],
          setFields,
          combinedCropsData,
          JSON.parse(state.nmpFile).farmDetails.FarmRegion,
        );

        const cropRequirementN = await getCropRequirementN(
          fields[currentFieldIndex],
          setFields,
          combinedCropsData,
          JSON.parse(state.nmpFile).farmDetails.FarmRegion,
        );

        const cropRemovalN = await getCropRemovalN(
          combinedCropsData,
          JSON.parse(state.nmpFile).farmDetails.FarmRegion,
        );

        const cropRemovalP205 = await getCropRemovalP205(
          combinedCropsData,
          JSON.parse(state.nmpFile).farmDetails.FarmRegion,
        );

        const cropRemovalK20 = await getCropRemovalK20(
          combinedCropsData,
          JSON.parse(state.nmpFile).farmDetails.FarmRegion,
        );

        // Update the crops data with calculated values
        setCombinedCropsData((prevData) => ({
          ...prevData,
          reqP2o5: cropRequirementP205,
          reqK2o: cropRequirementK2O,
          reqN: cropRequirementN,
          remN: cropRemovalN,
          remP2o5: cropRemovalP205,
          remK2o: cropRemovalK20,
        }));

        // Mark calculations as performed
        setCalculationsPerformed(true);
      } catch (error) {
        console.error('Error calculating crop data:', error);
      }
    }
  };

  const handleSubmit = () => {
    if (currentFieldIndex !== null) {
      const updatedFields = fields.map((field, index) => {
        if (index === currentFieldIndex) {
          return { ...field, Crops: [combinedCropsData] };
        }
        return field;
      });

      setFields(updatedFields);
      setIsModalVisible(false);
      setCalculationsPerformed(false);
      setErrors({}); // Clear all errors
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
    apiCache
      .callEndpoint('api/previouscroptypes/')
      .then((response: { status?: any; data: any }) => {
        if (response.status === 200) {
          const { data } = response;
          setPreviousCropDatabase(data);
        }
      });
  }, []);

  useEffect(() => {
    try {
      if (combinedCropsData.prevCropId && combinedCropsData.prevCropId != 0) {
        apiCache
          .callEndpoint(`api/previouscroptypes/${combinedCropsData.prevCropId}/`)
          .then((response: { status?: any; data: any }) => {
            if (response.status === 200) {
              const { data } = response;
              setNcredit(data[0].nitrogencreditimperial || 0);
            }
          });
      }
    } catch (error) {
      console.error('Error getting nitrogen credit:', error);
    }
  }, [combinedCropsData.prevCropId]);

  useEffect(() => {
    if (combinedCropsData.cropId && Number(combinedCropsData.cropId) !== 0) {
      try {
        (async () => {
          const region = await getRegion(JSON.parse(state.nmpFile).farmDetails.FarmRegion);
          apiCache
            .callEndpoint(`api/cropyields/${combinedCropsData.cropId}/${region[0]?.locationid}/`)
            .then((response: { status?: any; data: any }) => {
              if (response.status === 200) {
                const { data } = response;
                setCombinedCropsData((prevData) => ({
                  ...prevData,
                  yield: data[0].amount,
                }));
              }
            });
        })();
      } catch (error) {
        console.error('Error getting crop yield:', error);
      }
      try {
        (async () => {
          const nToProteinConversionFactor = 0.625;
          const unitConversionFactor = 0.5;
          const crop = await getCrop(Number(combinedCropsData.cropId));

          if (crop && crop.nitrogenrecommendationid != null) {
            const crudeProtien =
              crop.cropremovalfactornitrogen * nToProteinConversionFactor * unitConversionFactor;
            setCombinedCropsData((prevData) => ({
              ...prevData,
              crudeProtien,
            }));
          }
        })();
      } catch (error) {
        console.error('Error getting crop protein data:', error);
      }
    }
  }, [combinedCropsData.cropId]);

  const modalFooter = (
    <ButtonWrapper>
      <Button
        text="Cancel"
        handleClick={() => {
          setIsModalVisible(false);
          setCalculationsPerformed(false);
        }}
        aria-label="Cancel"
        variant="secondary"
        size="sm"
        disabled={false}
      />
      <Button
        text={calculationsPerformed ? 'Submit' : 'Calculate'}
        handleClick={calculationsPerformed ? handleSubmit : handleCalculate}
        aria-label={calculationsPerformed ? 'Submit' : 'Calculate'}
        variant="primary"
        size="sm"
        disabled={false}
      />
    </ButtonWrapper>
  );

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
                  handleClick={() => handleEditCrop(index)}
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
                    onClick={() => handleEditCrop(index)}
                    aria-label={`Edit Crop ${field.Crops[0].cropName}`}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteCrop(index)}
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
          onClose={() => {
            setIsModalVisible(false);
            setCalculationsPerformed(false);
            setErrors({});
          }}
          footer={modalFooter}
        >
          <ModalContent>
            {errors.cropTypeId && <ErrorText>{errors.cropTypeId}</ErrorText>}

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
            {errors.cropId && <ErrorText>{errors.cropId}</ErrorText>}
            <Dropdown
              label="Crop"
              name="cropId"
              value={combinedCropsData.cropId || ''}
              options={filteredCrops}
              onChange={handleChange}
            />
            {/* Each of these are a conditional render based on the cropTypeId of the select crop type */}
            {combinedCropsData.cropTypeId != 6 && (
              <>
                {(() => {
                  const availablePreviousCrops = previousCropDatabase.filter(
                    (crop) => crop.cropid === Number(combinedCropsData.cropId),
                  );

                  return availablePreviousCrops.length > 0 ? (
                    <>
                      {errors.prevCropId && <ErrorText>{errors.prevCropId}</ErrorText>}
                      <Dropdown
                        label="Previous crop ploughed down (N credit)"
                        name="prevCropId"
                        value={combinedCropsData.prevCropId || ''}
                        options={availablePreviousCrops.map((crop) => ({
                          value: crop.id,
                          label: crop.name,
                        }))}
                        onChange={handleChange}
                      />
                    </>
                  ) : null;
                })()}
              </>
            )}
            {combinedCropsData.cropTypeId == 6 && (
              <>
                {errors.cropOther && <ErrorText>{errors.cropOther}</ErrorText>}
                <InputField
                  label="Crop Description"
                  type="text"
                  name="cropOther"
                  value={combinedCropsData.cropOther || ''}
                  onChange={handleChange}
                />
              </>
            )}
            {errors.yield && <ErrorText>{errors.yield}</ErrorText>}
            <InputField
              label="Yield"
              type="text"
              name="yield"
              value={combinedCropsData.yield?.toString() || ''}
              onChange={handleChange}
            />
            {combinedCropsData.cropTypeId == 1 && (
              <>
                {errors.crudeProtien && <ErrorText>{errors.crudeProtien}</ErrorText>}
                <InputField
                  label="Crude Protein"
                  type="text"
                  name="crudeProtien"
                  value={combinedCropsData.crudeProtien?.toString() || ''}
                  onChange={handleChange}
                />
              </>
            )}
            {combinedCropsData.cropTypeId != 6 && (
              <FlexContainer>
                <LeftJustifiedText>
                  N credit (lb/ac)<div>{ncredit}</div>
                </LeftJustifiedText>
                {combinedCropsData.cropTypeId == 2 && (
                  <RightJustifiedText>
                    <span>Cover Crop Harvested?</span>
                    {errors.coverCropHarvested && (
                      <ErrorText>{errors.coverCropHarvested}</ErrorText>
                    )}
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
                    {errors.coverCropHarvested && (
                      <div style={{ color: 'red', fontSize: '12px' }}>
                        {errors.coverCropHarvested}
                      </div>
                    )}
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
