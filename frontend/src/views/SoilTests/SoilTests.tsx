/* eslint-disable react-hooks/exhaustive-deps */
/**
 * @summary This is the Soil Tests Tab
 */
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Dropdown, Modal, InputField, Button } from '../../components/common';
import { APICacheContext } from '@/context/APICacheContext';
import defaultSoilTestData from '@/constants/DefaultSoilTestData';
import { NMPFileFieldData, soilTestMethodsData } from '@/types';
import {
  InfoBox,
  ListItemContainer,
  ContentWrapper,
  Header,
  Column,
  ListItem,
  ButtonWrapper,
  ErrorText,
} from './soilTests.styles';
import useAppService from '@/services/app/useAppService';
import { initFields, saveFieldsToFile } from '@/utils/utils';
import { CROPS, FIELD_LIST } from '@/constants/RouteConstants';
import ViewCard from '@/components/common/ViewCard/ViewCard';

export default function SoilTests() {
  const { state, setNMPFile, setProgressStep } = useAppService();
  const navigate = useNavigate();
  const apiCache = useContext(APICacheContext);

  const [soilTestData, setSoilTestData] = useState(defaultSoilTestData);
  const [soilTestId, setSoilTestId] = useState('');
  const [soilTestMethods, setSoilTestMethods] = useState<soilTestMethodsData[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentFieldIndex, setCurrentFieldIndex] = useState<number | null>(null);
  const [fields, setFields] = useState<NMPFileFieldData[]>(initFields(state));

  const handleChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;

    setSoilTestData({ ...soilTestData, [name]: value });
    if (name === 'soilTest') {
      setSoilTestId(value);
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!soilTestData.sampleDate) {
      newErrors.sampleDate = 'Sample Month is required';
    }
    if (!soilTestData.valNO3H || Number.isNaN(Number(soilTestData.valNO3H))) {
      newErrors.valNO3H = 'NO3-N (ppm) is required and must be a number';
    }
    if (!soilTestData.valP || Number.isNaN(Number(soilTestData.valP))) {
      newErrors.ValP = 'P (ppm) is required and must be a number';
    }
    if (!soilTestData.valK || Number.isNaN(Number(soilTestData.valK))) {
      newErrors.valK = 'K (ppm) is required and must be a number';
    }
    if (!soilTestData.valPH || Number.isNaN(Number(soilTestData.valPH))) {
      newErrors.valPH = 'pH is required and must be a number';
    }
    if (Number(soilTestData.valPH) < 0 || Number(soilTestData.valPH) > 14) {
      newErrors.valPH = 'pH must be between 0 and 14';
    }
    return newErrors;
  };

  const handleEditSoilTest = (index: number) => {
    setCurrentFieldIndex(index);
    setSoilTestData(fields[index].SoilTest || {});
    setIsModalVisible(true);
  };

  const handleDeleteSoilTest = (index: number) => {
    const updatedFields = fields.map((field, i) =>
      i === index ? { ...field, SoilTest: {} } : field,
    );
    setFields(updatedFields);
  };

  const handleSubmit = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    // Calculate convertedKelownaP directly
    const lessThan72 = soilTestMethods.find(
      (method) => method.id === Number(soilTestId),
    )?.converttokelownaphlessthan72;
    const greaterThan72 = soilTestMethods.find(
      (method) => method.id === Number(soilTestId),
    )?.converttokelownaphgreaterthan72;

    let convertedKelownaP = soilTestData.valP;

    if (Number(soilTestData.valPH) < 7.2 && lessThan72 !== undefined) {
      convertedKelownaP = (Number(soilTestData.valP) * lessThan72).toString();
    } else if (Number(soilTestData.valPH) >= 7.2 && greaterThan72 !== undefined) {
      convertedKelownaP = (Number(soilTestData.valP) * greaterThan72).toString();
    }

    // Calculate converted Kelowna K value (if you need it)
    const convertedKelownaK =
      soilTestMethods.find((method) => method.id === Number(soilTestId))?.converttokelownak !==
      undefined
        ? (
            Number(soilTestData.valK) *
            soilTestMethods.find((method) => method.id === Number(soilTestId))!.converttokelownak
          ).toString()
        : soilTestData.valK;

    // Create updated soil test data with the converted values
    const updatedSoilTestData = {
      ...soilTestData,
      convertedKelownaP,
      convertedKelownaK,
    };

    // Update state for future reference
    setSoilTestData(updatedSoilTestData);

    if (currentFieldIndex !== null) {
      const updatedFields = fields.map((field, index) =>
        index === currentFieldIndex ? { ...field, SoilTest: updatedSoilTestData } : field,
      );
      setFields(updatedFields);
      setIsModalVisible(false);
    }
  };

  const handleNext = () => {
    saveFieldsToFile(fields, state.nmpFile, setNMPFile);
    navigate(CROPS);
  };

  const handlePrevious = () => {
    navigate(FIELD_LIST);
  };

  useEffect(() => {
    apiCache.callEndpoint('api/soiltestmethods/').then((response: { status?: any; data: any }) => {
      if (response.status === 200) {
        const { data } = response;
        setSoilTestMethods(data);
      }
    });
  }, []);

  useEffect(() => {
    setProgressStep(3);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ViewCard
      handlePrevious={handlePrevious}
      handleNext={handleNext}
      nextDisabled={fields.length === 0}
    >
      <ContentWrapper hasFields={fields.length > 0}>
        {soilTestData.soilTest === '1' && (
          <InfoBox>
            Do you have soil test from within the past 3 years?
            <ul>
              <li>Yes - Select the lab used (soil test methods)</li>
              <li>No - Click Next</li>
            </ul>
          </InfoBox>
        )}
        <Dropdown
          label="Lab (Soil Test Method)"
          name="soilTest"
          value={soilTestData.soilTest || ''}
          options={soilTestMethods.map((method) => ({
            value: method.id,
            label: method.name,
          }))}
          onChange={handleChange}
        />
        {soilTestData.soilTest !== '1' && (
          <div>
            {fields.length > 0 && (
              <Header>
                <Column>Field Name</Column>
                <Column>Sampling Month</Column>
                <Column>NO3-N (ppm)</Column>
                <Column>P (ppm)</Column>
                <Column>K (ppm)</Column>
                <Column>pH</Column>
                <Column align="right">Actions</Column>
              </Header>
            )}
            {fields.map((field, index) => (
              <ListItemContainer key={field.FieldName}>
                <ListItem>{field.FieldName}</ListItem>
                <ListItem>{field.SoilTest.sampleDate}</ListItem>
                <ListItem>{field.SoilTest.valNO3H}</ListItem>
                <ListItem>{field.SoilTest.valP}</ListItem>
                <ListItem>{field.SoilTest.valK}</ListItem>
                <ListItem>{field.SoilTest.valPH}</ListItem>
                {Object.keys(field.SoilTest).length === 0 ? (
                  <ListItem align="right">
                    <Button
                      text="Add Soil Test"
                      handleClick={() => handleEditSoilTest(index)}
                      aria-label="Add Soil Test Results"
                      variant="primary"
                      size="sm"
                      disabled={false}
                    />
                  </ListItem>
                ) : (
                  <ListItem align="right">
                    <button
                      type="button"
                      onClick={() => handleEditSoilTest(index)}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSoilTest(index)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </ListItem>
                )}
              </ListItemContainer>
            ))}
          </div>
        )}
      </ContentWrapper>
      {isModalVisible && (
        <Modal
          isVisible={isModalVisible}
          title="Edit Soil Test"
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
          {errors.sampleDate && <ErrorText>{errors.sampleDate}</ErrorText>}
          <InputField
            label="Sample Month"
            type="month"
            name="sampleDate"
            value={soilTestData.sampleDate || ''}
            onChange={handleChange}
          />
          {errors.valNO3H && <ErrorText>{errors.valNO3H}</ErrorText>}
          <InputField
            label="NO3-N (ppm), nitrate-nitrogen"
            type="text"
            name="valNO3H"
            value={soilTestData.valNO3H || ''}
            onChange={handleChange}
          />
          {errors.ValP && <ErrorText>{errors.ValP}</ErrorText>}
          <InputField
            label="P (ppm), phosphorus"
            type="text"
            name="valP"
            value={soilTestData.valP || ''}
            onChange={handleChange}
          />
          {errors.valK && <ErrorText>{errors.valK}</ErrorText>}
          <InputField
            label="K (ppm), potassium"
            type="text"
            name="valK"
            value={soilTestData.valK || ''}
            onChange={handleChange}
          />
          {errors.valPH && <ErrorText>{errors.valPH}</ErrorText>}
          <InputField
            label="pH"
            type="text"
            name="valPH"
            value={soilTestData.valPH || ''}
            onChange={handleChange}
          />
        </Modal>
      )}
    </ViewCard>
  );
}
