/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eqeqeq */
/**
 * @summary This is the Crops Tab
 */
import { useState, useEffect, useContext } from 'react';
import { Modal, InputField, Dropdown, RadioButton } from '../../../components/common';
import { ListItemContainer, ListItem } from './crops.styles';
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
  const [currentCropIndex, setCurrentCropIndex] = useState<number | null>(null);
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

  // Works
  const handleChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setCombinedCropsData({ ...combinedCropsData, [name]: value });
    if (name === 'cropTypeId') {
      const selectedCropType = cropsDatabase.filter(
        (type) => type.croptypeid === parseInt(value, 10),
      );
      setFilteredCrops(selectedCropType.map((crop) => ({ value: crop.id, label: crop.cropname })));
    }
  };

  const handleEditCrop = (fieldIndex: number, cropIndex: number) => {
    setCurrentFieldIndex(fieldIndex);
    setCurrentCropIndex(cropIndex);
    setCombinedCropsData(fields[fieldIndex].Crops[cropIndex] || combinedCropsData);
    setIsModalVisible(true);
  };

  const handleDeleteCrop = (fieldIndex: number, cropIndex: number) => {
    const updatedFields = fields.map((field, i) =>
      i === fieldIndex ? { ...field, Crops: field.Crops.filter((_, j) => j !== cropIndex) } : field,
    );
    setFields(updatedFields);
  };

  const handleSubmit = () => {
    if (currentFieldIndex !== null) {
      const updatedFields = fields.map((field, index) =>
        index === currentFieldIndex
          ? {
              ...field,
              Crops:
                currentCropIndex !== null
                  ? field.Crops.map((crop, cropIndex) =>
                      cropIndex === currentCropIndex ? combinedCropsData : crop,
                    )
                  : [...field.Crops, combinedCropsData],
            }
          : field,
      );
      console.log('updatedFields', updatedFields);
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
      <div>
        {fields.map((field, index) => (
          <ListItemContainer key={field.FieldName}>
            <ListItem>FieldName: {field.FieldName}</ListItem>
            {Object.keys(field.Crops[0]).length === 0 ? (
              <button
                type="button"
                onClick={() => {
                  handleEditCrop(index, 0);
                }}
                aria-label={`Add Crop to ${field.FieldName}`}
              >
                Add Crop
              </button>
            ) : (
              <>
                <ListItem>CropType: {field.Crops[0].cropTypeId}</ListItem>
                <button
                  type="button"
                  onClick={() => {
                    handleEditCrop(index, 0);
                  }}
                  aria-label={`Add Crop to ${field.FieldName}`}
                >
                  Edit Crop
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleDeleteCrop(index, 0);
                  }}
                  aria-label={`Add Crop to ${field.FieldName}`}
                >
                  Delete Crop
                </button>
              </>
            )}
          </ListItemContainer>
        ))}
        {/* {fields.map((field, index) => (
          <ListItemContainer key={field.FieldName}>
            <p>Field Name: {field.FieldName}</p>
            {field.Crops.length > 0 && (
              <>
                <ListItem>CropType: {field.Crops[0].cropTypeId}</ListItem>
                <button
                  type="button"
                  onClick={() => handleEditCrop(index, 0)}
                >
                  Edit Crop
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteCrop(index, 0)}
                >
                  Delete Crop
                </button>
              </>
            )}
            {field.Crops.length === 1 && (
              <button
                type="button"
                onClick={() => handleEditCrop(index, 1)}
              >
                Add Another Crop
              </button>
            )}
            {field.Crops.length === 2 && (
              <>
                <ListItem>CropType: {field.Crops[1].cropTypeId}</ListItem>
                <button
                  type="button"
                  onClick={() => handleEditCrop(index, 1)}
                >
                  Edit Second Crop
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteCrop(index, 1)}
                >
                  Delete Second Crop
                </button>
              </>
            )}
            {field.Crops.length === 0 && (
              <button
                type="button"
                onClick={() => handleEditCrop(index, 0)}
              >
                Add Crop
              </button>
            )}
          </ListItemContainer>
        ))} */}
      </div>
      {isModalVisible && (
        <Modal
          isVisible={isModalVisible}
          title="Edit Crop"
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
            <>
              <Dropdown
                label="Previous crop ploughed down (N credit)"
                name="prevCropId"
                value={combinedCropsData.prevCropId?.toString() || ''}
                options={[]}
                onChange={handleChange}
              />
              <span>
                N credit (lb/ac)<div>{combinedCropsData.crudeProtien}</div>
              </span>
            </>
          )}
          {combinedCropsData.cropTypeId == 2 && (
            <>
              <span style={{ marginRight: '8px' }}>Cover Crop Harvested?</span>
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
            </>
          )}
          <span>
            Crop Requirement (lb/ac)
            <div>
              N: {combinedCropsData.reqN} P2O5: {combinedCropsData.reqP2o5} K2O:
              {combinedCropsData.reqK2o}
            </div>
          </span>
          <span>
            Nutrient Removal (lb/ac)
            <div>
              N: {combinedCropsData.remN} P2O5: {combinedCropsData.remP2o5} K2O:
              {combinedCropsData.remK2o}
            </div>
          </span>
        </Modal>
      )}
    </div>
  );
}

export default Crops;
