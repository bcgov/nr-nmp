/**
 * @summary The Farm Information page for the application
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppService from '@/services/app/useAppService';
import NMPFile from '@/types/NMPFile';
import defaultNMPFile from '../../constants/DefaultNMPFile';
import RegionOptions from '../../TempData/RegionOptions';
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
  const navigate = useNavigate();
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

  const handleSubmit = () => {
    let nmpFile: NMPFile;

    if (state.nmpFile) nmpFile = JSON.parse(state.nmpFile);
    else nmpFile = defaultNMPFile;

    console.log('nmpFile', nmpFile);
    nmpFile.farmDetails = { ...nmpFile.farmDetails, ...formData };

    setNMPFile(JSON.stringify(nmpFile));
    navigate('/field-and-soil');
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
          options={RegionOptions}
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
          size="sm"
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
