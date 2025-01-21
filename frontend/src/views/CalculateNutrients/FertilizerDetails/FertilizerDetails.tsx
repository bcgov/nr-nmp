/**
 * @summary The field table on the calculate nutrients page
 */
import { useState } from 'react';
import { Dropdown } from '../../../components/common';
import fertilizerDetailsType from '@/types/fertilizerDetailsType';

export default function FertilizerDetails({ key, field, setFields }) {
  const [fertilizerForm, setFertilizerForm] = useState<fertilizerDetailsType>([]);
  const fertilizerOptions = [
    { value: 0, label: 'Dry Fertilizer' },
    { value: 1, label: 'Dry Fertilizer (Custom)' },
    { value: 2, label: 'Liquid Fertilizer' },
    { value: 3, label: 'Liquid Fertilizer (Custom)' },
  ];

  const handleChange = () => {
    console.log(fertilizerForm);
  };

  return (
    <div>
      <form>
        <Dropdown
          label="Fertilizer Type"
          name="Fertilizer Type"
          value={fertilizerForm.fertilizerType}
          options={fertilizerOptions}
          onChange={handleChange}
        />
        {fertilizerForm.fertilizerType === 0 && (
          <Dropdown
            label="Fertilizer"
            name="Fertilizer"
            value={fertilizerForm.fertilizerName}
            options={solidFertilizerOptions}
            onChange={handleChange}
          />
        )}
      </form>
    </div>
  );
}
