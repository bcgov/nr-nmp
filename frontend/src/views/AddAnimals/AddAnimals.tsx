/* eslint-disable no-param-reassign */
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid2';
import {
  Button,
  ButtonGroup,
  Dialog,
  Modal,
  Form,
  Select,
} from '@bcgov/design-system-react-components';
import { formCss } from '../../common.styles';
import useAppService from '@/services/app/useAppService';
import { AppTitle, PageTitle, TabsMaterial } from '@/components/common';
import { APICacheContext } from '@/context/APICacheContext';
import { AnimalData } from './types';
import NMPFile from '@/types/NMPFile';
import BeefCattle from './BeefCattle';
import {
  Header,
  FlexContainer,
  AddButton,
  MarginWrapperOne,
  MarginWrapperTwo,
} from './addAnimals.styles';
import { Column } from '@/views/FieldList/fieldList.styles';
import StyledContent from '../LandingPage/landingPage.styles';
import defaultNMPFile from '@/constants/DefaultNMPFile';
import defaultNMPFileYear from '@/constants/DefaultNMPFileYear';
import BeefCattle from './BeefCattle';
import DairyCattle from './DairyCattle/DairyCattle';
import { FARM_INFORMATION, MANURE_IMPORTS } from '@/constants/RouteConstants';
import { customTableStyle, tableActionButtonCss } from '@/views/FieldList/fieldList.styles';
import StyledContent from '../LandingPage/landingPage.styles';
import ProgressStepper from '@/components/common/ProgressStepper/ProgressStepper';

