/**
 * @summary The Farm Information page for the application
 */
import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppService from '@/services/app/useAppService';
import NMPFile from '@/types/NMPFile';
import defaultNMPFile from '../../constants/DefaultNMPFile';
import {
  CardHeader,
  Banner,
  Heading,
  InputFieldsContainer,
  SelectorContainer,
  RegionContainer,
  ButtonWrapper,
} from './farmInformation.styles';
import { InputField, Checkbox, Dropdown, Card, Button } from '../../components/common';
import YesNoRadioButtons from '@/components/common/YesNoRadioButtons/YesNoRadioButtons';
import { APICacheContext } from '@/context/APICacheContext';

export default function FarmInformation() {
  const { state, setNMPFile } = useAppService();
  const navigate = useNavigate();
  const apiCache = useContext(APICacheContext);

  const [rawAnimalNames, setRawAnimalNames] = useState<string[]>([]);
  const [regionOptions, setRegionOptions] = useState<{ value: number; label: string }[]>([]);
  const [subregionOptions, setSubregionOptions] = useState<{ value: number; label: string }[]>([]);

  // Initialize non-bool values to prevent errors on first render
  const [formData, setFormData] = useState<{ [name: string]: any }>({
    Year: '',
    FarmName: '',
    FarmRegion: 0,
    FarmSubRegion: null,
  });

  // Flagging for potential issues if the state.nmpFile object can change
  // This would trigger resets and state issues
  useEffect(() => {
    if (state.nmpFile) {
      const data = state.nmpFile;
      if (data) {
        const parsedData = JSON.parse(data);

        setFormData({
          Year: parsedData.farmDetails.Year || '',
          FarmName: parsedData.farmDetails.FarmName || '',
          FarmRegion: parsedData.farmDetails.FarmRegion || 0,
          FarmSubRegion: parsedData.farmDetails.FarmSubRegion || null,
          HasAnimals: parsedData.farmDetails.HasAnimals || false,
          HasDairyCows: parsedData.farmDetails.HasDairyCows || false,
          HasBeefCows: parsedData.farmDetails.HasBeefCows || false,
          HasPoultry: parsedData.farmDetails.HasPoultry || false,
          HasVegetables: parsedData.farmDetails.HasVegetables || false,
          HasBerries: parsedData.farmDetails.HasBerries || false,
          Crops: parsedData.farmDetails.HasHorticulturalCrops.toString() || 'false',
        });
      }
    }
  }, [state.nmpFile]);

  useEffect(() => {
    // No error handling yet as I'm unsure how NMP is supposed to handle errors
    // If an endpoint like this fails, I think we need to display a message like
    // "Oops! It seems like our server is experiencing issues. Please try again later."
    apiCache.callEndpoint('api/animals/').then((response) => {
      if (response.status === 200) {
        const { data } = response;
        const animalArray: string[] = (data as { name: string }[]).map((row) => row.name);
        setRawAnimalNames(animalArray);
      }
    });
    apiCache.callEndpoint('api/regions/').then((response) => {
      const { data } = response;
      const regions: { value: number; label: string }[] = (
        data as { id: number; name: string }[]
      ).map((row) => ({ value: row.id, label: row.name }));
      setRegionOptions(regions);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const region = formData.FarmRegion;
    if (region === 0) {
      setSubregionOptions([]);
      return;
    }
    apiCache.callEndpoint(`api/subregions/${region}/`).then((response) => {
      const { data } = response;
      const subregions: { value: number; label: string }[] = (
        data as { id: number; name: string }[]
      ).map((row) => ({ value: row.id, label: row.name }));
      setSubregionOptions(subregions);
    });
  }, [formData.FarmRegion, apiCache]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value, type, checked } = e.target as HTMLInputElement;
      const setVal = type === 'checkbox' ? checked : value;
      // If the element is a radio button intended to return a boolean, the value must be casted
      if ((setVal === 'true' || setVal === 'false') && name !== 'Crops') {
        // This is the easiest way to convert bool strings to bools in JS
        setFormData({ ...formData, [name]: setVal === 'true' });
      } else {
        setFormData({ ...formData, [name]: setVal });
      }
    },
    [formData, setFormData],
  );

  const handleSubmit = () => {
    let nmpFile: NMPFile;

    if (state.nmpFile) nmpFile = JSON.parse(state.nmpFile);
    else nmpFile = defaultNMPFile;

    nmpFile.farmDetails = { ...nmpFile.farmDetails, ...formData };

    setNMPFile(JSON.stringify(nmpFile));
    navigate('/field-and-soil');
  };

  const animalRadioButtons: React.ReactNode | null = useMemo(() => {
    if (rawAnimalNames.length === 0) {
      return null;
    }
    const processedAnimalNames: string[] = rawAnimalNames.map((animal) => {
      // Dumb processing to deal w/ one non-plural word in table
      const pluralName = animal === 'Horse' ? 'Horses' : animal;
      const asTitleCase: string = pluralName
        .split(' ')
        .map((word) => {
          const titleCase = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
          // Another unfortunate string change to make table string compatible w/ the NMPFile
          return titleCase === 'Cattle' ? 'Cows' : titleCase;
        })
        .join(' ');
      return asTitleCase;
    });
    return (
      <>
        {processedAnimalNames.map((animal) => (
          <YesNoRadioButtons
            key={animal}
            name={animal}
            text={`I have ${animal.toLowerCase()}`}
            handleYes={handleChange}
            handleNo={handleChange}
          />
        ))}
      </>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawAnimalNames, handleChange]);

  return (
    <Card
      height="700px"
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
      <RegionContainer>
        <Dropdown
          label="Subregion"
          name="FarmSubRegion"
          value={formData.FarmSubRegion}
          options={subregionOptions}
          onChange={handleChange}
          flex="0.35"
        />
      </RegionContainer>
      <YesNoRadioButtons
        name="Crops"
        text="I have crops"
        handleYes={handleChange}
        handleNo={handleChange}
      />
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
      <YesNoRadioButtons
        name="HasAnimals"
        text="I have animals"
        handleYes={handleChange}
        handleNo={handleChange}
      />
      {formData.HasAnimals && animalRadioButtons}
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
