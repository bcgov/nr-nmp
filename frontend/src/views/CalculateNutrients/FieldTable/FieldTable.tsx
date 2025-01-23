/**
 * @summary The field table on the calculate nutrients page
 */
import { useEffect, useState } from 'react';
import { Table, TableWrapper, InputFieldsContainer, SelectorContainer, ButtonWrapper } from '../CalculateNutrients.styles';
import {InputField, Dropdown, Button} from '../../../components/common';
import Modal from '@/components/common/Modal/Modal';

export default function FieldTable({ key, field, setFields }) {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const fertilizerOptions = [
    { value: 0, label: 'Dry Fertilizer' },
    { value: 1, label: 'Dry Fertilizer (Custom)' },
    { value: 2, label: 'Liquid Fertilizer' },
    { value: 3, label: 'Liquid Fertilizer (Custom)' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFields(field.map((field) => ({ ...field, [name]: value })));
  };

  const handleSubmit = () => {
    setFields({ ...field,});
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
            // value={field.Fertilizer}
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
              {/* {field.Crops.map((crop) => (
                <tr key={crop.id}>
                  <td>{crop.cropId}</td>
                  //agronomic nutrients
                  <td>{crop.reqN}</td>
                  <td>{crop.reqP2o5}</td>
                  <td>{crop.reqK2o}</td>
                  //crop removal nutrients
                  <td>{crop.remN}</td>
                  <td>{crop.remP2o5}</td>
                  <td>{crop.remK2o}</td>
                </tr>
              ))} */}
            </tbody>
          </table>
        </div>
      </TableWrapper>
    </div>
  );
}