export default function AddAnimals() {
  const { state, setNMPFile, setProgressStep } = useAppService();
  const navigate = useNavigate();
  const apiCache = useContext(APICacheContext);

  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isEditingForm, setIsEditingForm] = useState<boolean>(false);
  const [formData, setFormData] = useState<(AnimalData | null)[]>([]);

  const [selectedAnimal, setSelectedAnimal] = useState<string | null>(null);
  const [animalOptions, setAnimalOptions] = useState<{ value: number; label: string }[]>([]);
  const [elems, setElems] = useState<(React.ReactNode | null)[]>([]);
  const [animalForm, setAnimalForm] = useState<React.ReactNode | null>(null);
  const [formComplete, setFormComplete] = useState<(boolean | null)[]>([]);
  const [formExpanded, setFormExpanded] = useState<(boolean | null)[]>([]);
  const [nextDisabled, setNextDisabled] = useState(false);

  // on submit/save
  const handleSave = useCallback(
    (data: AnimalData, index: number) => {
      setFormData((prev) => {
        prev[index] = data;
        // Save this data up the chain, to the parent
        return prev;
      });
    },
    [setFormData],
  );

  // on close of add animal form
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setIsEditingForm(false);
  };

  const handleEdit = (e: any) => {
    setIsEditingForm(true);
    setFormData(e.row);
    setIsDialogOpen(true);
  };

  const handleDelete = (index: number) => {
    // Avoid array deletions by setting index to null
    setFormData((prev) => {
      prev[index] = null;
      return prev;
    });
    setElems((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
    setFormComplete((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
    setFormExpanded((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  };

  // Init data & elems on first render
  useEffect(() => {
    // Uncomment once we cache session state
    /*
    if (!state.nmpFile) {
      throw new Error('NMP file has entered bad state in AddAnimals. (can be caused by refresh)');
    }
    const nmpFile: NMPFile = JSON.parse(state.nmpFile);
    */
    let nmpFile: NMPFile;
    if (state.nmpFile) nmpFile = JSON.parse(state.nmpFile);
    else {
      nmpFile = { ...defaultNMPFile };
      nmpFile.years.push({ ...defaultNMPFileYear });
    }
    let data = nmpFile.years[0].FarmAnimals;
    if (data === undefined || data.length === 0) {
      data = (nmpFile.farmDetails.FarmAnimals || []).map((id) => ({ id })) as AnimalData[];
    }

    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const dataElems = data.map((d, index) => {
      if (d === null) {
        return null;
      }
      if (d.id === '1') {
        return (
          <BeefCattle
            // eslint-disable-next-line react/no-array-index-key
            key={`${index}`}
            startData={d}
            startExpanded={index === 0}
            saveData={handleSave}
            updateIsComplete={setFormComplete}
            updateIsExpanded={setFormExpanded}
            myIndex={index}
            date={currentDate}
          />
        );
      }
      if (d.id === '2') {
        return (
          <DairyCattle
            // eslint-disable-next-line react/no-array-index-key
            key={`${index}`}
            startData={d}
            startExpanded={index === 0}
            saveData={handleSave}
            updateIsComplete={setFormComplete}
            updateIsExpanded={setFormExpanded}
            myIndex={index}
            date={currentDate}
          />
        );
      }
      throw new Error('Unexpected animal id.');
    });

    setFormData(data);
    setElems(dataElems);
    // Default to open and incomplete to disable the buttons
    setFormComplete(Array(data.length).fill(false));
    setFormExpanded(Array(data.length).fill(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAdd = (animal: string) => {
    const animalId: string = animal === 'Beef Cattle' ? '1' : animal === 'Dairy Cattle' ? '2' : '';

    // Only allow beef or dairy
    if (!animalId) return;

    setSelectedAnimal(animalId);
    console.log('handleAdd called with:', animalId);

    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const { length } = formData;

    const newForm =
      animalId === '1' ? (
        <BeefCattle
          key={formData[0]?.id || 0}
          startData={{ id: animalId }}
          startExpanded={formExpanded[0] ?? false}
          saveData={handleSave}
          updateIsComplete={setFormComplete}
          updateIsExpanded={setFormExpanded}
          myIndex={length}
          date={currentDate}
        />
      ) : (
        <DairyCattle
          key={formData[0]?.id || 0}
          startData={{ id: animalId }}
          startExpanded={formExpanded[0] ?? false}
          saveData={handleSave}
          updateIsComplete={setFormComplete}
          updateIsExpanded={setFormExpanded}
          myIndex={length}
          date={currentDate}
        />
      );
    // Add the new form component to your list/state here (if needed)
    // e.g., setFormComponents((prev) => [...prev, newForm]);

    setAnimalForm(newForm);
    // Optionally expand and mark as incomplete
    setFormComplete((prev) => prev.concat(false));
    setFormExpanded((prev) => prev.concat(true));
  };

  const handleNext = () => {
    if (!state.nmpFile) {
      throw new Error('NMP file has entered impossible state in AnimalsAndManure.');
    }

    const nmpFile: NMPFile = JSON.parse(state.nmpFile);
    // TODO: Add multi-year handling
    nmpFile.years[0].FarmAnimals = formData.filter((f) => f !== null);
    // TODO: Copy the data of the other tabs
    setNMPFile(JSON.stringify(nmpFile));

    navigate(MANURE_IMPORTS);
  };

  useEffect(() => {
    if (formComplete.length === 0) {
      setNextDisabled(true);
    } else {
      setNextDisabled(formComplete.some((bool) => bool === false));
    }
  }, [formComplete, setNextDisabled]);

  useEffect(() => {
    apiCache.callEndpoint('api/animals/').then((response) => {
      if (response.status === 200) {
        const { data } = response;
        const animals: { value: number; label: string }[] = (data as { id: number; name: string }[])
          .map((row) => ({ value: row.id, label: row.name }))
          // Temp, remove non-cattle as an option
          .filter((opt) => opt.value === 1 || opt.value === 2);
        setAnimalOptions(animals);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setProgressStep(2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns: GridColDef[] = useMemo(
    () => [
      { field: 'AnimalType', headerName: 'Animal Type', width: 200, minWidth: 150, maxWidth: 300 },
      {
        field: 'AnnualManure',
        headerName: 'Annual Manure',
        width: 150,
        minWidth: 125,
        maxWidth: 300,
      },
      { field: 'Date', headerName: 'Date', minWidth: 200, maxWidth: 300 },
      {
        field: '',
        headerName: 'Actions',
        width: 120,
        renderCell: (params: any) => (
          <>
            <FontAwesomeIcon
              css={tableActionButtonCss}
              onClick={() => handleEdit({ row: { ...params.row, index: params.row?.index } })}
              icon={faEdit}
              aria-label="Edit"
            />
            <FontAwesomeIcon
              css={tableActionButtonCss}
              onClick={() => handleDelete(params.row?.index)}
              icon={faTrash}
              aria-label="Delete"
            />
          </>
        ),
        sortable: false,
        resizable: false,
      },
    ],
    [],
  );

  return (
    <StyledContent>
      <ProgressStepper step={FARM_INFORMATION} />
      <AppTitle />
      <PageTitle title="Livestock Information" />
      <>
        <div
          css={{
            '.bcds-ButtonGroup': {
              overflow: 'visible',
              height: '0rem',
              '> button': {
                position: 'relative',
                bottom: '-0.25rem',
                zIndex: '10',
              },
            },
          }}
        >
          <ButtonGroup
            alignment="end"
            ariaLabel="A group of buttons"
            orientation="horizontal"
          >
            <Button
              size="medium"
              aria-label="Add Animal"
              onPress={() => setIsDialogOpen(true)}
              variant="secondary"
            >
              Add Animal
            </Button>
          </ButtonGroup>
        </div>
        <Modal
          isDismissable
          isOpen={isDialogOpen}
          onOpenChange={handleDialogClose}
        >
          {formData.map((animal, index) => {
            if (!animal) return null;

            if (animal.id === '1') {
              return (
                <BeefCattle
                  key={animal.id || index}
                  startData={animal}
                  saveData={handleSave}
                  updateIsComplete={setFormComplete}
                  updateIsExpanded={setFormExpanded}
                  myIndex={index}
                  date={animal.date || ''}
                />
              );
            }
            return (
              <DairyCattle
                key={animal.id || index}
                startData={animal}
                saveData={handleSave}
                updateIsComplete={setFormComplete}
                updateIsExpanded={setFormExpanded}
                myIndex={index}
                date={animal.date || ''}
              />
            );
          })}
          <Dialog
            isCloseable
            role="dialog"
            aria-labelledby="add-animal-dialog"
          >
            <div
              style={{
                padding: '1rem',
              }}
            >
              <span
                style={{
                  fontWeight: '700',
                  fontSize: '1.25rem',
                }}
              >
                {isEditingForm ? 'Edit Field' : 'Add Field'}
              </span>
              <Divider
                aria-hidden="true"
                component="div"
                css={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}
              />
              <Form
                css={formCss}
                onSubmit={handleSave}
              >
                <Grid
                  container
                  spacing={1}
                >
                  <Grid size={6}>
                    {/* Needs to dynamically render the form fields depending on the users choice of animal in the select below */}
                    <Select
                      isRequired
                      name="AnimalType"
                      items={animalOptions}
                      selectedKey={selectedAnimal}
                      onSelectionChange={(e) => {
                        handleAdd(e.toString());
                      }}
                      label="Animal Type"
                    />
                    {animalForm}
                  </Grid>
                </Grid>
                <Divider
                  aria-hidden="true"
                  component="div"
                  css={{ marginTop: '1rem', marginBottom: '1rem' }}
                />
                <ButtonGroup
                  alignment="end"
                  orientation="horizontal"
                >
                  <Button
                    type="reset"
                    variant="secondary"
                    onPress={handleDialogClose}
                    aria-label="reset"
                  >
                    Cancel
                  </Button>
                  {/* can we use the components save function? */}
                  <Button
                    type="submit"
                    variant="primary"
                    aria-label="submit"
                  >
                    Confirm
                  </Button>
                </ButtonGroup>
              </Form>
            </div>
          </Dialog>
        </Modal>
      </>
      <TabsMaterial
        activeTab={0}
        tabLabel={['Add Animals', 'Manure & Imports', 'Nutrient Analysis']}
      />
      <DataGrid
        sx={{ ...customTableStyle, marginTop: '1.25rem' }}
        rows={formData}
        columns={columns}
        disableRowSelectionOnClick
        disableColumnMenu
        hideFooterPagination
        hideFooter
      />
      <ButtonGroup
        alignment="start"
        ariaLabel="A group of buttons"
        orientation="horizontal"
      >
        <Button
          size="medium"
          aria-label="Back"
          variant="secondary"
          onPress={() => navigate(FARM_INFORMATION)}
        >
          BACK
        </Button>
        <Button
          size="medium"
          aria-label="Next"
          variant="primary"
          onPress={handleNext}
          type="submit"
          disabled={nextDisabled}
        >
          Next
        </Button>
      </ButtonGroup>
    </StyledContent>
  );
}
