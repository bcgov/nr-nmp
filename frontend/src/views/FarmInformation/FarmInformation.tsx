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
import InputField from '../../components/common/InputField/InputField';
import RadioButton from '../../components/common/RadioButton/RadioButton';
import Checkbox from '../../components/common/Checkbox/Checkbox';
import Dropdown from '../../components/common/Dropdown/Dropdown';

export default function FarmInformation() {
  const [formData, setFormData] = useState({
    year: '',
    farmName: '',
    crops: '',
    vegetables: false,
    berries: false,
    region: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const regionOptions = [
    { value: '', label: 'Select a region' },
    { value: 'bulkley-nechako', label: 'Bulkley-Nechako' },
    { value: 'cariboo', label: 'Cariboo' },
    { value: 'columbiaShuswap', label: 'Columbia Shuswap' },
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
        <RegionContainer>
          <Dropdown
            label="Region"
            name="region"
            value={formData.region}
            options={regionOptions}
            onChange={handleChange}
            flex="0.35"
          />
        </RegionContainer>
        <SelectorContainer>
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
        </SelectorContainer>
        {formData.crops === 'yes' && (
          <SelectorContainer>
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
          </SelectorContainer>
        )}
      </Card>
    </ViewContainer>
  );
}
