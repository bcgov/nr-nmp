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
import Grid from '@mui/material/Grid';
import type { Key } from 'react-aria-components';
import useAppState from '@/hooks/useAppState';
import NMPFile from '@/types/NMPFile';
import { AppTitle, PageTitle, ProgressStepper } from '../../components/common';
import {
  formCss,
  formGridBreakpoints,
  hideCheckboxGroup,
  showCheckboxGroup,
} from '../../common.styles';
import { StyledContent, subHeader } from './farmInformation.styles';
import { APICacheContext } from '@/context/APICacheContext';
import { ADD_ANIMALS, FIELD_LIST, LANDING_PAGE } from '@/constants/routes';

import { SelectOption } from '../../types';
import YesNoRadioButtons from '@/components/common/YesNoRadioButtons/YesNoRadioButtons';
import DEFAULT_NMPFILE_YEAR from '@/constants/DefaultNMPFileYear';

export default function FarmInformation() {
  const { state, dispatch } = useAppState();
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

  const [isFormInvalid, setIsFormInvalid] = useState<boolean>(false);

  // Initialize year list
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const yearArray = [];

    for (let i = currentYear; i > currentYear - 20; i -= 1) {
      yearArray.push({ id: i.toString(), label: i.toString() });
    }

    return yearArray;
  }, []);

  // Flagging for potential state issues if the state.nmpFile object can change
  useEffect(() => {
    setFormData({
      Year: state.nmpFile.farmDetails.Year || '',
      FarmName: state.nmpFile.farmDetails.FarmName || '',
      FarmRegion: state.nmpFile.farmDetails.FarmRegion || 0,
      FarmSubRegion: state.nmpFile.farmDetails.FarmSubRegion || null,
      FarmAnimals: state.nmpFile.farmDetails.FarmAnimals || [],
      HasVegetables: state.nmpFile.farmDetails.HasVegetables || false,
      HasBerries: state.nmpFile.farmDetails.HasBerries || false,
      HasHorticulturalCrops: state.nmpFile.farmDetails.HasHorticulturalCrops || false,
    });
    setHasAnimals(
      state.nmpFile.farmDetails.FarmAnimals !== undefined &&
        state.nmpFile.farmDetails.FarmAnimals.length > 0,
    );
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
      const regions = (data as { id: number; name: string }[]).map((row) => ({
        id: row?.id.toString(),
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
      const subregions = (data as { id: number; name: string }[]).map((row) => ({
        id: row?.id.toString(),
        label: row.name,
      }));

      setSubregionOptions(subregions as Array<SelectOption>);
    });
  }, [formData.FarmRegion, apiCache]);

  const animalCheckboxes = useMemo(() => {
    if (Object.keys(rawAnimalNames).length === 0) {
      return null;
    }

    const checkboxes = Object.entries(rawAnimalNames).map(([id, name]) => {
      const pluralName = name === 'Horse' ? 'Horses' : name;

      const asTitleCase: string = pluralName
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

      return (
        <Checkbox
          key={asTitleCase}
          value={id}
        >
          I have {pluralName.toLowerCase()}
        </Checkbox>
      );
    });

    return checkboxes;
  }, [rawAnimalNames]);

  const handleInputChange: React.FormEventHandler = useCallback(
    (e: React.ChangeEvent) => {
      const { name, value } = e.target as HTMLInputElement;
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    },
    [setFormData],
  );

  const handleChange = useCallback(
    (name: Key | string, value: boolean | string | number | string[]) => {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    },
    [setFormData],
  );

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // Prevent default browser page refresh.
    e.preventDefault();

    const nmpFile: NMPFile = { ...state.nmpFile };

    // TODO: Investigate bug where hitting back on Add Animals and then next on Farm Information gets rid of the animals
    nmpFile.farmDetails = { ...nmpFile.farmDetails, ...formData };
    const year = { ...DEFAULT_NMPFILE_YEAR, Year: formData.Year };
    // Ideally we only need to deal with one year, add back if Josh says we need to support multiple
    // nmpFile.years.push(year);
    nmpFile.years = [year];
    dispatch({ type: 'OVERWRITE_NMPFILE', newFile: nmpFile });

    if (formData.FarmAnimals.length === 0) {
      dispatch({ type: 'SET_SHOW_ANIMALS_STEP', showAnimalsStep: false });
      navigate(FIELD_LIST);
    } else {
      dispatch({ type: 'SET_SHOW_ANIMALS_STEP', showAnimalsStep: true });
      navigate(ADD_ANIMALS);
    }
  };

  return (
    <StyledContent>
      <ProgressStepper />
      <AppTitle />
      <PageTitle title="Farm Information" />
      <Form
        css={formCss}
        validationBehavior="native"
        onInvalid={() => setIsFormInvalid(true)}
        onSubmit={onSubmit}
      >
        <Grid
          container
          spacing={2}
        >
          <Grid size={formGridBreakpoints}>
            <span
              className={`bcds-react-aria-Select--Label ${isFormInvalid && !formData?.FarmName ? '--error' : ''}`}
            >
              Farm Name
            </span>
            <TextField
              isRequired
              name="FarmName"
              value={formData?.FarmName}
              onInput={handleInputChange}
              id="farmName"
            />
          </Grid>
          <Grid size={formGridBreakpoints}>
            <span
              className={`bcds-react-aria-Select--Label ${isFormInvalid && !formData?.Year ? '--error' : ''}`}
            >
              Year
            </span>

            <Select
              isRequired
              name="Year"
              items={yearOptions}
              selectedKey={formData?.Year}
              onSelectionChange={(e) => handleChange('Year', e)}
            />
          </Grid>
          <Grid size={formGridBreakpoints}>
            <span
              className={`bcds-react-aria-Select--Label ${isFormInvalid && !formData?.FarmRegion ? '--error' : ''}`}
            >
              Region
            </span>

            <Select
              isRequired
              items={regionOptions}
              selectedKey={formData?.FarmRegion}
              onSelectionChange={(e) => handleChange('FarmRegion', e)}
            />
          </Grid>
          <Grid size={formGridBreakpoints}>
            <span
              className={`bcds-react-aria-Select--Label ${isFormInvalid && !formData?.FarmSubRegion ? '--error' : ''}`}
            >
              Subregion
            </span>

            <Select
              isRequired
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
            <YesNoRadioButtons
              value={formData.HasHorticulturalCrops || false}
              text="I have Horticultural crops"
              onChange={(b) => {
                handleChange('HasHorticulturalCrops', b);
              }}
              orientation="horizontal"
            />
            <div css={formData.HasHorticulturalCrops ? showCheckboxGroup : hideCheckboxGroup}>
              <Checkbox
                value="HasVegetables"
                isSelected={formData.HasVegetables}
                onChange={(s) => handleChange('HasVegetables', s)}
              >
                I have vegetables
              </Checkbox>
              <Checkbox
                value="HasBerries"
                isSelected={formData.HasBerries}
                onChange={(s) => handleChange('HasBerries', s)}
              >
                I have berries
              </Checkbox>
            </div>
          </Grid>
          <Grid size={12}>
            <YesNoRadioButtons
              text="I have Livestock"
              value={hasAnimals}
              onChange={(b) => {
                setHasAnimals(b);
                if (!b && animalCheckboxes?.length)
                  setFormData((prevData) => ({
                    ...prevData,
                    FarmAnimals: [],
                  }));
              }}
              orientation="horizontal"
            />
            <CheckboxGroup
              css={
                hasAnimals
                  ? {
                      '> div': [showCheckboxGroup, { gap: '0 !important' }],
                    }
                  : hideCheckboxGroup
              }
              orientation="vertical"
              value={formData.FarmAnimals}
              onChange={(val) => handleChange('FarmAnimals', val)}
            >
              {animalCheckboxes}
            </CheckboxGroup>
          </Grid>
        </Grid>

        <ButtonGroup
          alignment="start"
          ariaLabel="A group of buttons"
          orientation="horizontal"
        >
          <Button
            size="medium"
            aria-label="Back"
            onPress={() => navigate(LANDING_PAGE)}
            variant="secondary"
          >
            BACK
          </Button>
          <Button
            size="medium"
            aria-label="Next"
            variant="primary"
            type="submit"
          >
            Next
          </Button>
        </ButtonGroup>
      </Form>
    </StyledContent>
  );
}
