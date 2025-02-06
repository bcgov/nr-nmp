/**
 * @summary The field table on the calculate nutrients page
 */
import React, { useContext, useEffect, useState } from 'react';
import { ButtonWrapper, TableWrapper } from '../CalculateNutrients.styles';
import Modal from '@/components/common/Modal/Modal';
import { Button, Dropdown } from '@/components/common';
import { ModalContent } from '@/components/common/Modal/modal.styles';
import { APICacheContext } from '@/context/APICacheContext';

interface Field {
  FieldName: string;
  Id: string;
  Area: string;
  PreviousYearManureApplicationFrequency: string;
  Comment: string;
  SoilTest: object;
  Crops: any[];
}

interface FieldTableProps {
  field: Field;
  setFields: React.Dispatch<React.SetStateAction<Field[]>>;
}

export default function FieldTable({ field, setFields }: FieldTableProps) {
  const apiCache = useContext(APICacheContext);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [fertilizerTypes, setFertilizerTypes] = useState<
    {
      Id: number;
      Name: string;
      DryLiquid: string;
      Custom: boolean;
    }[]
  >([]);
  const [fertilizerOptions, setFertilizerOptions] = useState<
    {
      Id: number;
      Name: string;
      DryLiquid: string;
      Nitrogen: number;
      Phosphorous: number;
      Potassium: number;
      SortNum: number;
    }[]
  >([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFields((allFields) =>
      allFields.map((f) => (f.Id === field.Id ? { ...f, [name]: value } : f)),
    );
  };

  const handleSubmit = () => {
    // setFields((prevFields) =>
    //   prevFields.map((f) => (f.Id === field.Id ? { ...f, Fertilizer: field.Fertilizer } : f)),
    // );
    setIsModalVisible(false);
  };

  useEffect(() => {
    apiCache.callEndpoint('api/croptypes/').then((response: { status?: any; data: any }) => {
      if (response.status === 200) {
        const { data } = response;
        setFertilizerTypes(data);
      }
    });
    apiCache.callEndpoint('api/crops/').then((response: { status?: any; data: any }) => {
      if (response.status === 200) {
        const { data } = response;
        setFertilizerOptions(data);
      }
    });
  }, []);

  return (
    <div>
      <TableWrapper>
        <div key={field.Id}>
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
              {/* for each crop in this field list the crops their nutrients and have a button to add fertlizer */}
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
            <ModalContent>
              <Dropdown
                label="Fertilizer"
                name="Fertilizer"
                value=""
                options={fertilizerTypes.map((type) => ({
                  value: type.Id,
                  label: type.Name,
                }))}
                onChange={handleChange}
              />
            </ModalContent>
          </Modal>
        )}
      </TableWrapper>
    </div>
  );
}
