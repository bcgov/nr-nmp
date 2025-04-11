/* eslint-disable no-param-reassign */
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
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
  const [isFormInvalid, setIsFormInvalid] = useState<boolean>(false);
  const [isEditingForm, setIsEditingForm] = useState<boolean>(false);
  const [formData, setFormData] = useState<((AnimalData & { id?: string }) | null)[]>([]);
  const [animalOptions, setAnimalOptions] = useState<{ value: number; label: string }[]>([]);
  const [selectedAnimal, setSelectedAnimal] = useState<string | null>(null);
  const [formComplete, setFormComplete] = useState<(boolean | null)[]>([]);
  const [formExpanded, setFormExpanded] = useState<(boolean | null)[]>([]);
  const [nextDisabled, setNextDisabled] = useState(false);

  useEffect(() => {
    setProgressStep(2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // on submit/save
  const handleSave = useCallback((data: AnimalData, index: number) => {
    setFormData((prev) => {
      const updated = [...prev];
      updated[index] = data;
      return updated;
    });
  }, []);

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setIsEditingForm(false);
    setIsFormInvalid(false);
  };

  const handleEdit = (e: any) => {
    setIsEditingForm(true);
    setFormData(e.row);
    setIsDialogOpen(true);
  };

  const handleDelete = (index: number) => {
    setFormData((prev) => {
      const updated = [...prev];
      updated[index] = null;
      return updated;
    });
    setFormComplete((prev) => {
      const updated = [...prev];
      updated[index] = null;
      return updated;
    });
    setFormExpanded((prev) => {
      const updated = [...prev];
      updated[index] = null;
      return updated;
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

    setFormData(data);
    // Default to open and incomplete to disable the buttons
    setFormComplete(Array(data.length).fill(false));
    setFormExpanded(Array(data.length).fill(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // used to render the form for the selected animal
  const animalForm = () => {
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    switch (selectedAnimal) {
      case '1':
        return (
          <BeefCattle
            key={formData[0]?.id || 0}
            startData={formData[0]}
            startExpanded={formExpanded[0] ?? false}
            saveData={handleSave}
            updateIsComplete={setFormComplete}
            updateIsExpanded={setFormExpanded}
            myIndex={0}
          />
        );
      case '2':
        return (
          <DairyCattle
            key={formData[0]?.id || 0}
            startData={formData[0]}
            startExpanded={formExpanded[0] ?? false}
            saveData={handleSave}
            updateIsComplete={setFormComplete}
            updateIsExpanded={setFormExpanded}
            myIndex={0}
          />
        );
      default:
        return null;
    }
  };

  const handleAdd = (animalId: string) => {
    if (animalId !== '1' && animalId !== '2') return;
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    setFormData((prev) => [...prev, { id: animalId, date: currentDate }]);
    setFormComplete((prev) => [...prev, false]);
    setFormExpanded((prev) => [...prev, true]);
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
    setNextDisabled(formComplete.length === 0 || formComplete.some((bool) => bool === false));
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
  }, [formComplete, setNextDisabled]);

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
              area-label="Delete"
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
                onSubmit={handleAdd}
                onInvalid={() => setIsFormInvalid(true)}
              >
                <Grid
                  container
                  spacing={1}
                >
                  <Grid size={6}>
                    <Select
                      isRequired
                      name="AnimalType"
                      items={animalOptions}
                      selectedKey={selectedAnimal}
                      onSelectionChange={(e, option) => setSelectedAnimal(option?.key as string)}
                      label="Animal Type"
                    />
                    {animalForm()}
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
