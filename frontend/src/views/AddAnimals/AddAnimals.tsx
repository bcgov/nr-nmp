/* eslint-disable no-param-reassign */
/**
 * @summary This is the Add Animal list Tab
 */
import React, { FormEvent, useEffect, useMemo, useState } from 'react';
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
import { AnimalData, BeefCattleData, DairyCattleData } from './types';
import BeefCattle from './BeefCattle';
import DairyCattle from './DairyCattle/DairyCattle';
import { FARM_INFORMATION, MANURE_IMPORTS } from '@/constants/RouteConstants';
import { customTableStyle, tableActionButtonCss } from '@/views/FieldList/fieldList.styles';
import StyledContent from '../LandingPage/landingPage.styles';
import ProgressStepper from '@/components/common/ProgressStepper/ProgressStepper';
import { initAnimals, saveAnimalsToFile } from './utils';
import { ErrorText } from './addAnimals.styles';

const initialAnimalFormData: AnimalData = {
  id: '0',
};

export default function AddAnimals() {
  const { state, setNMPFile, setProgressStep } = useAppService();
  const [formData, setFormData] = useState<AnimalData>(initialAnimalFormData);
  const [isEditingForm, setIsEditingForm] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [showViewError, setShowViewError] = useState<string>('');
  const [animalForm, setAnimalForm] = useState<React.ReactNode | null>(null);

  const navigate = useNavigate();

  const [animalList, setAnimalList] = useState<Array<AnimalData>>(
    // Load NMP animals into view, add id key for UI tracking purposes
    initAnimals(state).map((animalElement: AnimalData) => ({
      ...animalElement,
    })),
  );

  useEffect(() => {
    setProgressStep(2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    // Prevent default browser page refresh.
    e.preventDefault();

    if (isEditingForm) {
      // If editing, find and replace field instead of adding new field
      const replaceIndex = animalList.findIndex((element) => element?.id === formData?.id);
      setAnimalList((prev) => {
        const newList = [...prev];
        newList[replaceIndex] = { ...formData };
        return newList;
      });
    } else {
      setAnimalList((prev) => [
        ...prev,
        {
          ...formData,
        },
      ]);
    }
    setFormData(initialAnimalFormData);
    setAnimalForm(null);
    setIsEditingForm(false);
    setIsDialogOpen(false);
    setShowViewError('');
  };

  const handleFormAnimalChange = (animal: string) => {
    console.log('handleFormAnimalChange', animal);
    setFormData((prev) => ({ ...prev, animal }));
  };

  const handleAnimalType = (animal: string) => {
    console.log('Animal Type:', animal);
    // Only beef or dairy for now

    const newForm =
      animal === '1' ? (
        <BeefCattle
          key={animalList.length}
          formData={formData as BeefCattleData}
          setFormData={setFormData}
        />
      ) : (
        <DairyCattle
          key={animalList.length}
          formData={formData as DairyCattleData}
          setFormData={setFormData}
        />
      );
    console.log(newForm);
    setAnimalForm(newForm);
    handleFormAnimalChange(animal);
  };

  const handleEditRow = (e: any) => {
    setIsEditingForm(true);
    setFormData(e.row);
    setIsDialogOpen(true);
  };

  const handleDeleteRow = (e: any) => {
    console.log(e);
    setAnimalList((prev) => {
      const newList = [...prev];
      if (e?.id === 0 || e?.id) newList.splice(e.id, 1);
      return newList;
    });
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setIsEditingForm(false);
    // setIsFormInvalid(false);
    setFormData(initialAnimalFormData);
  };

  const handleNextPage = () => {
    setShowViewError('');

    if (animalList.length) {
      saveAnimalsToFile(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        animalList.map(({ ...remainingAnimals }) => remainingAnimals),
        state.nmpFile,
        setNMPFile,
      );
      navigate(MANURE_IMPORTS);
    } else {
      setShowViewError('You must add at least one animal before continuing.');
    }
  };

  const animalOptions = [
    { value: '1', label: 'Beef Cattle' },
    { value: '2', label: 'Dairy Cattle' },
  ];

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
        renderCell: (row: any) => (
          <>
            <FontAwesomeIcon
              css={tableActionButtonCss}
              onClick={() => handleEditRow(row)}
              icon={faEdit}
              aria-label="Edit"
            />
            <FontAwesomeIcon
              css={tableActionButtonCss}
              onClick={() => handleDeleteRow(row)}
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
                onSubmit={onSubmit}
              >
                <Grid>
                  <Grid size={6}>
                    {/* dynamically renders the form fields depending on the users choice of animal in the select below */}
                    <Select
                      isRequired
                      name="AnimalType"
                      value={formData.id}
                      items={animalOptions}
                      onSelectionChange={(e) => {
                        const selectedItem = animalOptions.find((item) => item.label === e);
                        console.log('Selected Value:', selectedItem);
                        console.log('formData', formData); // Debugging
                        if (selectedItem) {
                          handleAnimalType(selectedItem.value); // Update formData.id
                        }
                      }}
                      label="Animal Type"
                    />
                    <div style={{ marginTop: '0.5rem' }}>{animalForm}</div>
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
        rows={animalList}
        columns={columns}
        disableRowSelectionOnClick
        disableColumnMenu
        hideFooterPagination
        hideFooter
      />
      <ErrorText>{showViewError}</ErrorText>
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
          onPress={handleNextPage}
          type="submit"
        >
          Next
        </Button>
      </ButtonGroup>
    </StyledContent>
  );
}
