/**
 * @summary This is the Soil Tests Tab
 */
import { useState } from 'react';
import { Dropdown, Modal, InputField } from '../../../components/common';
import { InfoBox, ListItemContainer, CardContent } from './soilTests.styles';

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
      <CardContent>
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
            {fields.map((field, index) => (
              <ListItemContainer key={field.FieldName}>
                <p>Field Name: {field.FieldName}</p>
                <p>Sampling Month: {field.SoilTest.sampleDate}</p>
                <p>NO3-N (ppm): {field.SoilTest.valNO3H}</p>
                <p>P (ppm): {field.SoilTest.ValP}</p>
                <p>K (ppm): {field.SoilTest.valK}</p>
                <p>pH: {field.SoilTest.valPH}</p>
                {Object.keys(field.SoilTest).length === 0 ? (
                  <button
                    type="button"
                    onClick={() => handleEditSoilTest(index)}
                  >
                    Add Soil Test Results
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handleEditSoilTest(index)}
                    >
                      Edit Soil Test
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSoilTest(index)}
                    >
                      Delete Soil Test
                    </button>
                  </>
                )}
              </ListItemContainer>
            ))}
          </div>
        )}
      </CardContent>
      {isModalVisible && (
        <Modal
          isVisible={isModalVisible}
          title="Edit Soil Test"
          onClose={() => setIsModalVisible(false)}
          footer={
            <button
              type="button"
              onClick={handleSubmit}
            >
              Submit
            </button>
          }
        >
          <InputField
            label="Sample Month"
            type="month"
            name="sampleDate"
            value={soilTestData.sampleDate}
            onChange={handleChange}
          />
          <InputField
            label="NO3-N (ppm), nitrate-nitrogen"
            type="text"
            name="valNO3H"
            value={soilTestData.valNO3H}
            onChange={handleChange}
          />
          <InputField
            label="P (ppm), phosphorus"
            type="text"
            name="ValP"
            value={soilTestData.ValP}
            onChange={handleChange}
          />
          <InputField
            label="K (ppm), potassium"
            type="text"
            name="valK"
            value={soilTestData.valK}
            onChange={handleChange}
          />
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
