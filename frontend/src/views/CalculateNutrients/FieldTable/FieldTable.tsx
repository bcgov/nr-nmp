/**
 * @summary The field table on the calculate nutrients page displays crops in the selected field
 */
import { useEffect, useState } from 'react';
import { TableWrapper } from '../CalculateNutrients.styles';
import Modal from '@/components/common/Modal/Modal';
import FertilizerDetails from '../FertilizerDetails/FertilizerDetails';

export default function FieldTable({ field, setFields }) {
  const [isModalVisible, setIsModalVisible] = useState(false);

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
        >
          <FertilizerDetails
            key={field.Id}
            field={field}
            setFields={setFields}
            isModalVisible={isModalVisible}
            setIsModalVisible={setIsModalVisible}
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
