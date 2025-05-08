/* eslint-disable eqeqeq */
import React, { useState, useEffect, useContext, useMemo, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { APICacheContext } from '@/context/APICacheContext';
import {
  NMPFileImportedManureData,
  LiquidManureConversionFactors,
  SolidManureConversionFactors,
  NMPFile,
} from '@/types';
import {
  DefaultSolidManureConversionFactors,
  DefaultLiquidManureConversionFactors,
  DefaultManureFormData,
  defaultNMPFile,
  defaultNMPFileYear,
} from '@/constants';
import { Button, Modal, InputField, Dropdown } from '@/components/common';
import { getDensityFactoredConversionUsingMoisture } from '@/calculations/ManureAndCompost/ManureAndImports/Calculations';
import {
  ContentWrapper,
  ButtonContainer,
  ButtonWrapper,
  ErrorText,
  Header,
  Column,
  ListItem,
  ListItemContainer,
  GeneratedListItemContainer,
  GeneratedHeader,
  StyledContent,
} from './manureAndImports.styles';
import useAppService from '@/services/app/useAppService';
import ViewCard from '@/components/common/ViewCard/ViewCard';
import { ADD_ANIMALS, CROPS, NUTRIENT_ANALYSIS } from '@/constants/RouteConstants';
import NMPFileGeneratedManureData from '@/types/NMPFileGeneratedManureData';
import { DAIRY_COW_ID, MILKING_COW_ID } from '../AddAnimals/types';
import DefaultGeneratedManureFormData from '@/constants/DefaultGeneratedManureData';
import { getLiquidManureDisplay, getSolidManureDisplay } from '../AddAnimals/utils';
import { FARM_INFORMATION, FIELD_LIST, SOIL_TESTS } from '@/constants/RouteConstants';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import {
  Button as ButtonGov,
  ButtonGroup as ButtonGovGroup,
  Dialog as DialogGov,
  Modal as ModalGov,
  Form,
  Select,
} from '@bcgov/design-system-react-components';

import { AppTitle, PageTitle, ProgressStepper, TabsMaterial } from '../../components/common';
import {
  addRecordGroupStyle,
  customTableStyle,
  formCss,
  modalHeaderStyle,
  modalPaddingStyle,
  tableActionButtonCss,
} from '@/common.styles';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

const manureTypeOptions = [
  { label: 'Select', value: 0 },
  { label: 'Liquid', value: 1 },
  { label: 'Solid', value: 2 },
];

export default function ManureAndImports() {
  const { state, setNMPFile, setShowAnimalsStep } = useAppService();
  const parsedFile: NMPFile = useMemo(() => {
    if (state.nmpFile) {
      return JSON.parse(state.nmpFile);
    }
    // TODO: Once we cache state, throw error if uninitialized
    return { ...defaultNMPFile, years: [{ ...defaultNMPFileYear }] };
  }, [state.nmpFile]);
  const navigate = useNavigate();
  const apiCache = useContext(APICacheContext);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [manures, setManures] = useState<NMPFileImportedManureData[]>(
    parsedFile.years[0]?.ImportedManures || [],
  );
  const generatedManures: NMPFileGeneratedManureData[] = useMemo(() => {
    const farmAnimals = parsedFile.years[0]?.FarmAnimals;
    if (farmAnimals === undefined) {
      return [];
    }
    const gManures: NMPFileGeneratedManureData[] = [];
    for (let i = 0; i < farmAnimals.length; i += 1) {
      const animal = farmAnimals[i];
      if (animal.manureData !== undefined) {
        if (animal.animalId === DAIRY_COW_ID && animal.subtype === MILKING_COW_ID) {
          // TODO: Add wash water as manure. We're ignoring a lot of dairy cow stuff for now
        }

        if (animal.manureData.annualSolidManure !== undefined) {
          gManures.push({
            ...DefaultGeneratedManureFormData,
            UniqueMaterialName: animal.manureData.name,
            ManureTypeName: '2',
            AnnualAmount: animal.manureData.annualSolidManure,
            AnnualAmountTonsWeight: animal.manureData.annualSolidManure,
            AnnualAmountDisplayWeight: getSolidManureDisplay(animal.manureData.annualSolidManure),
          });
        } else {
          gManures.push({
            ...DefaultGeneratedManureFormData,
            UniqueMaterialName: animal.manureData.name,
            ManureTypeName: '1',
            AnnualAmount: animal.manureData.annualLiquidManure,
            AnnualAmountUSGallonsVolume: animal.manureData.annualLiquidManure,
            AnnualAmountDisplayWeight: getLiquidManureDisplay(animal.manureData.annualLiquidManure),
          });
        }
      }
    }
    return gManures;
  }, [parsedFile.years]);
  const [solidManureDropdownOptions, setSolidManureDropdownOptions] = useState<
    SolidManureConversionFactors[]
  >([DefaultSolidManureConversionFactors]);
  const [liquidManureDropdownOptions, setLiquidManureDropdownOptions] = useState<
    LiquidManureConversionFactors[]
  >([DefaultLiquidManureConversionFactors]);
  const [manureFormData, setManureFormData] =
    useState<NMPFileImportedManureData>(DefaultManureFormData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setManureFormData({ ...manureFormData, [name]: value });
  };

  const handleEdit = (index: number) => {
    setManureFormData(manures[index]);
    setEditIndex(index);
    setIsModalVisible(true);
  };

  const handleDelete = (index: number) => {
    const updatedManures = manures.filter((_, i) => i !== index);
    setManures(updatedManures);
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!manureFormData.UniqueMaterialName?.trim()) {
      newErrors.FieldName = 'Field Name is required';
    } else if (
      manures.some(
        (manure, index) =>
          manure.UniqueMaterialName?.trim().toLowerCase() ===
            (manureFormData.UniqueMaterialName ?? '').trim().toLowerCase() && index !== editIndex,
      )
    ) {
      newErrors.FieldName = 'Material Name must be unique';
    }

    if (!manureFormData.ManureTypeName || manureFormData.ManureTypeName === '0') {
      newErrors.ManureTypeName = 'Manure Type is required';
    }

    if (!manureFormData.AnnualAmount || manureFormData.AnnualAmount <= 0) {
      newErrors.AnnualAmount = 'Annual Amount is required';
    }

    if (!manureFormData.Units) {
      newErrors.Units = 'Units is required';
    }

    if (manureFormData.ManureTypeName === '2' && !manureFormData.Moisture) {
      newErrors.Moisture = 'Moisture is required';
    }

    return newErrors;
  };

  const handleSubmit = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    let updatedManureFormData: NMPFileImportedManureData;

    if (manureFormData.ManureTypeName === '1') {
      const liquidManureConversionFactor = liquidManureDropdownOptions.find(
        (item) => item.inputunit == manureFormData.Units,
      );

      const annualAmountUSGallonsVolume =
        (manureFormData.AnnualAmount ?? 0) *
        (liquidManureConversionFactor?.usgallonsoutput
          ? parseFloat(liquidManureConversionFactor.usgallonsoutput)
          : 0);

      updatedManureFormData = {
        ...manureFormData,
        AnnualAmountUSGallonsVolume: annualAmountUSGallonsVolume,
        AnnualAmountDisplayVolume: `${Math.round((annualAmountUSGallonsVolume * 10) / 10).toString()} U.S. gallons`,
      };
    } else if (manureFormData.ManureTypeName === '2') {
      const solidManureConversionFactor = solidManureDropdownOptions.find(
        (item) => item.inputunit == manureFormData.Units,
      );

      const annualAmountCubicMetersVolume =
        (manureFormData.AnnualAmount ?? 0) *
        getDensityFactoredConversionUsingMoisture(
          Number(manureFormData.Moisture),
          solidManureConversionFactor?.cubicmetersoutput || '',
        );

      const annualAmountCubicYardsVolume =
        (manureFormData.AnnualAmount ?? 0) *
        getDensityFactoredConversionUsingMoisture(
          Number(manureFormData.Moisture),
          solidManureConversionFactor?.cubicyardsoutput || '',
        );

      const annualAmountTonsWeight =
        (manureFormData.AnnualAmount ?? 0) *
        getDensityFactoredConversionUsingMoisture(
          Number(manureFormData.Moisture),
          solidManureConversionFactor?.metrictonsoutput || '',
        );

      updatedManureFormData = {
        ...manureFormData,
        AnnualAmountCubicYardsVolume: annualAmountCubicYardsVolume,
        AnnualAmountCubicMetersVolume: annualAmountCubicMetersVolume,
        AnnualAmountDisplayVolume: `${Math.round((annualAmountCubicYardsVolume * 10) / 10).toString()} yards³ (${Math.round((annualAmountCubicMetersVolume * 10) / 10).toString()} m³)`,
        AnnualAmountDisplayWeight: `${Math.round((annualAmountTonsWeight * 10) / 10).toString()} tons`,
      };
    } else {
      throw new Error("Manure type isn't set.");
    }

    if (editIndex !== null) {
      const updatedManures = manures.map((manure, index) =>
        index === editIndex ? updatedManureFormData : manure,
      );
      setManures(updatedManures);
      setEditIndex(null);
    } else {
      setManures([...manures, updatedManureFormData]);
    }
    setManureFormData(DefaultManureFormData);
    setIsModalVisible(false);
  };

  const handleAddManure = () => {
    setManureFormData(DefaultManureFormData);
    setIsModalVisible(true);
  };

  const handlePrevious = () => {
    // Remove the generated manures, which will be reprocessed when returning to this page
    if (parsedFile.years[0].GeneratedManures !== undefined) {
      const nmpFile = { ...parsedFile };
      nmpFile.years[0].GeneratedManures = undefined;
      setNMPFile(JSON.stringify(nmpFile));
    }

    if (
      parsedFile.years[0]?.FarmAnimals !== undefined &&
      parsedFile.years[0].FarmAnimals.length > 0
    ) {
      navigate(ADD_ANIMALS);
    } else {
      navigate(CROPS);
    }
  };

  const handleNext = () => {
    const nmpFile = { ...parsedFile };
    nmpFile.years[0].ImportedManures = structuredClone(manures);
    nmpFile.years[0].GeneratedManures = structuredClone(generatedManures);
    setNMPFile(JSON.stringify(nmpFile));
    navigate(NUTRIENT_ANALYSIS);
  };

  useEffect(() => {
    // Load animals step to progress stepper
    setShowAnimalsStep(true);

    apiCache
      .callEndpoint('api/liquidmaterialsconversionfactors/')
      .then((response: { status?: any; data: any }) => {
        if (response.status === 200) {
          const { data } = response;
          console.log('liquid', data);
          setLiquidManureDropdownOptions(data);
        }
      });
    apiCache
      .callEndpoint('api/solidmaterialsconversionfactors/')
      .then((response: { status?: any; data: any }) => {
        if (response.status === 200) {
          const { data } = response;
          console.log('solid', data);

          setSolidManureDropdownOptions(data);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    // setIsEditingForm(false);
    // setFormData(initialEmptyData);
    // setAnimalForm(null);
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    // Prevent default browser page refresh.
    e.preventDefault();
  };

  const handleEditRow = (e: any) => {
    console.log('handleEditRow', e);
  };

  const handleDeleteRow = (e: any) => {
    console.log('handleEditRow', e);
  };

  const columnsAnimalManure: GridColDef[] = useMemo(
    () => [
      {
        field: 'animalId',
        headerName: 'Animal Sub Type',
        width: 200,
        minWidth: 150,
        maxWidth: 300,
      },
      {
        field: 'manureData',
        headerName: 'Amount Collected Per Year',
        width: 150,
        minWidth: 125,
        maxWidth: 300,
      },
      {
        field: 'date',
        headerName: 'Date',
        width: 150,
        minWidth: 125,
        maxWidth: 300,
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

  const columnsImportedManure: GridColDef[] = useMemo(
    () => [
      {
        field: 'animalId',
        headerName: 'Material Type',
        width: 200,
        minWidth: 150,
        maxWidth: 300,
      },
      {
        field: 'manureData',
        headerName: 'Annual Amount (Vol)',
        width: 150,
        minWidth: 125,
        maxWidth: 300,
      },
      {
        field: 'date',
        headerName: 'Animal Amount (Weight)',
        width: 150,
        minWidth: 125,
        maxWidth: 300,
      },
      {
        field: 'stored',
        headerName: 'Stored',
        width: 150,
        minWidth: 125,
        maxWidth: 300,
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
    <>
      <StyledContent>
        <ProgressStepper step={FIELD_LIST} />
        <AppTitle />
        <PageTitle title="Manure & Imports" />

        <>
          <div css={addRecordGroupStyle}>
            <ButtonGovGroup
              alignment="end"
              ariaLabel="A group of buttons"
              orientation="horizontal"
            >
              <ButtonGov
                size="medium"
                aria-label="Add Animal"
                onPress={() => setIsDialogOpen(true)}
                variant="secondary"
              >
                Add Animal
              </ButtonGov>
            </ButtonGovGroup>
          </div>
          <ModalGov
            isDismissable
            isOpen={isDialogOpen}
            onOpenChange={handleDialogClose}
          >
            <DialogGov
              isCloseable
              role="dialog"
              aria-labelledby="add-animal-dialog"
            >
              <div css={modalPaddingStyle}>
                <span css={modalHeaderStyle}>Add manure</span>
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
                        name="animalId"
                        items={[
                          { id: 1, label: 'test1' },
                          { id: 2, label: 'test2' },
                        ]}
                        label="Animal Type"
                        placeholder="Select Animal Type"
                        // selectedKey={formData.animalId}
                        onSelectionChange={(e: any) => {
                          console.log(e);
                        }}
                      />
                    </Grid>
                  </Grid>
                  <Divider
                    aria-hidden="true"
                    component="div"
                    css={{ marginTop: '1rem', marginBottom: '1rem' }}
                  />
                  <ButtonGovGroup
                    alignment="end"
                    orientation="horizontal"
                  >
                    <ButtonGov
                      type="reset"
                      variant="secondary"
                      onPress={handleDialogClose}
                      aria-label="reset"
                    >
                      Cancel
                    </ButtonGov>
                    {/* can we use the components save function? */}
                    <ButtonGov
                      type="submit"
                      variant="primary"
                      aria-label="submit"
                    >
                      Confirm
                    </ButtonGov>
                  </ButtonGovGroup>
                </Form>
              </div>
            </DialogGov>
          </ModalGov>
          <TabsMaterial
            activeTab={1}
            tabLabel={['Add Animals', 'Manure & Imports', 'Nutrient Analysis']}
          />
        </>
        <DataGrid
          sx={{ ...customTableStyle, marginTop: '1.25rem' }}
          rows={[]}
          columns={columnsAnimalManure}
          getRowId={(row: any) => row.id}
          disableRowSelectionOnClick
          disableColumnMenu
          hideFooterPagination
          hideFooter
        />
        <DataGrid
          sx={{ ...customTableStyle, marginTop: '1.25rem' }}
          rows={[]}
          columns={columnsImportedManure}
          getRowId={(row: any) => row.id}
          disableRowSelectionOnClick
          disableColumnMenu
          hideFooterPagination
          hideFooter
        />
      </StyledContent>
      <ViewCard
        heading="Manure and Imports"
        height="700px"
        handlePrevious={handlePrevious}
        handleNext={handleNext}
      >
        {generatedManures.length > 0 && (
          <>
            <span>Manure Generated</span>
            <ContentWrapper hasManure>
              <GeneratedHeader>
                <Column>Animal Sub Type</Column>
                <Column align="right">Amount collected per year</Column>
              </GeneratedHeader>
              {generatedManures.map((manure) => (
                <GeneratedListItemContainer key={manure.UniqueMaterialName}>
                  <ListItem>{manure.UniqueMaterialName}</ListItem>
                  <ListItem>{manure.AnnualAmountDisplayWeight}</ListItem>
                </GeneratedListItemContainer>
              ))}
            </ContentWrapper>
            <hr className="solid" />
            <span>Manure/Compost Imported</span>
          </>
        )}
        <ButtonContainer hasManure={manures.length > 0}>
          <Button
            text="Add Manure"
            handleClick={handleAddManure}
            aria-label="Add Imported Manure"
            variant="primary"
            size="sm"
            disabled={false}
          />
        </ButtonContainer>
        <ContentWrapper hasManure={manures.length > 0}>
          {manures.length > 0 && (
            <Header>
              <Column>Material Type</Column>
              <Column>Annual Amount (Volume)</Column>
              <Column>Annual Amount (Weight)</Column>
              <Column>Stored</Column>
              <Column align="right">Actions</Column>
            </Header>
          )}
          {manures.map((manure, index) => (
            <ListItemContainer key={manure.UniqueMaterialName}>
              <ListItem>
                {manure.UniqueMaterialName} {manure.ManureTypeName === '1' ? '(Liquid)' : '(Solid)'}
              </ListItem>
              <ListItem>{manure.AnnualAmountDisplayVolume}</ListItem>
              <ListItem>{manure.AnnualAmountDisplayWeight}</ListItem>
              <ListItem>{manure.IsMaterialStored ? 'Yes' : 'No'}</ListItem>
              <ListItem align="right">
                <button
                  type="button"
                  onClick={() => handleEdit(index)}
                >
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(index)}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </ListItem>
            </ListItemContainer>
          ))}
        </ContentWrapper>
        <Modal
          isVisible={isModalVisible}
          title={editIndex !== null ? 'Edit Field' : 'Add Field'}
          onClose={() => setIsModalVisible(false)}
          footer={
            <>
              <ButtonWrapper>
                <Button
                  text="Cancel"
                  handleClick={() => setIsModalVisible(false)}
                  aria-label="Cancel"
                  variant="secondary"
                  size="sm"
                  disabled={false}
                />
              </ButtonWrapper>
              <ButtonWrapper>
                <Button
                  text="Submit"
                  handleClick={handleSubmit}
                  aria-label="Submit"
                  variant="primary"
                  size="sm"
                  disabled={false}
                />
              </ButtonWrapper>
            </>
          }
        >
          {errors.FieldName && <ErrorText>{errors.FieldName}</ErrorText>}
          <InputField
            label="Material Name"
            type="text"
            name="UniqueMaterialName"
            value={manureFormData.UniqueMaterialName || ''}
            onChange={handleChange}
          />
          {errors.ManureTypeName && <ErrorText>{errors.ManureTypeName}</ErrorText>}
          <Dropdown
            label="Manure Type"
            name="ManureTypeName"
            value={manureFormData.ManureTypeName || ''}
            options={manureTypeOptions}
            onChange={handleChange}
          />
          {errors.AnnualAmount && <ErrorText>{errors.AnnualAmount}</ErrorText>}
          <InputField
            label="Amount per year"
            type="text"
            name="AnnualAmount"
            value={(manureFormData.AnnualAmount ?? 0).toString() || ''}
            onChange={handleChange}
          />
          {manureFormData.ManureTypeName === '1' ? (
            <>
              {errors.Units && <ErrorText>{errors.Units}</ErrorText>}
              <Dropdown
                label="Units"
                name="Units"
                value={manureFormData.Units || ''}
                options={liquidManureDropdownOptions.map((manure) => ({
                  value: manure.inputunit ?? 0,
                  label: manure.inputunitname ?? '',
                }))}
                onChange={handleChange}
              />
            </>
          ) : (
            <>
              {errors.Units && <ErrorText>{errors.Units}</ErrorText>}

              <Dropdown
                label="Units"
                name="Units"
                value={manureFormData.Units || ''}
                options={solidManureDropdownOptions.map((manure) => ({
                  value: manure.inputunit ?? 0,
                  label: manure.inputunitname ?? '',
                }))}
                onChange={handleChange}
              />
            </>
          )}
          {manureFormData.ManureTypeName === '2' && (
            <>
              {errors.Moisture && <ErrorText>{errors.Moisture}</ErrorText>}
              <InputField
                label="Moisture (%)"
                type="text"
                name="Moisture"
                value={manureFormData.Moisture || ''}
                onChange={handleChange}
              />
            </>
          )}
        </Modal>
      </ViewCard>
    </>
  );
}
