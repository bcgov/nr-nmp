/* eslint-disable no-param-reassign */
/**
 * @summary This is the Add Animal list Tab
 */
import React, { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import {
  Button,
  ButtonGroup,
  Dialog,
  Modal,
  Form,
  Select,
} from '@bcgov/design-system-react-components';
import { formCss, customTableStyle, tableActionButtonCss } from '../../common.styles';
import useAppService from '@/services/app/useAppService';
import { AppTitle, PageTitle, TabsMaterial } from '@/components/common';
import {
  AnimalData,
  BeefCattleData,
  DairyCattleData,
  initialBeefFormData,
  initialDairyFormData,
  initialEmptyData,
} from './types';
import BeefCattle from './BeefCattle';
import { StyledContent } from '../LandingPage/landingPage.styles';
import DairyCattle from './DairyCattle/DairyCattle';
import { FARM_INFORMATION, MANURE_IMPORTS } from '@/constants/RouteConstants';
import ProgressStepper from '@/components/common/ProgressStepper/ProgressStepper';
import { initAnimals, saveAnimalsToFile } from './utils';
import { ErrorText } from './addAnimals.styles';

// need a row id
type tempAnimalData = AnimalData & { id?: string };

export default function AddAnimals() {
  const { state, setNMPFile, setProgressStep } = useAppService();
  const [formData, setFormData] = useState<tempAnimalData>(
    initialBeefFormData || initialDairyFormData || initialEmptyData,
  );
  // const [formData, setFormData] = useState(EMPTY_SOIL_TEST_FORM);
  const [isEditingForm, setIsEditingForm] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [showViewError, setShowViewError] = useState<string>('');
  // array of all livestck entered by the user so far
  const [animalForm, setAnimalForm] = useState<React.ReactNode | null>(null);

  const navigate = useNavigate();

  // Load NMP animals into view, add id key for UI tracking purposes
  const [animalList, setAnimalList] = useState<Array<tempAnimalData>>(
    initAnimals(state).map((animalElement: AnimalData, index: number) => ({
      ...animalElement,
      id: index.toString(),
    })),
  );

  const animalOptions = [
    { value: '1', label: 'Beef Cattle' },
    { value: '2', label: 'Dairy Cattle' },
  ];

  useEffect(() => {
    setProgressStep(2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // // onSubmit saves to animalList which saves to nmpFile when user clicks next
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
      setAnimalList((prev) => [...prev, { ...formData, id: prev?.length.toString() ?? '0' }]);
    }
    setFormData(initialEmptyData);
    setIsEditingForm(false);
    setIsDialogOpen(false);
    setShowViewError('');
  };

  // sets the animal form for the modal
  const handleAnimalType = useCallback(
    (animal: string) => {
      const newForm =
        animal === '1' ? (
          <BeefCattle
            key={animalList.length}
            formData={formData as BeefCattleData}
            setFormData={setFormData as React.Dispatch<React.SetStateAction<BeefCattleData>>}
          />
        ) : (
          <DairyCattle
            key={animalList.length}
            formData={formData as DairyCattleData}
            setFormData={setFormData as React.Dispatch<React.SetStateAction<DairyCattleData>>}
          />
        );
      setAnimalForm(newForm);
    },
    [animalList.length, formData],
  );

  const handleEditRow = React.useCallback(
    (e: { row: AnimalData }) => {
      setIsEditingForm(true);
      setIsDialogOpen(true);

      if (e.row.animalId === '1') {
        const newFormData = {
          ...initialBeefFormData,
          ...e.row,
        };
        setFormData(newFormData);
        setAnimalForm(
          <BeefCattle
            key={animalList.length}
            formData={newFormData as BeefCattleData}
            setFormData={setFormData as React.Dispatch<React.SetStateAction<BeefCattleData>>}
          />,
        );
      }
      if (e.row.animalId === '2') {
        const newFormData = {
          ...initialDairyFormData,
          ...e.row,
        };
        setFormData(newFormData);
        setAnimalForm(
          <DairyCattle
            key={animalList.length}
            formData={newFormData as DairyCattleData}
            setFormData={setFormData as React.Dispatch<React.SetStateAction<DairyCattleData>>}
          />,
        );
      }
    },
    [animalList.length],
  );

  const handleDeleteRow = (e: any) => {
    setAnimalList((prev) => {
      const newList = [...prev];
      if (e?.id === 0 || e?.id) newList.splice(e.id, 1);
      return newList;
    });
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setIsEditingForm(false);
    setFormData(initialEmptyData);
    setAnimalForm(null);
  };

  const handleNextPage = () => {
    setShowViewError('');

    if (animalList.length) {
      saveAnimalsToFile(
        // Delete the id key in each field to prevent saving into NMPfile
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

  const selectedAnimalLabel = animalOptions.find(
    (item) => item.value === formData?.animalId
  )?.label;

  // fix manure showing as [object]
  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'animalId',
        headerName: 'Animal Type',
        width: 200,
        minWidth: 150,
        maxWidth: 300,
        valueGetter: (params: any) => (params === '1' ? 'Beef Cattle' : 'Dairy Cattle'),
      },
      {
        field: 'manureData',
        headerName: 'Annual Manure',
        width: 150,
        minWidth: 125,
        maxWidth: 300,
        valueGetter: (params: any) => {
          const solid = params?.annualSolidManure ?? 0;
          const liquid = params?.annualLiquidManure ?? 0;
          // for displaying solid and or liquid
          if (solid && liquid) {
            return `${solid} tons/ ${liquid} gal`;
          }
          if (solid) {
            return `${solid} tons`;
          }
          if (liquid) {
            return `${liquid} gal`;
          }
          return '0';
        },
      },
      {
        field: 'date',
        headerName: 'Date',
        minWidth: 200,
        maxWidth: 300,
        valueGetter: (params: any) => params,
      },
      {
        field: 'actions',
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
                      items={animalOptions}
                      label="Animal Type"
                      placeholder="Select Animal Type"
                      selectedKey={selectedAnimalLabel}
                      // e is a the animal type name string
                      onSelectionChange={(e: string) => {
                        const selectedItem = animalOptions.find((item) => item.label === e);
                        if (selectedItem) {
                          setFormData(
                            selectedItem.value === '1' ? initialBeefFormData : initialDairyFormData,
                          );
                          handleAnimalType(selectedItem.value);
                        }
                      }}
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
        getRowId={(row: any) => row.id}
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
