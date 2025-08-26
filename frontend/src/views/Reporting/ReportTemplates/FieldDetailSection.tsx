import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import type { CalculateNutrientsColumn, NMPFileFieldData, SoilTestMethodsData } from '@/types';
import { booleanChecker } from '@/utils/utils';
import { APICacheContext } from '@/context/APICacheContext';
import { MANURE_APPLICATION_FREQ } from '@/constants';
import { findBalanceMessage } from '@/views/CalculateNutrients/utils';
import {
  customTableStyle,
  Message,
  FieldContainer,
  FieldInfoSection,
  FieldInfoItem,
  SectionTitle,
  TableHeader,
  SubsectionLabel,
} from '../reporting.styles';
import { NutrientMessage } from '@/views/CalculateNutrients/nutrientMessages';

// Helper function to expand fertigations into individual applications with dates
const expandFertigationsToApplications = (fertigations: any[]) =>
  fertigations.reduce((accRows, fertigation, index) => {
    const nutrientColumns: CalculateNutrientsColumn = {
      name: fertigation.name,
      reqN: fertigation.reqN,
      reqP2o5: fertigation.reqP2o5,
      reqK2o: fertigation.reqK2o,
      remN: fertigation.remN,
      remP2o5: fertigation.remP2o5,
      remK2o: fertigation.remK2o,
    };

    // Determine day jump based on schedule
    let dayJump;
    switch (fertigation.schedule) {
      case 4: // Daily
        dayJump = 1;
        break;
      case 3: // Weekly
        dayJump = 7;
        break;
      case 2: // Biweekly
        dayJump = 14;
        break;
      default: // Monthly
        dayJump = undefined;
    }

    const date = new Date(fertigation.startDate || new Date());
    for (let i = 0; i < fertigation.eventsPerSeason; i += 1) {
      const splitDateStr = date.toDateString().split(' ');
      // Format is like "01 Jan"
      const formattedDate = `${splitDateStr[2]} ${splitDateStr[1]}`;

      accRows.push({
        id: `${index}-${i}`,
        name: `${fertigation.name} (${formattedDate})`,
        date: formattedDate,
        application: i + 1,
        totalApplications: fertigation.eventsPerSeason,
        reqN: nutrientColumns.reqN,
        reqP2o5: nutrientColumns.reqP2o5,
        reqK2o: nutrientColumns.reqK2o,
        remN: nutrientColumns.remN,
        remP2o5: nutrientColumns.remP2o5,
        remK2o: nutrientColumns.remK2o,
      });

      if (dayJump) {
        date.setDate(date.getDate() + dayJump);
      } else {
        date.setMonth(date.getMonth() + 1);
      }
    }
    return accRows;
  }, [] as any[]);

const CROP_COLUMNS: GridColDef[] = [
  { field: 'name', headerName: 'Crop Name', width: 200 },
  { field: 'cropTypeName', headerName: 'Crop Type', width: 180 },
  { field: 'yield', headerName: 'Yield', width: 120 },
  {
    field: 'nCredit',
    headerName: 'Previous crop ploughed down (N credit)',
    minWidth: 200,
  },
];

const SOIL_TEST_COLUMNS: GridColDef[] = [
  { field: 'valNO3H', headerName: 'Nitrate-N', width: 180, minWidth: 150 },
  { field: 'valP', headerName: 'Phosphorus', width: 180, minWidth: 150 },
  { field: 'valK', headerName: 'Potassium', width: 180, minWidth: 150 },
  { field: 'valPH', headerName: 'pH', width: 120, minWidth: 100 },
];

const LEAF_TISSUE_COLUMNS: GridColDef[] = [
  { field: 'name', headerName: 'Crop Name', width: 250, minWidth: 200 },
  { field: 'leafTissueP', headerName: 'Phosphorus (%)', width: 180, minWidth: 150 },
  { field: 'leafTissueK', headerName: 'Potassium (%)', width: 180, minWidth: 150 },
];

