/**
 * @summary This is the Soil Tests Tab
 */
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Dropdown, Modal, InputField, Button } from '../../../components/common';
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

interface FieldListProps {
  fields: any[];
  setFields: (fields: any[]) => void;
}

export default function SoilTests({ fields, setFields }: FieldListProps) {
  const [soilTestData, setSoilTestData] = useState({
    SoilTest: '1',
    ConvertedKelownaK: '2',
    ConvertedKelownaP: '4',
    ValP: '',
    sampleDate: '',
    valK: '',
    valNO3H: '',
    valPH: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentFieldIndex, setCurrentFieldIndex] = useState<number | null>(null);

  const soilTestOptions = [
    { value: 1, label: 'No Soil Test from within the past 3 years' },
    { value: 2, label: 'Other Lab (Bicarbonate and Amm Acetate)' },
  ];

  const handleChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setSoilTestData({ ...soilTestData, [name]: value });
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!soilTestData.sampleDate) {
      newErrors.sampleDate = 'Sample Month is required';
    }
    if (!soilTestData.valNO3H || Number.isNaN(Number(soilTestData.valNO3H))) {
      newErrors.valNO3H = 'NO3-N (ppm) is required and must be a number';
    }
    if (!soilTestData.ValP || Number.isNaN(Number(soilTestData.ValP))) {
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
    if (currentFieldIndex !== null) {
      const updatedFields = fields.map((field, index) =>
        index === currentFieldIndex ? { ...field, SoilTest: soilTestData } : field,
      );
      setFields(updatedFields);
      setIsModalVisible(false);
    }
  };

  return (
    <div>
      <ContentWrapper hasFields={fields.length > 0}>
        {soilTestData.SoilTest === '1' && (
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
          name="SoilTest"
          value={soilTestData.SoilTest}
          options={soilTestOptions}
          onChange={handleChange}
        />
        {soilTestData.SoilTest !== '1' && (
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
                <ListItem>{field.SoilTest.ValP}</ListItem>
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
            value={soilTestData.sampleDate}
            onChange={handleChange}
          />
          {errors.valNO3H && <ErrorText>{errors.valNO3H}</ErrorText>}
          <InputField
            label="NO3-N (ppm), nitrate-nitrogen"
            type="text"
            name="valNO3H"
            value={soilTestData.valNO3H}
            onChange={handleChange}
          />
          {errors.ValP && <ErrorText>{errors.ValP}</ErrorText>}
          <InputField
            label="P (ppm), phosphorus"
            type="text"
            name="ValP"
            value={soilTestData.ValP}
            onChange={handleChange}
          />
          {errors.valK && <ErrorText>{errors.valK}</ErrorText>}
          <InputField
            label="K (ppm), potassium"
            type="text"
            name="valK"
            value={soilTestData.valK}
            onChange={handleChange}
          />
          {errors.valPH && <ErrorText>{errors.valPH}</ErrorText>}
          <InputField
            label="pH"
            type="text"
            name="valPH"
            value={soilTestData.valPH}
            onChange={handleChange}
          />
        </Modal>
      )}
    </div>
  );
}
