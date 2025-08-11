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
  ROW_HEIGHT,
  FieldContainer,
  FieldInfoSection,
  FieldInfoItem,
  SectionTitle,
  TableHeader,
  SubsectionLabel,
} from '../reporting.styles';
import { NutrientMessage } from '@/views/CalculateNutrients/nutrientMessages';

const HIDE_COLUMN_CSS = {
  '& .MuiDataGrid-row--borderBottom': {
    height: '0px !important',
  },
};

const CROP_COLUMNS: GridColDef[] = [
  { field: 'name', headerName: 'Crop Name', width: 250, minWidth: 200 },
  { field: 'cropTypeName', headerName: 'Crop Type', width: 180, minWidth: 150 },
  { field: 'yield', headerName: 'Yield', width: 120, minWidth: 100 },
  {
    field: 'nCredit',
    headerName: 'Previous crop ploughed down (N credit)',
    width: 280,
    minWidth: 250,
  },
];

const SOIL_TEST_COLUMNS: GridColDef[] = [
  { field: 'valNO3H', headerName: 'Nitrate-N', width: 180, minWidth: 150 },
  { field: 'valP', headerName: 'Phosphorus', width: 180, minWidth: 150 },
  { field: 'valK', headerName: 'Potassium', width: 180, minWidth: 150 },
  { field: 'valPH', headerName: 'pH', width: 120, minWidth: 100 },
];

const CALC_COLUMNS: GridColDef[] = [
  { field: 'name', width: 280, minWidth: 250, maxWidth: 350, renderHeader: () => null },
  {
    field: 'reqN',
    width: 90,
    minWidth: 80,
    maxWidth: 120,
    renderHeader: () => <span>N</span>,
  },
  {
    field: 'reqP2o5',
    width: 90,
    minWidth: 80,
    maxWidth: 120,
    renderHeader: () => (
      <span>
        P<sub>2</sub>O<sub>5</sub>
      </span>
    ),
  },
  {
    field: 'reqK2o',
    width: 90,
    minWidth: 80,
    maxWidth: 120,
    renderHeader: () => (
      <span>
        K<sub>2</sub>O
      </span>
    ),
  },
  {
    field: 'remN',
    width: 90,
    minWidth: 80,
    maxWidth: 120,
    renderHeader: () => <span>N</span>,
  },
  {
    field: 'remP2o5',
    width: 90,
    minWidth: 80,
    maxWidth: 120,
    renderHeader: () => (
      <span>
        P<sub>2</sub>O<sub>5</sub>
      </span>
    ),
  },
  {
    field: 'remK2o',
    width: 90,
    minWidth: 80,
    maxWidth: 150,
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
        rowHeight={ROW_HEIGHT}
        autoHeight
      />

      {booleanChecker(SoilTest) ? (
        <>
          <SectionTitle>Soil Test Information</SectionTitle>
          <FieldInfoItem style={{ marginBottom: '12px' }}>
            <strong>Soil Test Results:</strong> {SoilTest?.sampleDate?.toString()}
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
            rowHeight={ROW_HEIGHT}
            autoHeight
          />
        </>
      ) : null}

      <SectionTitle>Nutrient Requirements and Removal</SectionTitle>
      <TableHeader>
        <div style={{ width: 280 }} />
        <div style={{ width: 280 }}>
          Agronomic (lb/ac)
          <br />
        </div>
        <div style={{ width: 280 }}>
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
            rowHeight={ROW_HEIGHT}
            autoHeight
          />
        )}

        {Fertilizers.length > 0 && (
          <>
            <SubsectionLabel>Fertilizers</SubsectionLabel>
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
              rowHeight={ROW_HEIGHT}
              autoHeight
            />
          </>
        )}

        {OtherNutrients.length > 0 && (
          <>
            <SubsectionLabel>Nutrient Sources</SubsectionLabel>
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
              rowHeight={ROW_HEIGHT}
              autoHeight
            />
          </>
        )}

        <SubsectionLabel>Balance</SubsectionLabel>
        <DataGrid
          sx={{ ...customTableStyle, ...HIDE_COLUMN_CSS }}
          rows={[balanceRow]}
          columns={CALC_COLUMNS}
          getRowId={() => crypto.randomUUID()}
          disableRowSelectionOnClick
          disableColumnMenu
          hideFooterPagination
          hideFooter
          rowHeight={ROW_HEIGHT}
          autoHeight
        />

        {balanceMessages.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            {balanceMessages.map((msg) => (
              <Message key={msg.Id}>{msg.Text}</Message>
            ))}
          </div>
        )}
      </div>
    </FieldContainer>
  );
}
