/**
 * @summary The field table on the calculate nutrients page displays crops in the selected field
 */
import React from 'react';
import { useState } from 'react';
import { TableWrapper } from '../CalculateNutrients.styles';
import Modal from '@/components/common/Modal/Modal';
import FertilizerDetails from '../FertilizerDetails/FertilizerDetails';

interface Field {
  FieldName: string;
  Id: number;
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

export default function FieldTable({ field, setFields }) {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const fertilizerOptions = [
    { value: 0, label: 'Dry Fertilizer' },
    { value: 1, label: 'Dry Fertilizer (Custom)' },
    { value: 2, label: 'Liquid Fertilizer' },
    { value: 3, label: 'Liquid Fertilizer (Custom)' },
  ];

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
    // setFields((prevFields) =>
    //   prevFields.map((f) => (f.Id === field.Id ? { ...f, Fertilizer: field.Fertilizer } : f)),
    // );
    setIsModalVisible(false);
  };

  return (
    <div>
      <TableWrapper>
        <button
          type="button"
          onClick={() => setIsModalVisible(true)}
        >
          Add Fertilizer
        </button>

        {/* fertilizer details modal to enter fertilizer for crop */}
        <Modal
          isVisible={isModalVisible}
          title="Add Fertilizer"
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
            label="Fertilizer"
            name="Fertilizer"
            value={field}
            options={fertilizerOptions}
            onChange={handleChange}
          />
        </Modal>

        {/* display this fields crops as a table */}
        <div>
          <table>
            <thead>
              <tr>
                <th>Agronomic (lb/ac)</th>
                <th>Crop Removal</th>
                <tr>Crops</tr>
              </tr>
            </thead>
            <tbody>
              {field.Crops && field.Crops.length > 0 ? (
                field.Crops.map((crop) => (
                  <tr key={crop.id}>
                    <td>{crop.cropId}</td>
                    <td>
                      {crop.reqN} N, {crop.reqP2o5} P2O5, {crop.reqK2o} K2O
                    </td>
                    <td>
                      {crop.remN} N, {crop.remP2o5} P2O5, {crop.remK2o} K2O
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3}>No crops data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </TableWrapper>
    </div>
  );
}
