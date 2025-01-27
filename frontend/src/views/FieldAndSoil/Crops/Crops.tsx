/**
 * @summary This is the Crops Tab
 */
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, InputField, Dropdown } from '../../../components/common';
import { ListItemContainer } from './crops.styles';
import NMPFileCropData from '@/types/NMPFileCropData';
import NMPFileFieldData from '@/types/NMPFileFieldData';
import defaultNMPFileCropsData from '@/constants/DefaultNMPFileCropsData';

interface FieldListProps {
  fields: NMPFileFieldData[];
  setFields: (fields: any[]) => void;
}

export default function Crops({ fields, setFields }: FieldListProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentFieldIndex, setCurrentFieldIndex] = useState<number | null>(null);
  const [combinedCropsData, setCombinedCropsData] =
    useState<NMPFileCropData>(defaultNMPFileCropsData);
  // const [filteredCrops, setFilteredCrops] = useState<{ value: number; label: string }[]>([]);
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
    console.log('cropsData: ', combinedCropsData);
    if (name === 'cropTypeId') {
      // const selectedCropType = crops.find((type) => type.value === parseInt(value, 10));
      // setFilteredCrops(selectedCropType ? selectedCropType.crops : []);
    }
  };

  const handleEditCrop = (index: number) => {
    setCurrentFieldIndex(index);
    setCombinedCropsData(fields[index].Crops[0] || combinedCropsData);
    setIsModalVisible(true);
  };

  const handleDeleteCrop = (index: number) => {
    const updatedFields = fields.map((field, i) =>
      i === index ? { ...field, SoilTest: {} } : field,
    );
    setFields(updatedFields);
  };

  const handleSubmit = () => {
    if (currentFieldIndex !== null) {
      const updatedFields = fields.map((field, index) =>
        index === currentFieldIndex ? { ...field, Crops: combinedCropsData } : field,
      );
      setFields(updatedFields);
      setIsModalVisible(false);
    }
  };

  useEffect(() => {
    axios.get('http://localhost:3000/api/croptypes/').then((response) => {
      setCropTypesDatabase(response.data);
    });
    axios.get('http://localhost:3000/api/crops/').then((response) => {
      console.log('CROPS: ', response.data);
      setCropsDatabase(response.data);
    });
  }, []);

  return (
    <div>
      <div>
        {fields.map((field, index) => (
          <ListItemContainer key={field.FieldName}>
            <p>Field Name: {field.FieldName}</p>
            {Object.keys(field.Crops).length === 1 ? (
              <button
                type="button"
                onClick={() => handleEditCrop(index)}
              >
                Add Crop
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleEditCrop(index)}
                >
                  Edit Crop
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteCrop(index)}
                >
                  Delete Crop
                </button>
                <button
                  type="button"
                  onClick={() => handleEditCrop(index)}
                >
                  Add Another Crop
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
          <Dropdown
            label="Crop Type"
            name="cropTypeId"
            value={combinedCropsData.cropTypeId ?? ''}
            options={cropTypesDatabase.map((crop) => ({ value: crop.id, label: crop.name }))}
            onChange={handleChange}
          />
          <Dropdown
            label="Crop"
            name="cropId"
            value={combinedCropsData.cropId ?? ''}
            options={cropsDatabase.map((crop) => ({ value: crop.id, label: crop.cropname }))}
            onChange={handleChange}
          />
          <InputField
            label="Yield"
            type="text"
            name="yield"
            value={combinedCropsData.yield?.toString() || ''}
            onChange={handleChange}
          />
        </Modal>
      )}
    </div>
  );
}
