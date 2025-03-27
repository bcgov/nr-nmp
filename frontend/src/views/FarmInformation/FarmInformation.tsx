/**
 * @summary The Farm Information page for the application
 */
import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Checkbox,
  CheckboxGroup,
  Form,
  Select,
  TextField,
} from '@bcgov/design-system-react-components';
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import Grid from '@mui/material/Grid2';
import type { Key } from 'react-aria-components';

import useAppService from '@/services/app/useAppService';
import NMPFile from '@/types/NMPFile';
import { AppTitle, PageTitle, ProgressStepper } from '../../components/common';
import defaultNMPFile from '../../constants/DefaultNMPFile';
import { StyledContent } from './farmInformation.styles';
// import { InputField, Checkbox, Dropdown, Card, Button } from '../../components/common';
import YesNoRadioButtons from '@/components/common/YesNoRadioButtons/YesNoRadioButtons';
import { APICacheContext } from '@/context/APICacheContext';
import blankNMPFileYearData from '@/constants/BlankNMPFileYearData';
import { FARM_INFORMATION } from '@/constants/RouteConstants';

import { SelectOption } from '../../types';

const formCss = css({
  marginTop: '1rem',
  width: '100%',

  '.bcds-react-aria-TextField': {
    width: '100%',
  },

  '.bcds-react-aria-Select': {
    Button: {
      width: '100%',
    },
  },
});