const CALC_COLUMNS: GridColDef[] = [
  { field: 'name', width: 190, renderHeader: () => null },
  {
    field: 'reqN',
    width: 90,
    renderHeader: () => <span>N</span>,
  },
  {
    field: 'reqP2o5',
    width: 90,
    renderHeader: () => (
      <span>
        P<sub>2</sub>O<sub>5</sub>
      </span>
    ),
  },
  {
    field: 'reqK2o',
    width: 90,
    renderHeader: () => (
      <span>
        K<sub>2</sub>O
      </span>
    ),
  },
  {
    field: 'remN',
    width: 90,
    renderHeader: () => <span>N</span>,
  },
  {
    field: 'remP2o5',
    width: 90,
    renderHeader: () => (
      <span>
        P<sub>2</sub>O<sub>5</sub>
      </span>
    ),
  },
  {
    field: 'remK2o',
    width: 90,
    renderHeader: () => (
      <span>
        K<sub>2</sub>O
      </span>
    ),
  },
];

// Columns for fertigation summary
const FERTIGATION_SUMMARY_COLUMNS: GridColDef[] = [
  {
    field: 'name',
    headerName: 'Fertilizer',
    width: 180,
    flex: 1,
  },
  {
    field: 'schedule',
    headerName: 'Schedule',
    width: 90,
    headerAlign: 'center',
    align: 'center',
  },
  {
    field: 'eventsPerSeason',
    headerName: 'Apps',
    width: 70,
    headerAlign: 'center',
    align: 'center',
  },
  {
    field: 'startDate',
    headerName: 'Start Date',
    width: 100,
    headerAlign: 'center',
    align: 'center',
    valueGetter: (value) => {
      if (!value || value === 'Not specified') return 'Not specified';
      const date = new Date(value);
      return date.toLocaleDateString();
    },
  },
  {
    field: 'reqN',
    headerName: 'N (lb/ac)',
    width: 90,
    headerAlign: 'center',
    align: 'center',
  },
  {
    field: 'reqP2o5',
    headerName: 'P₂O₅ (lb/ac)',
    width: 100,
    headerAlign: 'center',
    align: 'center',
  },
  {
    field: 'reqK2o',
    headerName: 'K₂O (lb/ac)',
    width: 100,
    headerAlign: 'center',
    align: 'center',
  },
];

const FERTIGATION_SCHEDULE_COLUMNS: GridColDef[] = [
  {
    field: 'name',
    headerName: 'Fertilizer',
    width: 200,
    renderCell: (params) => {
      const { row } = params;
      return (
        <div style={{ lineHeight: 1.2 }}>
          <div style={{ fontWeight: 'bold' }}>{row.name.split(' (')[0]}</div>
          <div style={{ fontSize: '0.8em', color: '#666' }}>
            Application {row.application} of {row.totalApplications}
          </div>
        </div>
      );
    },
  },
  {
    field: 'date',
    headerName: 'Date',
    width: 80,
    headerAlign: 'center',
    align: 'center',
  },
  {
    field: 'reqN',
    width: 90,
    headerAlign: 'center',
    align: 'center',
    renderHeader: () => <span>N</span>,
  },
  {
    field: 'reqP2o5',
    width: 90,
    headerAlign: 'center',
    align: 'center',
    renderHeader: () => (
      <span>
        P<sub>2</sub>O<sub>5</sub>
      </span>
    ),
  },
  {
    field: 'reqK2o',
    width: 90,
    headerAlign: 'center',
    align: 'center',
    renderHeader: () => (
      <span>
        K<sub>2</sub>O
      </span>
    ),
  },
  {
    field: 'remN',
    width: 90,
    headerAlign: 'center',
    align: 'center',
    renderHeader: () => <span>N</span>,
  },
  {
    field: 'remP2o5',
    width: 90,
    headerAlign: 'center',
    align: 'center',
    renderHeader: () => (
      <span>
        P<sub>2</sub>O<sub>5</sub>
      </span>
    ),
  },
  {
    field: 'remK2o',
    width: 90,
    headerAlign: 'center',
    align: 'center',
    renderHeader: () => (
      <span>
        K<sub>2</sub>O
      </span>
    ),
  },
];

