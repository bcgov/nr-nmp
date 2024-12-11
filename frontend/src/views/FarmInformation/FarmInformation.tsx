/**
 * @summary The Farm Information page for the application
 */
import React, { useState, useEffect } from 'react';
import { localStorageKeyExists } from '../../utils/AppLocalStorage';
import constants from '../../constants/Constants';
import {
  CardHeader,
  Banner,
  Heading,
  InputFieldsContainer,
  SelectorContainer,
  RegionContainer,
} from './farmInformation.styles';
import { InputField, RadioButton, Checkbox, Dropdown, Card } from '../../components/common';

export default function FarmInformation() {
  const [formData, setFormData] = useState({
    Year: '',
    FarmName: '',
    FarmRegion: 0,
    Crops: 'false',
    HasVegetables: false,
    HasBerries: false,
  });

  useEffect(() => {
    if (localStorageKeyExists(constants.NMP_FILE_KEY)) {
      const data = localStorage.getItem(constants.NMP_FILE_KEY);
      if (data) {
        try {
          const parsedData = JSON.parse(data);
          const secondParsedData = JSON.parse(parsedData);
          setFormData({
            Year: secondParsedData.farmDetails.Year || '',
            FarmName: secondParsedData.farmDetails.FarmName || '',
            FarmRegion: secondParsedData.farmDetails.FarmRegion || 0,
            Crops: secondParsedData.farmDetails.HasHorticulturalCrops.toString() || 'false',
            HasVegetables: secondParsedData.farmDetails.HasVegetables || false,
            HasBerries: secondParsedData.farmDetails.HasBerries || false,
          });
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const regionOptions = [
    { value: 0, label: 'Select a region' },
    { value: 1, label: 'Bulkley-Nechako' },
    { value: 2, label: 'Cariboo' },
    { value: 3, label: 'Columbia Shuswap' },
  ];

  return (
    <Card
      height="500px"
      width="600px"
      justifyContent="flex-start"
    >
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
  );
}
