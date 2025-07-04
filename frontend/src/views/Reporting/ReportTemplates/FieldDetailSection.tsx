import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import type { CalculateNutrientsColumn, NMPFileFieldData, SoilTestMethodsData } from '@/types';
import { booleanChecker } from '@/utils/utils';
import { APICacheContext } from '@/context/APICacheContext';
import { MANURE_APPLICATION_FREQ } from '@/constants';
import { findBalanceMessage } from '@/views/CalculateNutrients/utils';
import { customTableStyle, Message } from '../reporting.styles';
import { NutrientMessage } from '@/views/CalculateNutrients/nutrientMessages';

const HIDE_COLUMN_CSS = {
  '& .MuiDataGrid-row--borderBottom': {
    height: '0px !important',
  },
};

const CROP_COLUMNS: GridColDef[] = [
  { field: 'name', headerName: 'Crop Name', width: 200 },
  { field: 'cropTypeName', headerName: 'Crop Type', width: 150 },
  { field: 'yield', headerName: 'Yield', width: 100 },
  { field: 'nCredit', headerName: 'Previous crop ploughed down (N credit)', width: 150 },
];

const SOIL_TEST_COLUMNS: GridColDef[] = [
  { field: 'valNO3H', headerName: 'Nitrate-N', width: 200 },
  { field: 'valP', headerName: 'Phosphorus', width: 150 },
  { field: 'valK', headerName: 'Potassium', width: 150 },
  { field: 'valPH', headerName: 'pH', width: 150 },
];

const CALC_COLUMNS: GridColDef[] = [
  { field: 'name', width: 230, minWidth: 200, maxWidth: 300, renderHeader: () => null },
  {
    field: 'reqN',
    width: 75,
    minWidth: 75,
    maxWidth: 100,
    renderHeader: () => <span>N</span>,
  },
  {
    field: 'reqP2o5',
    width: 75,
    minWidth: 75,
    maxWidth: 100,
    renderHeader: () => (
      <span>
        P<sub>2</sub>O<sub>5</sub>
      </span>
    ),
  },
  {
    field: 'reqK2o',
    width: 75,
    minWidth: 75,
    maxWidth: 100,
    renderHeader: () => (
      <span>
        K<sub>2</sub>O
      </span>
    ),
  },
  {
    field: 'remN',
    width: 75,
    minWidth: 75,
    maxWidth: 100,
    renderHeader: () => <span>N</span>,
  },
  {
    field: 'remP2o5',
    width: 75,
    minWidth: 75,
    maxWidth: 100,
    renderHeader: () => (
      <span>
        P<sub>2</sub>O<sub>5</sub>
      </span>
    ),
  },
  {
    field: 'remK2o',
    width: 75,
    minWidth: 75,
    maxWidth: 130,
    renderHeader: () => (
      <span>
        K<sub>2</sub>O
      </span>
    ),
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
    FieldName,
    OtherNutrients,
    PreviousYearManureApplicationFrequency,
    SoilTest,
  } = field;
  const apiCache = useContext(APICacheContext);
  const [soilTestMethods, setSoilTestMethods] = useState<SoilTestMethodsData[]>([]);
  const [balanceMessages, setBalanceMessages] = useState<Array<NutrientMessage>>([]);

  const balanceRow: CalculateNutrientsColumn = useMemo(() => {
    const allRows = [...Crops, ...Fertilizers, ...OtherNutrients];
    return {
      name: 'Balance',
      reqN: allRows.reduce((sum, row) => sum + (row.reqN ?? 0), 0),
      reqP2o5: allRows.reduce((sum, row) => sum + (row.reqP2o5 ?? 0), 0),
      reqK2o: allRows.reduce((sum, row) => sum + (row.reqK2o ?? 0), 0),
      remN: allRows.reduce((sum, row) => sum + (row.remN ?? 0), 0),
      remP2o5: allRows.reduce((sum, row) => sum + (row.remP2o5 ?? 0), 0),
      remK2o: allRows.reduce((sum, row) => sum + (row.remK2o ?? 0), 0),
    };
  }, [Crops, Fertilizers, OtherNutrients]);

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
    <div style={{ marginTop: '16px', marginBottom: '16px' }}>
      <div>
        <span style={{ textDecoration: 'underline' }}>Field Name: {FieldName}</span>
      </div>
      <div>
        <span>Planning Year: {year}</span>
      </div>
      <div>
        <span>Field Area: {Area}</span>
      </div>
      <div>
        <span>
          Application Frequency:
          {
            MANURE_APPLICATION_FREQ.find((ele) => ele.id === PreviousYearManureApplicationFrequency)
              ?.label
          }
        </span>
      </div>
      <div>
        <span>Comments: {Comment}</span>
      </div>
      <DataGrid
        sx={{ ...customTableStyle, marginTop: '8px' }}
        rows={Crops}
        columns={CROP_COLUMNS}
        getRowId={() => crypto.randomUUID()}
        disableRowSelectionOnClick
        disableColumnMenu
        hideFooterPagination
        hideFooter
      />
      {booleanChecker(SoilTest) ? (
        <>
          <div>Soil Test Results: {SoilTest?.sampleDate}</div>
          <div>
            Soil Test Method: {soilTestMethods.find((ele) => ele.id === SoilTest?.soilTestId)?.name}
          </div>
          <DataGrid
            sx={{ ...customTableStyle, marginTop: '8px' }}
            rows={[SoilTest]}
            columns={SOIL_TEST_COLUMNS}
            getRowId={() => crypto.randomUUID()}
            disableRowSelectionOnClick
            disableColumnMenu
            hideFooterPagination
            hideFooter
          />
        </>
      ) : (
        ''
      )}
      <div
        style={{ display: 'flex', fontWeight: 'bold', textAlign: 'center', marginTop: '1.25rem' }}
      >
        <div style={{ width: 200 }} />
        <div style={{ width: 290 }}>
          Agronomic (lb/ac)
          <br />
        </div>
        <div style={{ width: 250 }}>
          Crop Removal (lb/ac)
          <br />
        </div>
      </div>
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
          />
        )}
        {Fertilizers.length > 0 && (
          <>
            <span>Fertilizers</span>
            <DataGrid
              sx={{ ...customTableStyle, ...HIDE_COLUMN_CSS }}
              rows={Fertilizers}
              columns={CALC_COLUMNS}
              getRowId={() => crypto.randomUUID()}
              disableRowSelectionOnClick
              disableColumnMenu
              columnHeaderHeight={0}
              hideFooterPagination
              hideFooter
            />
          </>
        )}
        {OtherNutrients.length > 0 && (
          <>
            <span>Nutrient Sources</span>
            <DataGrid
              sx={{ ...customTableStyle, ...HIDE_COLUMN_CSS }}
              rows={OtherNutrients}
              columns={CALC_COLUMNS}
              getRowId={() => crypto.randomUUID()}
              disableRowSelectionOnClick
              disableColumnMenu
              columnHeaderHeight={0}
              hideFooterPagination
              hideFooter
            />
          </>
        )}
        <span>Balance</span>
        <DataGrid
          sx={{ ...customTableStyle, ...HIDE_COLUMN_CSS }}
          rows={[balanceRow]}
          columns={CALC_COLUMNS}
          getRowId={() => crypto.randomUUID()}
          disableRowSelectionOnClick
          disableColumnMenu
          hideFooterPagination
          hideFooter
        />
        {balanceMessages.map((msg) => (
          <Message key={msg.Id}>{msg.Text}</Message>
        ))}
      </div>
    </div>
  );
}
