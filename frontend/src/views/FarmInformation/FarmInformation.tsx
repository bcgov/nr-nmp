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
} from './farmInformation.styles';
import InputField from '../../components/common/InputField/InputField';

export default function FarmInformation() {
  const [formData, setFormData] = useState({ year: '', farmName: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
            flex="1"
          />
          <InputField
            label="Farm Name"
            type="text"
            name="farmName"
            value={formData.farmName}
            onChange={handleChange}
            flex="2"
          />
        </InputFieldsContainer>
      </Card>
    </ViewContainer>
  );
}
