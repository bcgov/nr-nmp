/**
 * @summary This is the Crops Tab
 */
import { useState } from 'react';
import { Modal, InputField } from '../../../components/common';
import { ListItemContainer } from './crops.styles';

interface CropData {
  coverCropHarvested: null | string;
  cropId: string;
  cropOther: null | string;
  crudeProtien: null | string;
  distanceBtwnPlantsRows: null | string;
  id: null | string;
  numberOfPlantsPerAcre: null | number;
  plantAgeYears: null | number;
  prevCropId: null | string;
  prevYearManureAppl_volCatCd: null | string;
  remK2o: null | number;
  remN: null | number;
  remP2o5: null | number;
  reqK2o: null | number;
  reqN: null | number;
  reqP2o5: null | number;
  stdN: null | number;
  whereWillPruningsGo: null | string;
  willPlantsBePruned: boolean;
  willSawdustBeApplied: boolean;
  yield: null | number;
  yieldByHarvestUnit: null | number;
  yieldHarvestUnit: null | number;
}

interface Field {
  FieldName: string;
  Area: string;
  PreviousYearManureApplicationFrequency: string;
  Comment: string;
  SoilTest: object;
  Crops: CropData[];
}

interface FieldListProps {
  fields: Field[];
  setFields: (fields: any[]) => void;
}

export default function Crops({ fields, setFields }: FieldListProps) {
  const [cropsData, setCropsData] = useState<CropData>({
    coverCropHarvested: null,
    cropId: '',
    cropOther: null,
    crudeProtien: null,
    distanceBtwnPlantsRows: null,
    id: null,
    numberOfPlantsPerAcre: null,
    plantAgeYears: null,
    prevCropId: null,
    prevYearManureAppl_volCatCd: null,
    remK2o: 0,
    remN: 0,
    remP2o5: 0,
    reqK2o: 0,
    reqN: 0,
    reqP2o5: 0,
    stdN: 0,
    whereWillPruningsGo: null,
    willPlantsBePruned: false,
    willSawdustBeApplied: false,
    yield: 0,
    yieldByHarvestUnit: 0,
    yieldHarvestUnit: 0,
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentFieldIndex, setCurrentFieldIndex] = useState<number | null>(null);

  const handleChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setCropsData({ ...cropsData, [name]: value });
  };

  const handleEditSoilTest = (index: number) => {
    setCurrentFieldIndex(index);
    setCropsData(fields[index].Crops[0] || cropsData);
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
        index === currentFieldIndex ? { ...field, Crops: cropsData } : field,
      );
      setFields(updatedFields);
      setIsModalVisible(false);
    }
  };

  return (
    <div>
      <div>
        {fields.map((field, index) => (
          <ListItemContainer key={field.FieldName}>
            <p>Field Name: {field.FieldName}</p>
            {Object.keys(field.Crops).length === 0 ? (
              <button
                type="button"
                onClick={() => handleEditSoilTest(index)}
              >
                Add Crop
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleEditSoilTest(index)}
                >
                  Add Crop
                </button>
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
            label="NO3-N (ppm), nitrate-nitrogen"
            type="number"
            name="remK2o"
            value={cropsData.remK2o?.toString() ?? ''}
            onChange={handleChange}
          />
        </Modal>
      )}
    </div>
  );
}