const BALANCE_COLUMNS: GridColDef[] = [
  {
    field: 'name',
    headerName: '',
    width: 190,
    renderCell: (params) => <span style={{ fontWeight: 'bold' }}>{params.value}</span>,
  },
  {
    field: 'reqN',
    headerName: 'N',
    width: 90,
    headerAlign: 'center',
    align: 'center',
    renderCell: (params) => <span style={{ fontWeight: 'bold' }}>{params.value}</span>,
  },
  {
    field: 'reqP2o5',
    headerName: 'P₂O₅',
    width: 90,
    headerAlign: 'center',
    align: 'center',
    renderCell: (params) => <span style={{ fontWeight: 'bold' }}>{params.value}</span>,
  },
  {
    field: 'reqK2o',
    headerName: 'K₂O',
    width: 90,
    headerAlign: 'center',
    align: 'center',
    renderCell: (params) => <span style={{ fontWeight: 'bold' }}>{params.value}</span>,
  },
  {
    field: 'remN',
    headerName: 'N',
    width: 90,
    headerAlign: 'center',
    align: 'center',
    renderCell: (params) => <span style={{ fontWeight: 'bold' }}>{params.value}</span>,
  },
  {
    field: 'remP2o5',
    headerName: 'P₂O₅',
    width: 90,
    headerAlign: 'center',
    align: 'center',
    renderCell: (params) => <span style={{ fontWeight: 'bold' }}>{params.value}</span>,
  },
  {
    field: 'remK2o',
    headerName: 'K₂O',
    width: 90,
    headerAlign: 'center',
    align: 'center',
    renderCell: (params) => <span style={{ fontWeight: 'bold' }}>{params.value}</span>,
  },
];

