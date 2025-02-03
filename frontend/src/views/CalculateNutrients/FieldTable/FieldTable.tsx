/**
 * @summary The field table on the calculate nutrients page
 */
import { useEffect, useState } from 'react';
import { Table, TableWrapper, InputFieldsContainer, SelectorContainer, ButtonWrapper } from '../CalculateNutrients.styles';
import {InputField, Dropdown, Button} from '../../../components/common';
import Modal from '@/components/common/Modal/Modal';
import FertilizerDetails from '../FertilizerDetails/FertilizerDetails';

export default function FieldTable({ key, field, setFields }) {
  const [isModalVisible, setIsModalVisible] = useState(false);

  // const handleSubmit = () => {
  //   setFields({ ...field });
  //   setIsModalVisible(false);
  // };

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
        >
          <FertilizerDetails
            key={field.Id}
            field={field}
            setFields={setFields}
          />
        </Modal>
        {/* display fields.crops as a table */}
        <div key={key}>
          <table>
            <thead>
              <tr>
                <th />
                <th>Agronomic (lb/ac)</th>
                <th>Crop Removal</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Crops</th>
                {field.Crops.map((crop) => (
                  <tr key={crop.id}>
                    <td>{crop.cropId}</td>
                    <td>agronomic nutrients</td>
                    <td>{crop.reqN}</td>
                    <td>{crop.reqP2o5}</td>
                    <td>{crop.reqK2o}</td>
                    <td>crop removal nutrients</td>
                    <td>{crop.remN}</td>
                    <td>{crop.remP2o5}</td>
                    <td>{crop.remK2o}</td>
                  </tr>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </TableWrapper>
    </div>
  );
}
