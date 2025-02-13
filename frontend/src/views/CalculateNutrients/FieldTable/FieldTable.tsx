/**
 * @summary The field table on the calculate nutrients page
 */
import { useContext, useEffect, useState } from 'react';
import { APICacheContext } from '@/context/APICacheContext';
import { ButtonWrapper, TableWrapper } from '../CalculateNutrients.styles';
import { Button, Modal } from '@/components/common';
import FertilizerModal from '../FertilizerModal/FertilizerModal';
import NMPFileFieldData from '@/types/NMPFileFieldData';

interface FieldTableProps {
  field: NMPFileFieldData;
}

// fieldtable displays all the crops in one field tab and has the option to add fertilizer with a modal
export default function FieldTable({ field }: FieldTableProps) {
  const apiCache = useContext(APICacheContext);
  const [isModalVisible, setIsModalVisible] = useState(false);
  // variables for dropdowns fert types, options, filtered options
  const [fertilizerTypes, setFertilizerTypes] = useState<
    {
      id: number;
      name: string;
      dryliquid: string;
      custom: boolean;
    }[]
  >([]);
  const [fertilizerOptions, setFertilizerOptions] = useState<
    {
      id: number;
      name: string;
      dryliquid: string;
      nitrogen: number;
      phosphorous: number;
      potassium: number;
      sortnum: number;
    }[]
  >([]);
  const [fertilizerUnits, setFertilizerUnits] = useState<
    {
      id: number;
      name: string;
      dryliquid: string;
      conversiontoimperialgallonsperacre: number;
    }[]
  >([]);

  // what happens on submit?
  const handleSubmit = () => {
    // setFields((prevFields) =>
    //   prevFields.map((f) => (f.Id === field.Id ? { ...f, Fertilizer: field.Fertilizer } : f)),
    // );
    setIsModalVisible(false);
  };

  // get fertilizer types, names, and conversion units
  useEffect(() => {
    apiCache.callEndpoint('api/fertilizertypes/').then((response: { status?: any; data: any }) => {
      if (response.status === 200) {
        const { data } = response;
        setFertilizerTypes(data);
      }
    });
    apiCache.callEndpoint('api/fertilizers/').then((response: { status?: any; data: any }) => {
      if (response.status === 200) {
        const { data } = response;
        setFertilizerOptions(data);
      }
    });
    apiCache.callEndpoint('api/fertilizerunits/').then((response: { status?: any; data: any }) => {
      if (response.status === 200) {
        const { data } = response;
        setFertilizerUnits(data);
      }
    });
  }, [apiCache]);

  return (
    <div>
      <TableWrapper>
        <div key={field.FieldName}>
          <table>
            <thead>
              <tr>
                <th>Crop</th>
                <th>Agronomic (lb/ac)</th>
                <th>Crop Removal</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {/* for each crop in this field list the crops their nutrients */}
              {field.Crops.map((crop) => (
                <tr key={crop.cropId}>
                  <td>{crop.cropName}</td>
                  <td>
                    N: {crop.reqN}, P2O5: {crop.reqP2o5}, K2O: {crop.reqK2o}
                  </td>
                  <td>
                    N: {crop.remN}, P2O5: {crop.remP2o5}, K2O: {crop.remK2o}
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => setIsModalVisible(true)}
                    >
                      Add Fertilizer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* fertilizer gets added to whole field */}
        {isModalVisible && (
          <Modal
            isVisible={isModalVisible}
            title="Add Fertilizer"
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
            <FertilizerModal
              field={field}
              fertilizerUnits={fertilizerUnits}
              fertilizerTypes={fertilizerTypes}
              fertilizerOptions={fertilizerOptions}
              setIsModalVisible={setIsModalVisible}
            />
          </Modal>
        )}
      </TableWrapper>
    </div>
  );
}
