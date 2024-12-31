/**
 * @summary The Farm Information page for the application
 */
import React, { useState, useEffect } from 'react';
import useAppService from '@/services/app/useAppService';
import NMPFile from '@/types/NMPFile';
import {
  CardHeader,
  Banner,
  Heading,
  InputFieldsContainer,
  SelectorContainer,
  RegionContainer,
  ButtonWrapper,
} from './farmInformation.styles';
import { InputField, RadioButton, Checkbox, Dropdown, Card, Button } from '../../components/common';

export default function FarmInformation() {
  const { state, setNMPFile } = useAppService();
  const [formData, setFormData] = useState({
    Year: '',
    FarmName: '',
    FarmRegion: 0,
    Crops: 'false',
    HasVegetables: false,
    HasBerries: false,
  });

  useEffect(() => {
    if (state.nmpFile) {
      const data = state.nmpFile;
      if (data) {
        const parsedData = JSON.parse(data);
        setFormData({
          Year: parsedData.farmDetails.Year || '',
          FarmName: parsedData.farmDetails.FarmName || '',
          FarmRegion: parsedData.farmDetails.FarmRegion || 0,
          Crops: parsedData.farmDetails.HasHorticulturalCrops.toString() || 'false',
          HasVegetables: parsedData.farmDetails.HasVegetables || false,
          HasBerries: parsedData.farmDetails.HasBerries || false,
        });
      }
    }
  }, [state.nmpFile]);

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

  const handleSubmit = () => {
    const data = state.nmpFile;
    let nmpFile: NMPFile;
    if (data) {
      try {
        nmpFile = JSON.parse(data);

        if (!nmpFile.farmDetails) {
          nmpFile.farmDetails = {};
        }
        nmpFile.farmDetails.Year = formData.Year;
        nmpFile.farmDetails.FarmName = formData.FarmName;
        nmpFile.farmDetails.FarmRegion = formData.FarmRegion;
        nmpFile.farmDetails.HasHorticulturalCrops = formData.Crops === 'true';
        nmpFile.farmDetails.HasVegetables = formData.HasVegetables;
        nmpFile.farmDetails.HasBerries = formData.HasBerries;
      } catch (error) {
        console.error('Failed to parse JSON data:', error);
        return;
      }
    } else {
      nmpFile = { farmDetails: {} };
      nmpFile.farmDetails = {
        Year: formData.Year,
        FarmName: formData.FarmName,
        FarmRegion: formData.FarmRegion,
        HasHorticulturalCrops: formData.Crops === 'true',
        HasVegetables: formData.HasVegetables,
        HasBerries: formData.HasBerries,
      };
    }

    setNMPFile(JSON.stringify(nmpFile));
  };

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
      <ButtonWrapper>
        <Button
          text="Next"
          size="lg"
          handleClick={() => {
            handleSubmit();
          }}
          aria-label="Next"
          variant="primary"
          disabled={false}
        />
      </ButtonWrapper>
    </Card>
  );
}
