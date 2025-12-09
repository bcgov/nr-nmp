/**
 * @summary The Farm Information page for the application
 */
import React, { useState, useEffect, useContext, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Checkbox,
  CheckboxGroup,
  // This is the one file where Form needs to be imported from the BC DS
  // instead of the common components folder
  Form,
} from '@bcgov/design-system-react-components';
import Grid from '@mui/material/Grid';
import useAppState from '@/hooks/useAppState';
import { AlertDialog, Select, TextField, View, YesNoRadioButtons } from '@/components/common';
import {
  formCss,
  formGridBreakpoints,
  hideCheckboxGroup,
  showCheckboxGroup,
} from '@/common.styles';
import Subheader from './farmInformation.styles';
import { APICacheContext } from '@/context/APICacheContext';
import { ADD_ANIMALS, FIELD_LIST, LANDING_PAGE } from '@/constants/routes';
import { NMPFileFarmDetails, Region, SelectOption, Subregion } from '@/types';

export default function FarmInformation() {
  const { state, dispatch } = useAppState();
  const navigate = useNavigate();
  const apiCache = useContext(APICacheContext);
  const formRef = useRef<null | HTMLFormElement>(null);

  const [formData, setFormData] = useState<NMPFileFarmDetails>({ ...state.nmpFile.farmDetails });

  // Props for animal selections
  const [rawAnimalNames, setRawAnimalNames] = useState<{ [id: string]: string }>({});

  // Props for region selections
  const [regionOptions, setRegionOptions] = useState<SelectOption<Region>[]>([]);
  const [subregionOptions, setSubregionOptions] = useState<SelectOption<Subregion>[]>([]);

  // Initialize year list up to current year + 1
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear() + 1;
    const yearArray = [];

    for (let i = currentYear; i > currentYear - 10; i -= 1) {
      yearArray.push({ id: i.toString(), label: i.toString() });
    }

    return yearArray;
  }, []);

  const [showWarningDialog, setShowWarningDialog] = useState<boolean>(false);

  useEffect(() => {
    // No error handling yet as I'm unsure how NMP is supposed to handle errors
    // If an endpoint like this fails, I think we need to display a message like
    // "Oops! It seems like our server is experiencing issues. Please try again later."
    apiCache.callEndpoint('api/animals/').then((response) => {
      if (response.status === 200) {
        const { data } = response;
        const animalDict: { [id: string]: string } = (
          data as { id: number; name: string }[]
        ).reduce(
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
      const regions: SelectOption<Region>[] = (data as Region[]).map((row) => ({
        id: row.id,
        label: row.name,
        value: row,
      }));
      setRegionOptions(regions);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const region = formData.farmRegion;
    if (region === 0) {
      setSubregionOptions([]);
      return;
    }
    apiCache.callEndpoint(`api/subregions/${region}/`).then((response) => {
      const { data } = response;
      const subregions: SelectOption<Subregion>[] = (data as Subregion[]).map((row) => ({
        id: row.id,
        label: row.name,
        value: row,
      }));

      setSubregionOptions(subregions);
    });
  }, [formData.farmRegion, apiCache]);

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
    (changes: Partial<NMPFileFarmDetails>) => {
      setFormData((prevData) => ({ ...prevData, ...changes }));
    },
    [setFormData],
  );

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // Prevent default browser page refresh.
    e.preventDefault();
    dispatch({ type: 'SAVE_FARM_DETAILS', newFarmDetails: formData });

    if (!formData.hasAnimals) {
      dispatch({ type: 'SET_SHOW_ANIMALS_STEP', showAnimalsStep: false });
      navigate(FIELD_LIST);
    } else {
      dispatch({ type: 'SET_SHOW_ANIMALS_STEP', showAnimalsStep: true });
      navigate(ADD_ANIMALS);
    }
  };

  const handlePreviousPage = () => {
    if (formData.farmName) {
      setShowWarningDialog(true);
    } else {
      navigate(LANDING_PAGE);
    }
  };

  async function downloadBlob() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(state.nmpFile)], { type: 'application/json' }),
    );
    const a = document.createElement('a');
    a.href = url;

    const prependDate = new Date().toLocaleDateString('sv-SE', { dateStyle: 'short' });
    const farmName = formData?.farmName;

    a.download = `${prependDate}-${farmName}.nmp`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <View
      title="Farm Information"
      handleBack={handlePreviousPage}
      // Trigger submit event to use <Form>'s validation
      handleNext={() => formRef.current?.requestSubmit()}
    >
      <AlertDialog
        isOpen={showWarningDialog}
        title="Warning - Unsaved data"
        onOpenChange={() => setShowWarningDialog(false)}
        continueBtn={{ handleClick: () => navigate(LANDING_PAGE) }}
        extraBtn={{ btnText: 'Download', variant: 'primary', handleClick: () => downloadBlob() }}
      >
        <div style={{ color: 'red' }}>
          Download file to save the changes you made, or Continue without saving.
        </div>
      </AlertDialog>
      <Form
        css={formCss}
        onSubmit={onSubmit}
        // @ts-ignore
        ref={formRef}
      >
        <Grid
          container
          spacing={2}
        >
          <Grid size={formGridBreakpoints}>
            <TextField
              label="Farm Name"
              name="farmName"
              isRequired
              value={formData.farmName}
              onInput={handleInputChange}
              id="farmName"
            />
          </Grid>
          <Grid size={formGridBreakpoints}>
            <Select
              label="Year"
              isRequired
              items={yearOptions}
              selectedKey={formData.year}
              onSelectionChange={(e) => handleChange({ year: e as string })}
              noSort
            />
          </Grid>
          <Grid size={formGridBreakpoints}>
            <Select
              label="Region"
              isRequired
              items={regionOptions}
              selectedKey={formData.farmRegion}
              onSelectionChange={(e) => {
                const opt = regionOptions.find((r) => r.id === e)!;
                handleChange({ farmRegion: e as number, regionLocationId: opt.value.locationid });
              }}
            />
          </Grid>
          <Grid size={formGridBreakpoints}>
            <Select
              label="Subregion"
              isRequired
              items={subregionOptions}
              selectedKey={formData.farmSubregion}
              onSelectionChange={(e) => handleChange({ farmSubregion: e as number })}
              isDisabled={!(subregionOptions && subregionOptions.length)}
            />
          </Grid>
          <Subheader>Select all agriculture that occupy your farm (check all that apply)</Subheader>
          <Grid size={12}>
            <YesNoRadioButtons
              value={formData.hasHorticulturalCrops}
              text="I have crops"
              onChange={(b) => handleChange({ hasHorticulturalCrops: b })}
              orientation="horizontal"
            />
          </Grid>
          <Grid size={12}>
            <YesNoRadioButtons
              text="I have livestock"
              value={formData.hasAnimals}
              onChange={(hasA) => {
                if (!hasA) {
                  handleChange({ hasAnimals: false, checkedAnimals: [] });
                } else {
                  handleChange({ hasAnimals: hasA });
                }
              }}
              orientation="horizontal"
            />
            <CheckboxGroup
              aria-label="Farm Animals"
              css={
                formData.hasAnimals
                  ? {
                      '> div': [showCheckboxGroup, { gap: '0 !important' }],
                    }
                  : hideCheckboxGroup
              }
              orientation="vertical"
              value={formData.checkedAnimals}
              onChange={(val) => handleChange({ checkedAnimals: val })}
            >
              {animalCheckboxes}
            </CheckboxGroup>
          </Grid>
        </Grid>
      </Form>
    </View>
  );
}
