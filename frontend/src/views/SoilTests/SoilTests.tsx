/**
 * @summary This is the Soil Tests Tab
 */
import { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import 'react-datepicker/dist/react-datepicker.css';
import Grid from '@mui/material/Grid';
import { DataGrid, GridColDef, GridRowId } from '@mui/x-data-grid';
import { GridApiCommunity } from '@mui/x-data-grid/internals';
import { Button } from '@bcgov/design-system-react-components';
import {
  customTableStyle,
  formCss,
  formGridBreakpoints,
  tableActionButtonCss,
} from '../../common.styles';
import { Select, Tabs, View } from '../../components/common';
import { APICacheContext } from '@/context/APICacheContext';
import { NMPFileFieldData, SelectOption, SoilTestMethodsData } from '@/types';
import { InfoBox } from './soilTests.styles';
import useAppState from '@/hooks/useAppState';
import { CROPS, FIELD_LIST } from '@/constants/routes';
import SoilTestsModal from './SoilTestsModal';

export default function SoilTests() {
  const { state, dispatch } = useAppState();
  const navigate = useNavigate();
  const apiCache = useContext(APICacheContext);

  const [fields, setFields] = useState<NMPFileFieldData[]>(state.nmpFile.years[0].Fields || []);
  const [soilTestId, setSoilTestId] = useState<number>(
    fields.find((field) => field.SoilTest !== undefined)?.SoilTest?.soilTestId || 0,
  );

  const [soilTestMethods, setSoilTestMethods] = useState<SelectOption<SoilTestMethodsData>[]>([]);
  const [currentFieldIndex, setCurrentFieldIndex] = useState<number | null>(null);

  const handleEditRow = useCallback((e: { id: GridRowId; api: GridApiCommunity }) => {
    const index = e.api.getRowIndexRelativeToVisibleRows(e.id);
    setCurrentFieldIndex(index);
  }, []);

  const handleDeleteRow = useCallback((e: { id: GridRowId; api: GridApiCommunity }) => {
    setFields((prev) => {
      const index = e.api.getRowIndexRelativeToVisibleRows(e.id);
      if (prev[index].SoilTest === undefined) return prev;

      const newList = [...prev];
      newList[index].SoilTest = undefined;
      return newList;
    });
  }, []);

  const handleDialogClose = () => {
    setCurrentFieldIndex(null);
  };

  // IMPORTANT QUESTION: when the user changes the soil test method do we update the existing field.SoilTest values?
  const soilTestMethodSelect = (value: number) => {
    setSoilTestId(value);
  };

  const handleNextPage = () => {
    dispatch({ type: 'SAVE_FIELDS', year: state.nmpFile.farmDetails.Year!, newFields: fields });
    navigate(CROPS);
  };

  const handlePreviousPage = () => {
    dispatch({ type: 'SAVE_FIELDS', year: state.nmpFile.farmDetails.Year!, newFields: fields });
    navigate(FIELD_LIST);
  };

  useEffect(() => {
    apiCache.callEndpoint('api/soiltestmethods/').then((response: { status?: any; data: any }) => {
      if (response.status === 200) {
        const { data } = response;
        setSoilTestMethods(
          (data as SoilTestMethodsData[]).map((method) => ({
            id: method.id,
            label: method.name,
            value: method,
          })),
        );
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
                  onPress={() => handleEditRow(e)}
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
    [fields, handleDeleteRow, handleEditRow],
  );

  return (
    <View
      title="Field Information"
      handleBack={handlePreviousPage}
      handleNext={handleNextPage}
    >
      {currentFieldIndex !== null && (
        <SoilTestsModal
          currentFieldIndex={currentFieldIndex}
          initialFormData={fields[currentFieldIndex].SoilTest}
          soilTestId={soilTestId}
          soilTestMethods={soilTestMethods}
          setFields={setFields}
          handleDialogClose={handleDialogClose}
        />
      )}
      <Tabs
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
            aria-label="Select the lab used (soil test methods)"
            items={soilTestMethods}
            selectedKey={soilTestId}
            onSelectionChange={(id) => soilTestMethodSelect(id as number)}
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
    </View>
  );
}
