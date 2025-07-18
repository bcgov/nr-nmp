/* eslint-disable react-hooks/exhaustive-deps */
/**
 * @summary This is the Soil Tests Tab
 */
import { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import { DataGrid, GridColDef, GridRowId } from '@mui/x-data-grid';
import { GridApiCommunity } from '@mui/x-data-grid/internals';
import {
  Button,
  ButtonGroup,
  Dialog,
  Modal,
  TextField,
} from '@bcgov/design-system-react-components';
import {
  customTableStyle,
  formCss,
  formGridBreakpoints,
  modalDividerStyle,
  modalHeaderStyle,
  modalPaddingStyle,
  tableActionButtonCss,
} from '../../common.styles';
import {
  AppTitle,
  PageTitle,
  ProgressStepper,
  Select,
  TabsMaterial,
} from '../../components/common';
import { APICacheContext } from '@/context/APICacheContext';
import { NMPFileFieldData, NMPFileSoilTestData, SoilTestMethodsData } from '@/types';
import { InfoBox, StyledContent, StyledDatePicker } from './soilTests.styles';
import useAppState from '@/hooks/useAppState';
import { CROPS, FIELD_LIST } from '@/constants/routes';
import { FormErrors } from '@/types/Crops';

const EMPTY_SOIL_TEST_FORM: Omit<NMPFileSoilTestData, 'soilTestId'> = {
  sampleDate: undefined,
  valNO3H: '',
  valP: '',
  valK: '',
  valPH: '',
};

export default function SoilTests() {
  const { state, dispatch } = useAppState();
  const navigate = useNavigate();
  const apiCache = useContext(APICacheContext);

  const [fields, setFields] = useState<NMPFileFieldData[]>(state.nmpFile.years[0].Fields || []);
  const [soilTestId, setSoilTestId] = useState<number>(
    fields.find((field) => field.SoilTest !== undefined)?.SoilTest?.soilTestId || 0,
  );

  const [soilTestMethods, setSoilTestMethods] = useState<SoilTestMethodsData[]>([]);
  const [currentFieldIndex, setCurrentFieldIndex] = useState<number | null>(null);

  const [formData, setFormData] =
    useState<Omit<NMPFileSoilTestData, 'soilTestId'>>(EMPTY_SOIL_TEST_FORM);
  const [formErrors, setFormErrors] = useState<Omit<FormErrors, 'soilTestId'>>({});
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const handleEditRow = useCallback(
    (e: { id: GridRowId; api: GridApiCommunity }) => {
      const index = e.api.getRowIndexRelativeToVisibleRows(e.id);
      setCurrentFieldIndex(index);
      setFormData(fields[index].SoilTest || EMPTY_SOIL_TEST_FORM);
      setIsDialogOpen(true);
    },
    [fields],
  );

  const handleDeleteRow = (e: { id: GridRowId; api: GridApiCommunity }) => {
    setFields((prev) => {
      const index = e.api.getRowIndexRelativeToVisibleRows(e.id);
      if (fields[index].SoilTest === undefined) return prev;

      const newList = [...prev];
      newList[index].SoilTest = undefined;
      return newList;
    });
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setFormErrors({});
    setFormData(EMPTY_SOIL_TEST_FORM);
  };

  // IMPORTANT QUESTION: when the user changes the soil test method do we update the existing field.SoilTest values?
  const soilTestMethodSelect = (value: number) => {
    setSoilTestId(value);
  };

  const handleFormFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isFormDataValid = () => {
    let phCheck = '';
    if (!formData.valPH || Number.isNaN(Number(formData.valPH))) {
      phCheck = 'pH is required and must be a number';
    }
    if (Number(formData.valPH) < 0 || Number(formData.valPH) > 14) {
      phCheck = 'pH must be between 0 and 14';
    }

    const newFormErrors = {
      ...EMPTY_SOIL_TEST_FORM,
      sampleDate: !formData.sampleDate ? 'Sample Month is required' : '',
      valNO3H: !formData.valNO3H ? 'NO3-N (ppm) is required and must be a number' : '',
      valP: !formData.valP ? 'P (ppm) is required and must be a number' : '',
      valK: !formData.valK ? 'K (ppm) is required and must be a number' : '',
      valPH: phCheck,
    };

    setFormErrors(newFormErrors);

    // Return false if errors exist
    return !Object.values(newFormErrors).some((ele) => ele);
  };

  const handleFormFieldSubmit = () => {
    if (!isFormDataValid()) return;

    // Calculate convertedKelownaP directly
    const lessThan72 = soilTestMethods.find(
      (method) => method.id === Number(soilTestId),
    )?.converttokelownaphlessthan72;
    const greaterThan72 = soilTestMethods.find(
      (method) => method.id === Number(soilTestId),
    )?.converttokelownaphgreaterthan72;

    let convertedKelownaP = formData.valP;

    if (Number(formData.valPH) < 7.2 && lessThan72 !== undefined) {
      convertedKelownaP = (Number(formData.valP) * lessThan72).toString();
    } else if (Number(formData.valPH) >= 7.2 && greaterThan72 !== undefined) {
      convertedKelownaP = (Number(formData.valP) * greaterThan72).toString();
    }

    // Calculate converted Kelowna K value (if you need it)
    const convertedKelownaK =
      soilTestMethods.find((method) => method.id === Number(soilTestId))?.converttokelownak !==
      undefined
        ? (
            Number(formData.valK) *
            soilTestMethods.find((method) => method.id === Number(soilTestId))!.converttokelownak
          ).toString()
        : formData.valK;

    setFormData((prev) => ({
      ...prev,
      convertedKelownaP,
      convertedKelownaK,
    }));

    setFields((prev) => {
      const newList = [...prev];
      if (currentFieldIndex !== null)
        newList[currentFieldIndex].SoilTest = { ...formData, soilTestId };
      return newList;
    });
    handleDialogClose();
  };

  const handleNextPage = () => {
    dispatch({ type: 'SAVE_FIELDS', year: state.nmpFile.farmDetails.Year!, newFields: fields });
    navigate(CROPS);
  };

  const handlePreviousPage = () => {
    navigate(FIELD_LIST);
  };

  useEffect(() => {
    apiCache.callEndpoint('api/soiltestmethods/').then((response: { status?: any; data: any }) => {
      if (response.status === 200) {
        const { data } = response;
        setSoilTestMethods(data);
      }
    });
  }, []);

  const columns: GridColDef[] = useMemo(
    () => [
      { field: 'FieldName', headerName: 'Field Name', width: 150, minWidth: 150, maxWidth: 400 },
      {
        field: 'SoilTest',
        headerName: 'Sampling Month',
        valueGetter: (_value, row) =>
          row?.SoilTest?.sampleDate.toLocaleDateString('en-CA', {
            year: 'numeric',
            month: 'long',
          }),
        width: 150,
        minWidth: 150,
        maxWidth: 300,
        sortable: false,
      },
      {
        field: 'valNO3H',
        headerName: 'NO3-N (ppm)',
        valueGetter: (_value, row) => row?.SoilTest?.valNO3H,
        width: 120,
        minWidth: 100,
        maxWidth: 300,
      },
      {
        field: 'valP',
        headerName: 'P (ppm)',
        valueGetter: (_value, row) => row?.SoilTest?.valP,
        width: 110,
        minWidth: 110,
        maxWidth: 300,
      },
      {
        field: 'valK',
        headerName: 'K (ppm)',
        valueGetter: (_value, row) => row?.SoilTest?.valK,
        width: 110,
        minWidth: 110,
        maxWidth: 300,
      },
      {
        field: 'valPH',
        headerName: 'pH',
        valueGetter: (_value, row) => row?.SoilTest?.valPH,
        width: 80,
        minWidth: 80,
        maxWidth: 100,
      },
      {
        field: '',
        headerName: 'Actions',
        width: 150,
        renderCell: (e: { id: GridRowId; api: GridApiCommunity }) => {
          const index = e.api.getRowIndexRelativeToVisibleRows(e.id);
          const isRowHasSoilTest = fields[index].SoilTest !== undefined;
          return (
            <div>
              {isRowHasSoilTest ? (
                <div>
                  <FontAwesomeIcon
                    css={tableActionButtonCss}
                    onClick={() => handleEditRow(e)}
                    icon={faEdit}
                  />
                  <FontAwesomeIcon
                    css={tableActionButtonCss}
                    onClick={() => handleDeleteRow(e)}
                    icon={faTrash}
                  />
                </div>
              ) : (
                <Button
                  variant="primary"
                  size="small"
                  onClick={() => handleEditRow(e)}
                >
                  Add soil test
                </Button>
              )}
            </div>
          );
        },
        sortable: false,
        resizable: false,
      },
    ],
    [],
  );

  return (
    <StyledContent>
      <ProgressStepper />
      <AppTitle />
      <PageTitle title="Field Information" />
      <Modal
        isDismissable
        isOpen={isDialogOpen}
        onOpenChange={handleDialogClose}
      >
        <Dialog
          isCloseable
          role="dialog"
        >
          <div css={modalPaddingStyle}>
            <span css={modalHeaderStyle}>Add Field</span>
            <Divider
              aria-hidden="true"
              component="div"
              css={modalDividerStyle}
            />
            <div css={formCss}>
              <Grid
                container
                spacing={1}
              >
                <Grid size={formGridBreakpoints}>
                  <span
                    className={`bcds-react-aria-Select--Label ${formErrors.sampleDate ? '--error' : ''}`}
                  >
                    Sample Month
                  </span>
                  <div css={{ label: { margin: '0' } }}>
                    <StyledDatePicker>
                      <ReactDatePicker
                        selected={formData.sampleDate}
                        onChange={(e: any) => {
                          handleFormFieldChange('sampleDate', e);
                        }}
                        dateFormat="MM/yyyy"
                        showMonthYearPicker
                        wrapperClassName="monthPicker"
                      />
                    </StyledDatePicker>
                  </div>
                </Grid>
                <Grid size={formGridBreakpoints}>
                  <span
                    className={`bcds-react-aria-Select--Label ${formErrors.valNO3H ? '--error' : ''}`}
                  >
                    NO3-N (ppm), nitrate-nitrogen
                  </span>
                  <TextField
                    isRequired
                    type="number"
                    name="valNO3H"
                    value={formData.valNO3H}
                    onChange={(e) => handleFormFieldChange('valNO3H', e)}
                  />
                </Grid>
                <Grid size={formGridBreakpoints}>
                  <span
                    className={`bcds-react-aria-Select--Label ${formErrors.valP ? '--error' : ''}`}
                  >
                    P (ppm), phosphorus
                  </span>
                  <TextField
                    isRequired
                    type="number"
                    name="valP"
                    value={formData.valP}
                    onChange={(e) => handleFormFieldChange('valP', e)}
                  />
                </Grid>
                <Grid size={formGridBreakpoints}>
                  <span
                    className={`bcds-react-aria-Select--Label ${formErrors.valK ? '--error' : ''}`}
                  >
                    K (ppm), potassium
                  </span>
                  <TextField
                    isRequired
                    type="number"
                    name="valK"
                    value={formData.valK}
                    onChange={(e) => handleFormFieldChange('valK', e)}
                  />
                </Grid>
                <Grid size={formGridBreakpoints}>
                  <span
                    className={`bcds-react-aria-Select--Label ${formErrors.valPH ? '--error' : ''}`}
                  >
                    pH
                  </span>
                  <TextField
                    isRequired
                    type="number"
                    name="valPH"
                    value={formData.valPH}
                    onChange={(e) => handleFormFieldChange('valPH', e)}
                  />
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
                  variant="secondary"
                  onPress={handleDialogClose}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onPress={handleFormFieldSubmit}
                >
                  Confirm
                </Button>
              </ButtonGroup>
            </div>
          </div>
        </Dialog>
      </Modal>
      <TabsMaterial
        activeTab={1}
        tabLabel={['Field List', 'Soil Tests', 'Crops']}
      />
      {!soilTestId && (
        <InfoBox>
          Do you have soil test from within the past 3 years?
          <ul>
            <li>Yes - Select the lab used (soil test methods)</li>
            <li>No - Click Next</li>
          </ul>
        </InfoBox>
      )}
      <Grid
        container
        spacing={2}
      >
        <Grid
          css={formCss}
          size={formGridBreakpoints}
        >
          <Select
            name="soilTest"
            items={soilTestMethods.map((method) => ({
              id: method.id,
              label: method.name,
            }))}
            selectedKey={soilTestId}
            onSelectionChange={(id) => {
              soilTestMethodSelect(id as number);
            }}
          />
        </Grid>
      </Grid>

      {soilTestId !== 0 && (
        <DataGrid
          sx={{ ...customTableStyle, marginTop: '1.25rem' }}
          rows={fields}
          columns={columns}
          getRowId={() => crypto.randomUUID()}
          disableRowSelectionOnClick
          disableColumnMenu
          hideFooterPagination
          hideFooter
        />
      )}
      <ButtonGroup
        alignment="start"
        orientation="horizontal"
      >
        <Button
          size="medium"
          aria-label="Back"
          variant="secondary"
          onPress={handlePreviousPage}
        >
          Back
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