export default function CompleteReportTemplate({
  field,
  year,
}: {
  field: NMPFileFieldData;
  year: string;
}) {
  const {
    Area,
    Comment,
    Crops,
    Fertilizers,
    Fertigations,
    FieldName,
    OtherNutrients,
    PreviousYearManureApplicationFrequency,
    SoilTest,
  } = field;
  const apiCache = useContext(APICacheContext);
  const [soilTestMethods, setSoilTestMethods] = useState<SoilTestMethodsData[]>([]);
  const [balanceMessages, setBalanceMessages] = useState<Array<NutrientMessage>>([]);

  // Filter crops that have leaf tissue test data
  const cropsWithLeafTests = Crops.filter(
    (crop) =>
      crop.hasLeafTest && (crop.leafTissueP !== undefined || crop.leafTissueK !== undefined),
  );

  // Expand fertigations into individual applications
  const expandedFertigations = useMemo(
    () => expandFertigationsToApplications(Fertigations),
    [Fertigations],
  );

  // Create fertigation summary for display
  const fertigationSummary = useMemo(() => {
    const getScheduleName = (scheduleId: number) => {
      switch (scheduleId) {
        case 4:
          return 'Daily';
        case 3:
          return 'Weekly';
        case 2:
          return 'Biweekly';
        case 1:
          return 'Monthly';
        default:
          return 'Monthly';
      }
    };

    return Fertigations.map((fertigation) => ({
      id: fertigation.name,
      name: fertigation.name,
      schedule: getScheduleName(fertigation.schedule || 1),
      eventsPerSeason: fertigation.eventsPerSeason,
      startDate: fertigation.startDate || 'Not specified',
      reqN: fertigation.reqN,
      reqP2o5: fertigation.reqP2o5,
      reqK2o: fertigation.reqK2o,
      remN: fertigation.remN,
      remP2o5: fertigation.remP2o5,
      remK2o: fertigation.remK2o,
    }));
  }, [Fertigations]);

  const balanceRow: CalculateNutrientsColumn = useMemo(() => {
    const allRows = [...Crops, ...Fertilizers, ...expandedFertigations, ...OtherNutrients];
    return {
      name: 'Balance',
      reqN: allRows.reduce((sum, row) => sum + (row.reqN ?? 0), 0),
      reqP2o5: allRows.reduce((sum, row) => sum + (row.reqP2o5 ?? 0), 0),
      reqK2o: allRows.reduce((sum, row) => sum + (row.reqK2o ?? 0), 0),
      remN: allRows.reduce((sum, row) => sum + (row.remN ?? 0), 0),
      remP2o5: allRows.reduce((sum, row) => sum + (row.remP2o5 ?? 0), 0),
      remK2o: allRows.reduce((sum, row) => sum + (row.remK2o ?? 0), 0),
    };
  }, [Crops, Fertilizers, expandedFertigations, OtherNutrients]);

  const getMessage = useCallback((balanceType: string, balanceValue: number) => {
    const message = findBalanceMessage(balanceType, balanceValue);
    if (message && message.Icon !== '/good.svg') {
      setBalanceMessages((prev) => [
        ...prev,
        {
          ...message,
          Text: message.Text.replace('{0}', Math.abs(balanceValue ?? 0).toFixed(1)),
          Icon: message.Icon,
        },
      ]);
    }
  }, []);

  useEffect(() => {
    setBalanceMessages([]);

    Object.entries(balanceRow).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'name') {
        getMessage(key, value as number);
      }
    });
  }, [balanceRow, getMessage]);

  useEffect(() => {
    apiCache.callEndpoint('api/soiltestmethods/').then((response: { status?: any; data: any }) => {
      if (response.status === 200) {
        const { data } = response;
        setSoilTestMethods(data);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <FieldContainer>
      <FieldInfoSection>
        <FieldInfoItem>
          <span style={{ fontWeight: 'bold', textDecoration: 'underline' }}>
            Field Name: {FieldName}
          </span>
        </FieldInfoItem>
        <FieldInfoItem>
          <span>
            <strong>Planning Year:</strong> {year}
          </span>
        </FieldInfoItem>
        <FieldInfoItem>
          <span>
            <strong>Field Area:</strong> {Area}
          </span>
        </FieldInfoItem>
        <FieldInfoItem>
          <span>
            <strong>Application Frequency:</strong>{' '}
            {
              MANURE_APPLICATION_FREQ.find(
                (ele) => ele.id === PreviousYearManureApplicationFrequency,
              )?.label
            }
          </span>
        </FieldInfoItem>
        <FieldInfoItem>
          <span>
            <strong>Comments:</strong> {Comment}
          </span>
        </FieldInfoItem>
      </FieldInfoSection>

      <SectionTitle>Crop Information</SectionTitle>
      <DataGrid
        sx={{ ...customTableStyle }}
        rows={Crops}
        columns={CROP_COLUMNS}
        getRowId={() => crypto.randomUUID()}
        disableRowSelectionOnClick
        disableColumnMenu
        hideFooterPagination
        hideFooter
        getRowHeight={() => 'auto'}
        columnHeaderHeight={80}
        disableAutosize
        disableColumnSorting
        disableColumnSelector
      />

      {booleanChecker(SoilTest) ? (
        <>
          <SectionTitle>Soil Test Information</SectionTitle>
          <FieldInfoItem style={{ marginBottom: '12px' }}>
            <strong>Soil Test Results:</strong>{' '}
            {SoilTest?.sampleDate
              ? new Date(SoilTest.sampleDate).toLocaleDateString('sv-SE', { dateStyle: 'short' })
              : 'N/A'}
          </FieldInfoItem>
          <FieldInfoItem style={{ marginBottom: '16px' }}>
            <strong>Soil Test Method:</strong>{' '}
            {soilTestMethods.find((ele) => ele.id === SoilTest?.soilTestId)?.name}
          </FieldInfoItem>
          <DataGrid
            sx={{ ...customTableStyle }}
            rows={[SoilTest]}
            columns={SOIL_TEST_COLUMNS}
            getRowId={() => crypto.randomUUID()}
            disableRowSelectionOnClick
            disableColumnMenu
            hideFooterPagination
            hideFooter
            getRowHeight={() => 'auto'}
            disableAutosize
            disableColumnSorting
            disableColumnSelector
          />
        </>
      ) : null}

      {cropsWithLeafTests.length > 0 ? (
        <>
          <SectionTitle>Leaf Tissue Test Information</SectionTitle>
          <DataGrid
            sx={{ ...customTableStyle }}
            rows={cropsWithLeafTests}
            columns={LEAF_TISSUE_COLUMNS}
            getRowId={() => crypto.randomUUID()}
            disableRowSelectionOnClick
            disableColumnMenu
            hideFooterPagination
            hideFooter
            getRowHeight={() => 'auto'}
            disableAutosize
            disableColumnSorting
            disableColumnSelector
          />
        </>
      ) : null}

      <SectionTitle>Nutrient Requirements and Removal</SectionTitle>
      <TableHeader>
        <div style={{ width: 180 }} />
        <div style={{ width: 260 }}>
          Agronomic (lb/ac)
          <br />
        </div>
        <div style={{ width: 305 }}>
          Crop Removal (lb/ac)
          <br />
        </div>
      </TableHeader>

      <div>
        {Crops.length > 0 && (
          <DataGrid
            sx={{ ...customTableStyle }}
            rows={Crops}
            columns={CALC_COLUMNS}
            getRowId={() => crypto.randomUUID()}
            disableRowSelectionOnClick
            disableColumnMenu
            hideFooterPagination
            hideFooter
            getRowHeight={() => 'auto'}
            disableAutosize
            disableColumnSorting
            disableColumnSelector
          />
        )}

        {Fertilizers.length > 0 && (
          <>
            <SubsectionLabel>Fertilizers</SubsectionLabel>
            <DataGrid
              sx={{ ...customTableStyle }}
              rows={Fertilizers}
              columns={CALC_COLUMNS}
              getRowId={() => crypto.randomUUID()}
              disableRowSelectionOnClick
              disableColumnMenu
              columnHeaderHeight={Crops.length > 0 ? 0 : 28}
              hideFooterPagination
              hideFooter
              getRowHeight={() => 'auto'}
              disableAutosize
              disableColumnSorting
              disableColumnSelector
            />
          </>
        )}

        {Fertigations.length > 0 && (
          <>
            <SectionTitle>Fertigation</SectionTitle>
            <SubsectionLabel>Fertigation Summary</SubsectionLabel>
            <DataGrid
              sx={{
                ...customTableStyle,
                width: '100%',
                '& .MuiDataGrid-main': {
                  overflow: 'visible',
                },
                '& .MuiDataGrid-virtualScroller': {
                  overflow: 'visible',
                },
                '& .MuiDataGrid-columnHeaders': {
                  overflow: 'visible',
                },
              }}
              rows={fertigationSummary}
              columns={FERTIGATION_SUMMARY_COLUMNS}
              getRowId={(row) => row.id}
              disableRowSelectionOnClick
              disableColumnMenu
              hideFooterPagination
              hideFooter
              getRowHeight={() => 'auto'}
              autoHeight
              disableColumnSorting
              disableColumnSelector
            />
          </>
        )}

        {expandedFertigations.length > 0 && (
          <>
            <SubsectionLabel>Fertigation Application Schedule</SubsectionLabel>
            <DataGrid
              sx={{ ...customTableStyle }}
              rows={expandedFertigations}
              columns={FERTIGATION_SCHEDULE_COLUMNS}
              getRowId={(row) => row.id}
              disableRowSelectionOnClick
              disableColumnMenu
              hideFooterPagination
              hideFooter
              getRowHeight={() => 'auto'}
              disableAutosize
              disableColumnSorting
              disableColumnSelector
            />
          </>
        )}

        {OtherNutrients.length > 0 && (
          <>
            <SubsectionLabel>Nutrient Sources</SubsectionLabel>
            <DataGrid
              sx={{ ...customTableStyle }}
              rows={OtherNutrients}
              columns={CALC_COLUMNS}
              getRowId={() => crypto.randomUUID()}
              disableRowSelectionOnClick
              disableColumnMenu
              columnHeaderHeight={
                Crops.length || Fertilizers.length || expandedFertigations.length ? 0 : 28
              }
              hideFooterPagination
              hideFooter
              getRowHeight={() => 'auto'}
              disableAutosize
              disableColumnSorting
              disableColumnSelector
            />
          </>
        )}

        <SubsectionLabel>Balance</SubsectionLabel>
        <DataGrid
          sx={{ ...customTableStyle }}
          rows={[balanceRow]}
          columns={BALANCE_COLUMNS}
          getRowId={() => crypto.randomUUID()}
          disableRowSelectionOnClick
          disableColumnMenu
          hideFooterPagination
          hideFooter
          disableColumnSorting
          getRowHeight={() => 'auto'}
          scrollbarSize={0}
        />

        {balanceMessages.length > 0 && (
          <div style={{ marginTop: '16px', marginBottom: '16px' }}>
            {balanceMessages.map((msg) => (
              <Message key={msg.Id}>{msg.Text}</Message>
            ))}
          </div>
        )}
      </div>
    </FieldContainer>
  );
}
