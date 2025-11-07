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
import {
  Crop,
  CropType,
  NMPFileField,
  SelectOption,
  SoilTestMethods,
  SoilTestPhosphorousRange,
  SoilTestPotassiumRange,
} from '@/types';
import { InfoBox } from './soilTests.styles';
import useAppState from '@/hooks/useAppState';
import { CROPS, FIELD_LIST } from '@/constants/routes';
import SoilTestsModal from './SoilTestsModal';
import {
  sharedCalcCropReq,
  postprocessModalData,
} from '@/calculations/FieldAndSoil/Crops/Calculations';

export default function SoilTests() {
  const { state, dispatch } = useAppState();
  const navigate = useNavigate();
  const apiCache = useContext(APICacheContext);

  const [fields, setFields] = useState<NMPFileField[]>(
    structuredClone(state.nmpFile.years[0].fields) || [],
  );
  const [soilTestId, setSoilTestId] = useState<number>(
    fields.find((field) => field.soilTest !== undefined)?.soilTest?.soilTestId || 0,
  );

  const [crops, setCrops] = useState<Crop[]>([]);
  const [cropTypes, setCropTypes] = useState<CropType[]>([]);

  const [soilTestMethods, setSoilTestMethods] = useState<SelectOption<SoilTestMethods>[]>([]);
  const [phosphorousRanges, setPhosphorousRanges] = useState<SoilTestPhosphorousRange[]>([]);
  const [potassiumRanges, setPotassiumRanges] = useState<SoilTestPotassiumRange[]>([]);
  const [currentFieldIndex, setCurrentFieldIndex] = useState<number | null>(null);

  const handleEditRow = useCallback((e: { id: GridRowId; api: GridApiCommunity }) => {
    const index = e.api.getRowIndexRelativeToVisibleRows(e.id);
    setCurrentFieldIndex(index);
  }, []);

  const handleDeleteRow = useCallback((e: { id: GridRowId; api: GridApiCommunity }) => {
    setFields((prev) => {
      const index = e.api.getRowIndexRelativeToVisibleRows(e.id);
      if (prev[index].soilTest === undefined) return prev;

      const newList = [...prev];
      newList[index].soilTest = undefined;
      return newList;
    });
  }, []);

  const handleDialogClose = () => {
    setCurrentFieldIndex(null);
  };

  // IMPORTANT QUESTION: when the user changes the soil test method do we update the existing field.soilTest values?
  const soilTestMethodSelect = (value: number) => {
    setSoilTestId(value);
  };

  const handleNextPage = async () => {
    // Iterate through edited fields, then recalc crop reqs
    const updatedFields = await Promise.all(
      fields.map(async (fieldEle) => {
        const cropArray = await Promise.all(
          fieldEle.crops.map(async (cropEle) => {
            const matchedCrop = crops.find((ele) => ele.id === cropEle.cropId);
            const matchedCropType = cropTypes.find((ele) => ele.id === cropEle.cropTypeId);

            const cropEntry = await sharedCalcCropReq(
              matchedCrop!,
              cropEle,
              fieldEle,
              state.nmpFile.farmDetails.farmRegion,
              matchedCropType!,
            );
            if (cropEntry) {
              return postprocessModalData({
                ...cropEle,
                reqN: cropEntry.cropRequirementN,
                reqP2o5: cropEntry.cropRequirementP205,
                reqK2o: cropEntry.cropRequirementK2O,
                remN: cropEntry.cropRemovalN,
                remP2o5: cropEntry.cropRemovalP205,
                remK2o: cropEntry.cropRemovalK20,
              });
            }
            return null;
          }),
        );
        return { ...fieldEle, crops: cropArray.filter((ele) => !!ele) };
      }),
    );

    dispatch({
      type: 'SAVE_FIELDS',
      year: state.nmpFile.farmDetails.year,
      newFields: updatedFields,
    });
    navigate(CROPS);
  };

  const handlePreviousPage = () => {
    dispatch({ type: 'SAVE_FIELDS', year: state.nmpFile.farmDetails.year, newFields: fields });
    navigate(FIELD_LIST);
  };

  useEffect(() => {
    apiCache
      .callEndpoint('api/soiltestmethods/')
      .then((response: { status?: any; data: SoilTestMethods[] }) => {
        if (response.status === 200) {
          const { data } = response;
          setSoilTestMethods(
            data.map((method) => ({
              id: method.id,
              label: method.name,
              value: method,
            })),
          );
        }
      });
    apiCache
      .callEndpoint('api/soiltestpotassiumranges/')
      .then((response: { status?: any; data: SoilTestPotassiumRange[] }) => {
        if (response.status === 200) {
          setPotassiumRanges(response.data);
        }
      });
    apiCache
      .callEndpoint('api/soiltestphosphorousranges/')
      .then((response: { status?: any; data: SoilTestPhosphorousRange[] }) => {
        if (response.status === 200) {
          setPhosphorousRanges(response.data);
        }
      });
    apiCache.callEndpoint('api/crops/').then((response: { status?: any; data: Crop[] }) => {
      if (response.status === 200) {
        setCrops(response.data);
      }
    });
    apiCache.callEndpoint('api/croptypes/').then((response: { status?: any; data: CropType[] }) => {
      if (response.status === 200) {
        setCropTypes(response.data);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns: GridColDef[] = useMemo(
    () => [
      { field: 'fieldName', headerName: 'Field Name', width: 150, minWidth: 150, maxWidth: 400 },
      {
        field: 'soilTest',
        headerName: 'Sampling Month',
        valueGetter: (_value, row) => {
          let splitDateStr: string | undefined;
          if (row?.soilTest?.sampleDate) {
            const soilDate = new Date(row.soilTest.sampleDate).toDateString().split(' ');
            splitDateStr = `${soilDate[1]} ${soilDate[3]}`;
          }
          return splitDateStr || '';
        },
        width: 150,
        minWidth: 150,
        maxWidth: 300,
        sortable: false,
      },
      {
        field: 'valNO3H',
        headerName: 'NO₃-N (ppm)',
        valueGetter: (_value, row) => row.soilTest?.valNO3H,
        width: 120,
        minWidth: 100,
        maxWidth: 300,
        sortable: false,
      },
      {
        field: 'valP',
        headerName: 'P (ppm)',
        valueGetter: (_value, row) => {
          const ppm: number | undefined = row.soilTest?.valP;
          if (ppm !== undefined) {
            const range = phosphorousRanges.find((r) => ppm < r.upperlimit);
            const label = range?.rating || '';
            return `${ppm} ${label}`;
          }
          return ppm;
        },
        width: 110,
        minWidth: 110,
        maxWidth: 300,
        sortable: false,
      },
      {
        field: 'valK',
        headerName: 'K (ppm)',
        valueGetter: (_value, row) => {
          const ppm: number = row.soilTest?.valK;
          if (ppm !== undefined) {
            const range = potassiumRanges.find((r) => ppm < r.upperlimit);
            const label = range?.rating || '';
            return `${ppm} ${label}`;
          }
          return ppm;
        },
        width: 110,
        minWidth: 110,
        maxWidth: 300,
        sortable: false,
      },
      {
        field: 'valPH',
        headerName: 'pH',
        valueGetter: (_value, row) => row?.soilTest?.valPH,
        width: 80,
        minWidth: 80,
        maxWidth: 100,
        sortable: false,
      },
      {
        field: '',
        headerName: 'Actions',
        width: 150,
        renderCell: (e: { id: GridRowId; api: GridApiCommunity }) => {
          const index = e.api.getRowIndexRelativeToVisibleRows(e.id);
          const isRowHasSoilTest = fields[index].soilTest !== undefined;
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
    [fields, handleDeleteRow, handleEditRow, phosphorousRanges, potassiumRanges],
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
          initialFormData={fields[currentFieldIndex].soilTest}
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
