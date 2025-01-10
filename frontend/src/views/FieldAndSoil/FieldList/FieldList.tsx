/**
 * @summary This is the Field list Tab
 */
import { useState } from 'react';
import { Dropdown, InputField } from '../../../components/common';
import Modal from '@/components/common/Modal/Modal';
import { ListItemContainer } from './fieldList.styles';

interface Field {
  FieldName: string;
  Area: string;
  PreviousYearManureApplicationFrequency: string;
  Comment: string;
  SoilTest: object;
  Crops: object[];
}

interface FieldListProps {
  fields: Field[];
  setFields: (fields: Field[]) => void;
}

export default function FieldList({ fields, setFields }: FieldListProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [fieldformData, setFieldFormData] = useState({
    FieldName: '',
    Area: '',
    PreviousYearManureApplicationFrequency: '0',
    Comment: '',
    SoilTest: {},
    Crops: [{}],
  });

  const handleChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setFieldFormData({ ...fieldformData, [name]: value });
  };

  const handleEdit = (index: number) => {
    setFieldFormData(fields[index]);
    setEditIndex(index);
    setIsModalVisible(true);
  };

  const handleDelete = (index: number) => {
    const updatedFields = fields.filter((_, i) => i !== index);
    setFields(updatedFields);
  };

  const handleSubmit = () => {
    if (editIndex !== null) {
      const updatedFields = fields.map((field, index) =>
        index === editIndex ? fieldformData : field,
      );
      setFields(updatedFields);
      setEditIndex(null);
    } else {
      setFields([...fields, fieldformData]);
    }
    setFieldFormData({
      FieldName: '',
      Area: '',
      PreviousYearManureApplicationFrequency: '0',
      Comment: '',
      SoilTest: {},
      Crops: [{}],
    });
    setIsModalVisible(false);
  };

  const manureOptions = [
    { value: 0, label: 'Select' },
    { value: 1, label: 'No Manure in the last 2 years' },
    { value: 2, label: 'Manure applied in 1 of the 2 years ' },
    { value: 3, label: 'Manure applied in each of the 2 years ' },
  ];

  return (
    <div>
      {fields.map((field, index) => (
        <ListItemContainer key={field.FieldName}>
          <p>Field Name: {field.FieldName}</p>
          <p>Area: {field.Area}</p>
          <p>Comment: {field.Comment}</p>
          <button
            type="button"
            onClick={() => handleEdit(index)}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => handleDelete(index)}
          >
            Delete
          </button>
        </ListItemContainer>
      ))}
      <button
        type="button"
        onClick={() => setIsModalVisible(true)}
      >
        Add Field
      </button>
      <Modal
        isVisible={isModalVisible}
        title={editIndex !== null ? 'Edit Field' : 'Add Field'}
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
        <InputField
          label="Field Name"
          type="text"
          name="FieldName"
          value={fieldformData.FieldName}
          onChange={handleChange}
        />
        <InputField
          label="Area"
          type="text"
          name="Area"
          value={fieldformData.Area.toString()}
          onChange={handleChange}
        />
        <Dropdown
          label="Manure application in previous years"
          name="PreviousYearManureApplicationFrequency"
          value={fieldformData.PreviousYearManureApplicationFrequency}
          options={manureOptions}
          onChange={handleChange}
        />
        <InputField
          label="Comment"
          type="text"
          name="Comment"
          value={fieldformData.Comment}
          onChange={handleChange}
        />
      </Modal>
    </div>
  );
}
