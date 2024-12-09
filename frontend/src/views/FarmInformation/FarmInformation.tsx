/**
 * @summary The Farm Information page for the application
 */
import React, { useState } from 'react';
import {
  ViewContainer,
  Card,
  CardHeader,
  Banner,
  Heading,
  InputFieldsContainer,
  RadioButtonsContainer,
} from './farmInformation.styles';
import InputField from '../../components/common/InputField/InputField';
import RadioButton from '../../components/common/RadioButton/RadioButton';
import Checkbox from '../../components/common/Checkbox/Checkbox';

export default function FarmInformation() {
  const [formData, setFormData] = useState({
    year: '',
    farmName: '',
    crops: '',
    vegetables: false,
    berries: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  return (
    <ViewContainer>
      <Card>
        <CardHeader>
          <Banner>
            <Heading>Farm Information</Heading>
          </Banner>
        </CardHeader>
        <InputFieldsContainer>
          <InputField
            label="Year"
            type="text"
            name="year"
            value={formData.year}
            onChange={handleChange}
            flex="0.5"
          />
          <InputField
            label="Farm Name"
            type="text"
            name="farmName"
            value={formData.farmName}
            onChange={handleChange}
            flex="1"
          />
        </InputFieldsContainer>
        <RadioButtonsContainer>
          <span style={{ marginRight: '8px' }}>I have crops</span>
          <RadioButton
            label="Yes"
            name="crops"
            value="yes"
            checked={formData.crops === 'yes'}
            onChange={handleChange}
          />
          <RadioButton
            label="No"
            name="crops"
            value="no"
            checked={formData.crops === 'no'}
            onChange={handleChange}
          />
        </RadioButtonsContainer>
        {formData.crops === 'yes' && (
          <RadioButtonsContainer>
            <span style={{ marginRight: '8px' }}>Select your crops:</span>
            <Checkbox
              label="Vegetables"
              name="vegetables"
              checked={formData.vegetables}
              onChange={handleChange}
            />
            <Checkbox
              label="Berries"
              name="berries"
              checked={formData.berries}
              onChange={handleChange}
            />
          </RadioButtonsContainer>
        )}
      </Card>
    </ViewContainer>
  );
}
