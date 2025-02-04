/**
 * @summary The field table on the calculate nutrients page
 */
import React from 'react';
import { useState } from 'react';
import { TableWrapper } from '../CalculateNutrients.styles';
import { Dropdown } from '../../../components/common';
import Modal from '@/components/common/Modal/Modal';

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

export default function FieldTable({ field, setFields }: FieldTableProps) {
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
            value=""
            options={fertilizerOptions}
            onChange={handleChange}
          />
        </Modal>
        <div key={field.Id}>
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Agronomic (lb/ac)</th>
                <th>Crop Removal</th>
              </tr>
            </thead>
            <tbody>
              <td>Crops</td>
            </tbody>
          </table>
        </div>
      </TableWrapper>
    </div>
  );
}
