/**
 * @summary The Farm Information page for the application
 */
import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  ButtonGroup,
  Checkbox,
  CheckboxGroup,
  Form,
  Select,
  TextField,
} from '@bcgov/design-system-react-components';
import Grid from '@mui/material/Grid2';
import type { Key } from 'react-aria-components';
import useAppService from '@/services/app/useAppService';
import NMPFile from '@/types/NMPFile';
import { AppTitle, PageTitle, ProgressStepper } from '../../components/common';
import defaultNMPFile from '../../constants/DefaultNMPFile';
import { formCss, hideCheckboxGroup, showCheckboxGroup } from '../../common.styles';
import { StyledContent, subHeader } from './farmInformation.styles';
import { APICacheContext } from '@/context/APICacheContext';
import blankNMPFileYearData from '@/constants/BlankNMPFileYearData';
import {
  ANIMALS_MANURE,
  FARM_INFORMATION,
  FIELD_SOIL,
  LANDING_PAGE,
} from '@/constants/RouteConstants';

import { SelectOption } from '../../types';

export default function FarmInformation() {
  const { state, setNMPFile, setProgressStep, setShowAnimalsStep } = useAppService();
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

  // Initialize year list
  const [yearOptions, setYearOptions] = useState<Array<SelectOption>>([]);

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const yearArray = [];

    for (let i = currentYear; i > currentYear - 20; i -= 1) {
      yearArray.push({ id: i.toString(), label: i.toString() });
    }

    setYearOptions(yearArray);
  }, []);

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
          Crops: parsedData.farmDetails.HasHorticulturalCrops.toString() || false,
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

  const checkBoxList = useMemo(() => {
    if (Object.keys(rawAnimalNames).length === 0) {
      return null;
    }

    const checkBox = Object.entries(rawAnimalNames).map(([id, name]) => {
      const pluralName = name === 'Horse' ? 'Horses' : name;

      const asTitleCase: string = pluralName
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

      return {
        asTitleCase,
        id,
        name,
      };
    });

    return checkBox;
  }, [rawAnimalNames]);

  const handleAnimalChange = useCallback(
    (value: boolean, animal: string) => {
      setFormData((prevData) => {
        const currentAnimals: string[] = prevData.FarmAnimals;
        let nextAnimals: string[];
        if (value) {
          nextAnimals =
            currentAnimals.indexOf(animal) === -1
              ? currentAnimals.concat([animal])
              : currentAnimals;
        } else {
          nextAnimals = currentAnimals.filter((val) => val !== animal);
        }
        return { ...prevData, FarmAnimals: nextAnimals };
      });
    },
    [setFormData],
  );

  const handleInputChange: React.FormEventHandler = useCallback(
    (e: React.ChangeEvent) => {
      const { name, value } = e.target as HTMLInputElement;
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    },
    [setFormData],
  );

  const handleChange = useCallback(
    (name: Key | string, value: boolean | string | number) => {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    },
    [setFormData],
  );

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // Prevent default browser page refresh.
    e.preventDefault();

    let nmpFile: NMPFile;

    if (state.nmpFile) nmpFile = JSON.parse(state.nmpFile);
    else nmpFile = { ...defaultNMPFile };

    formData.FarmAnimals = formData.FarmAnimals.sort();
    nmpFile.farmDetails = { ...nmpFile.farmDetails, ...formData };
    const year = { ...blankNMPFileYearData, Year: formData.Year };
    nmpFile.years.push(year);
    setNMPFile(JSON.stringify(nmpFile));

    if (formData.FarmAnimals.length === 0) {
      setShowAnimalsStep(false);
      navigate(FIELD_SOIL);
    } else {
      setShowAnimalsStep(true);
      navigate(ANIMALS_MANURE);
    }
  };

  return (
    <StyledContent>
      <ProgressStepper step={FARM_INFORMATION} />
      <AppTitle />
      <PageTitle title="Farm Information" />
      <Form
        css={formCss}
        validationBehavior="native"
        onSubmit={onSubmit}
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
              value={formData?.FarmName}
              onInput={handleInputChange}
            />
          </Grid>
          <Grid size={6}>
            <Select
              isRequired
              label="Year"
              name="Year"
              items={yearOptions}
              selectedKey={formData?.Year}
              onSelectionChange={(e) => handleChange('Year', e)}
            />
          </Grid>
          <Grid size={6}>
            <Select
              isRequired
              label="Region"
              items={regionOptions}
              selectedKey={formData?.FarmRegion}
              onSelectionChange={(e) => handleChange('FarmRegion', e)}
            />
          </Grid>
          <Grid size={6}>
            <Select
              isRequired
              label="Subregion"
              items={subregionOptions}
              selectedKey={formData?.FarmSubRegion}
              onSelectionChange={(e) => handleChange('FarmSubRegion', e)}
              isDisabled={!(subregionOptions && subregionOptions.length)}
            />
          </Grid>
          <div css={subHeader}>
            Select all agriculture that occupy your farm (check all that apply)
          </div>
          <Grid size={12}>
            <Checkbox
              isSelected={formData?.Crops}
              onChange={(e) => {
                handleChange('Crops', e);
                if (!e) {
                  handleChange('HasVegetables', false);
                  handleChange('HasBerries', false);
                }
              }}
              value="Crops"
            >
              I have Horticultural crops
            </Checkbox>
            <div css={formData.Crops ? showCheckboxGroup : hideCheckboxGroup}>
              <CheckboxGroup label="Select your crops:">
                <Checkbox
                  value="HasVegetables"
                  isSelected={formData.HasVegetables}
                  onChange={(s) => handleChange('HasVegetables', s)}
                >
                  Vegetables
                </Checkbox>
                <Checkbox
                  value="HasBerries"
                  isSelected={formData.HasBerries}
                  onChange={(s) => handleChange('HasBerries', s)}
                >
                  Berries
                </Checkbox>
              </CheckboxGroup>
            </div>
          </Grid>
          <Grid size={12}>
            <Checkbox
              isSelected={hasAnimals}
              onChange={(e: boolean) => {
                setHasAnimals(e);
                if (!e && checkBoxList.length)
                  setFormData((prevData) => ({
                    ...prevData,
                    FarmAnimals: [],
                  }));
              }}
              value="HasAnimals"
            >
              I have Livestock
            </Checkbox>
          </Grid>
          <Grid size={12}>
            <Checkbox
              isSelected={hasAnimals}
              onChange={(e: boolean) => {
                setHasAnimals(e);
                if (!e && checkBoxList?.length)
                  setFormData((prevData) => ({
                    ...prevData,
                    FarmAnimals: [],
                  }));
              }}
              value="HasAnimals"
            >
              I have Livestock
            </Checkbox>
            <div css={hasAnimals ? showCheckboxGroup : hideCheckboxGroup}>
              {checkBoxList?.map((ele) => (
                <Checkbox
                  key={ele.asTitleCase}
                  isSelected={formData?.FarmAnimals.includes(`${ele.id}`)}
                  name={ele.id}
                  value={ele.asTitleCase}
                  onChange={(e) => handleAnimalChange(e, `${ele.id}`)}
                >{`I have ${ele?.name.toLowerCase()}`}</Checkbox>
              ))}
            </div>
          </Grid>
        </Grid>

        <ButtonGroup
          alignment="start"
          ariaLabel="A group of buttons"
          orientation="horizontal"
        >
          <Button
            size="medium"
            aria-label="Next"
            variant="primary"
            type="submit"
          >
            Next
          </Button>
          <Button
            size="medium"
            aria-label="Back"
            onPress={() => navigate(LANDING_PAGE)}
            variant="secondary"
          >
            BACK
          </Button>
        </ButtonGroup>
      </Form>
    </StyledContent>
  );
}
