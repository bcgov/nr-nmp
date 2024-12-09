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
  SelectorContainer,
  RegionContainer,
} from './farmInformation.styles';
import { InputField, RadioButton, Checkbox, Dropdown } from '../../components/common';

export default function FarmInformation() {
  const [formData, setFormData] = useState({
    Year: '',
    FarmName: '',
    FarmRegion: '',
    Crops: 'false',
    HasVegetables: false,
    HasBerries: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const regionOptions = [
    { value: 0, label: 'Select a region' },
    { value: 1, label: 'Bulkley-Nechako' },
    { value: 2, label: 'Cariboo' },
    { value: 3, label: 'Columbia Shuswap' },
  ];

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
            name="Year"
            value={formData.Year}
            onChange={handleChange}
            flex="0.5"
          />
          <InputField
            label="Farm Name"
            type="text"
            name="FarmName"
            value={formData.FarmName}
            onChange={handleChange}
            flex="1"
          />
        </InputFieldsContainer>
        <RegionContainer>
          <Dropdown
            label="Region"
            name="FarmRegion"
            value={formData.FarmRegion}
            options={regionOptions}
            onChange={handleChange}
            flex="0.35"
          />
        </RegionContainer>
        <SelectorContainer>
          <span style={{ marginRight: '8px' }}>I have crops</span>
          <RadioButton
            label="Yes"
            name="Crops"
            value="true"
            checked={formData.Crops === 'true'}
            onChange={handleChange}
          />
          <RadioButton
            label="No"
            name="Crops"
            value="false"
            checked={formData.Crops === 'false'}
            onChange={handleChange}
          />
        </SelectorContainer>
        {formData.Crops === 'true' && (
          <SelectorContainer>
            <span style={{ marginRight: '8px' }}>Select your crops:</span>
            <Checkbox
              label="Vegetables"
              name="HasVegetables"
              checked={formData.HasVegetables}
              onChange={handleChange}
            />
            <Checkbox
              label="Berries"
              name="HasBerries"
              checked={formData.HasBerries}
              onChange={handleChange}
            />
          </SelectorContainer>
        )}
      </Card>
    </ViewContainer>
  );
}