export default function FarmInformation() {
  const { state, setNMPFile, setProgressStep } = useAppService();
  const navigate = useNavigate();
  const apiCache = useContext(APICacheContext);

  // Initialize non-bool values to prevent errors on first render
  const [formData, setFormData] = useState<{ [name: string]: any }>({
    Year: '',
    FarmName: '',
    FarmRegion: 0,
    FarmSubRegion: null,
    FarmAnimals: [],
  });

  // Props for animal selections
  const [hasAnimals, setHasAnimals] = useState<boolean>(false);
  const [rawAnimalNames, setRawAnimalNames] = useState<{ [id: string]: string }>({});

  // Props for region selections
  const [regionOptions, setRegionOptions] = useState<Array<SelectOption>>([]);
  const [subregionOptions, setSubregionOptions] = useState<Array<SelectOption>>([]);

  useEffect(() => {
    setProgressStep(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Flagging for potential state issues if the state.nmpFile object can change
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
          FarmAnimals: parsedData.farmDetails.FarmAnimals || [],
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
        const animalDict: { [id: string]: string } = (data as { id: number; name: string }[])
          // Temp, remove non-cattle as an option
          .filter((opt) => opt.id === 1 || opt.id === 2)
          .reduce(
            (dict, row) => {
              // eslint-disable-next-line no-param-reassign
              dict[row.id] = row.name;
              return dict;
            },
            {} as { [id: string]: string },
          );
        setRawAnimalNames(animalDict);
        console.log('rawAnimalNames', Object.entries(animalDict));
      }
    });

    apiCache.callEndpoint('api/regions/').then((response) => {
      const { data } = response;
      const regions = (data as { id: string; name: string }[]).map((row) => ({
        id: row.id,
        label: row.name,
      }));
      setRegionOptions(regions as Array<SelectOption>);
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
      const subregions = (data as { id: string; name: string }[]).map((row) => ({
        id: row.id,
        label: row.name,
      }));

      setSubregionOptions(subregions as Array<SelectOption>);
    });
  }, [formData.FarmRegion, apiCache]);

  const handleChange: React.FormEventHandler = useCallback(
    (e: React.ChangeEvent) => {
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

  const handleCheckBoxChange = (value: boolean, name: string) => {
    console.log('hand', { ...formData, [name]: value });
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = useCallback(
    (value: Key, name: string) => {
      setFormData({ ...formData, [name]: value });
    },
    [formData, setFormData],
  );

  // const handleAnimalChange = useCallback(
  //   (e: React.ChangeEvent<HTMLInputElement>) => {
  //     const { name, value } = e.target as HTMLInputElement;
  //     setFormData((prevData) => {
  //       const currentAnimals: string[] = prevData.FarmAnimals;
  //       let nextAnimals: string[];
  //       if (value === 'true') {
  //         // eslint-disable-next-line prettier/prettier
  //         nextAnimals =
  //           currentAnimals.indexOf(name) === -1 ? currentAnimals.concat([name]) : currentAnimals;
  //       } else {
  //         nextAnimals = currentAnimals.filter((val) => val !== name);
  //       }
  //       return { ...prevData, FarmAnimals: nextAnimals };
  //     });
  //   },
  //   [setFormData],
  // );

  const handleSubmit = () => {
    let nmpFile: NMPFile;

    if (state.nmpFile) nmpFile = JSON.parse(state.nmpFile);
    else nmpFile = { ...defaultNMPFile };

    formData.FarmAnimals = formData.FarmAnimals.sort();
    nmpFile.farmDetails = { ...nmpFile.farmDetails, ...formData };
    const year = { ...blankNMPFileYearData, Year: formData.Year };
    nmpFile.years.push(year);
    setNMPFile(JSON.stringify(nmpFile));

    if (formData.FarmAnimals.length === 0) {
      navigate('/field-and-soil');
    } else {
      navigate('/animals-and-manure');
    }
  };

  // const animalRadioButtons: React.ReactNode | null = useMemo(() => {
  //   if (Object.keys(rawAnimalNames).length === 0) {
  //     return null;
  //   }

  //   const radioButtons = Object.entries(rawAnimalNames).map(([id, name]) => {
  //     const pluralName = name === 'Horse' ? 'Horses' : name;
  //     const asTitleCase: string = pluralName
  //       .split(' ')
  //       .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
  //       .join(' ');

  //     return (
  //       <YesNoRadioButtons
  //         key={asTitleCase}
  //         name={id}
  //         text={`I have ${pluralName.toLowerCase()}`}
  //         handleYes={handleAnimalChange}
  //         handleNo={handleAnimalChange}
  //       />
  //     );
  //   });

  //   return radioButtons;
  // }, [rawAnimalNames, handleAnimalChange]);

  const checkBoxList = useMemo(() => {
    const checkBox = Object.entries(rawAnimalNames).map(([id, name]) => {
      const splitName = name.split(' ');
      const joinedName = splitName.join('');
      console.log('joined', joinedName);
      return (
        <Checkbox
          key={joinedName}
          name={id}
          value={`Has${joinedName}`}
          onChange={(e) => setFormData((prevData) => ({ ...prevData, [`Has${joinedName}`]: e }))}
        >{`I have ${name.toLowerCase()}`}</Checkbox>
      );
    });

    return checkBox;
  }, [rawAnimalNames, setFormData]);

  // const animalCheckBoxes: React.ReactNode | null = useMemo(() => {
  //   // ToDO: wrap in useMemo later
  //   if (Object.keys(rawAnimalNames).length === 0) {
  //     return null;
  //   }

  //   const radioButtons = Object.entries(rawAnimalNames).map(([id, name]) => {
  //     const pluralName = name === 'Horse' ? 'Horses' : name;
  //     const asTitleCase: string = pluralName
  //       .split(' ')
  //       .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
  //       .join(' ');

  //     const formVal = `Has${asTitleCase}`;
  //     console.log('formVal', formVal);
  //     return (
  //       <Checkbox
  //         key={asTitleCase}
  //         name={id}
  //         onChange={(e) =>
  //           setFormData((prevData) => ({ ...prevData, [formVal]: !!prevData[formVal] }))
  //         }
  //       >{`I have ${pluralName.toLowerCase()}`}</Checkbox>
  //     );
  //   });

  //   return radioButtons;
  // }, [rawAnimalNames, formData]);

  return (
    <StyledContent>
      <ProgressStepper step={FARM_INFORMATION} />
      <AppTitle />
      <PageTitle title="Farm Information" />
      <Form
        css={formCss}
        validationBehavior="native"
      >
        <Grid
          container
          spacing={2}
        >
          <Grid size={6}>
            <TextField
              isRequired
              label="Name"
              name="FarmName"
              onInput={handleChange}
            />
          </Grid>
          <Grid size={6}>
            <TextField
              isRequired
              label="Year"
              name="FarmNYearame"
              onInput={handleChange}
            />
          </Grid>
          <Grid size={6}>
            <Select
              isRequired
              label="Region"
              items={regionOptions}
              onSelectionChange={(e) => handleSelectChange(e, 'FarmRegion')}
            />
          </Grid>
          <Grid size={6}>
            <Select
              isRequired
              label="Subregion"
              items={subregionOptions}
              onSelectionChange={(e) => handleSelectChange(e, 'FarmSubRegion')}
              isDisabled={!(subregionOptions && subregionOptions.length)}
            />
          </Grid>
          <div>Select all agriculture that occupy your farm (check all that apply)</div>
          <Grid size={12}>
            <Checkbox
              value="Crops"
              onChange={(e) => handleCheckBoxChange(e, 'Crops')}
            >
              I have Horticultural crops
            </Checkbox>
            {formData.Crops && (
              <CheckboxGroup
                orientation="vertical"
                style={{ marginLeft: '2rem', marginTop: '1rem' }}
              >
                <Checkbox
                  value="HasVegetables"
                  onChange={(e) => handleCheckBoxChange(e, 'HasVegetables')}
                >
                  Vegetables
                </Checkbox>
                <Checkbox
                  value="HasBerries"
                  onChange={(e) => handleCheckBoxChange(e, 'HasBerries')}
                >
                  Berries
                </Checkbox>
              </CheckboxGroup>
            )}
          </Grid>
          <Grid size={12}>
            <Checkbox
              value="HasAnimals"
              onChange={() => setHasAnimals(true)}
            >
              I have Livestock
            </Checkbox>
            <CheckboxGroup
              orientation="vertical"
              style={{ marginLeft: '2rem', marginTop: '1rem' }}
            >
              {hasAnimals && checkBoxList}
            </CheckboxGroup>
          </Grid>
        </Grid>
      </Form>
      <div>What: {JSON.stringify(formData)}</div>
    </StyledContent>
    // <Card
    //   height="700px"
    //   width="600px"
    //   justifyContent="flex-start"
    // >
    //   <CardHeader>
    //     <Banner>
    //       <Heading>Farm Information</Heading>
    //     </Banner>
    //   </CardHeader>
    //   <InputFieldsContainer>
    //     <InputField
    //       label="Year"
    //       type="text"
    //       name="Year"
    //       value={formData.Year}
    //       onChange={handleChange}
    //       flex="0.5"
    //     />
    //     <InputField
    //       label="Farm Name"
    //       type="text"
    //       name="FarmName"
    //       value={formData.FarmName}
    //       onChange={handleChange}
    //       flex="1"
    //     />
    //   </InputFieldsContainer>
    //   <RegionContainer>
    //     <Dropdown
    //       label="Region"
    //       name="FarmRegion"
    //       value={formData.FarmRegion}
    //       options={regionOptions}
    //       onChange={handleChange}
    //     />
    //     <Dropdown
    //       label="Subregion"
    //       name="FarmSubRegion"
    //       value={formData.FarmSubRegion}
    //       options={subregionOptions}
    //       onChange={handleChange}
    //     />
    //   </RegionContainer>
    //   <YesNoRadioButtons
    //     name="Crops"
    //     text="I have crops"
    //     handleYes={handleChange}
    //     handleNo={handleChange}
    //   />
    //   {formData.Crops === 'true' && (
    //     <SelectorContainer>
    //       <span style={{ marginRight: '8px' }}>Select your crops:</span>
    //       <Checkbox
    //         label="Vegetables"
    //         name="HasVegetables"
    //         checked={formData.HasVegetables}
    //         onChange={handleChange}
    //       />
    //       <Checkbox
    //         label="Berries"
    //         name="HasBerries"
    //         checked={formData.HasBerries}
    //         onChange={handleChange}
    //       />
    //     </SelectorContainer>
    //   )}
    //   <YesNoRadioButtons
    //     name=""
    //     text="I have animals"
    //     handleYes={() => setHasAnimals(true)}
    //     handleNo={() => setHasAnimals(false)}
    //   />
    //   {hasAnimals && animalRadioButtons}
    //   <ButtonWrapper>
    //     <Button
    //       text="Next"
    //       size="sm"
    //       handleClick={() => {
    //         handleSubmit();
    //       }}
    //       aria-label="Next"
    //       variant="primary"
    //       disabled={false}
    //     />
    //   </ButtonWrapper>
    // </Card>
  );
}
