import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { customTableStyle, ROW_HEIGHT } from '../reporting.styles';
import { NMPFileImportedManureData, NMPFileGeneratedManureData } from '@/types';

const TABLE_COLUMNS: GridColDef[] = [
  // Should correspond with ManureType
  { field: 'MaterialType', headerName: 'Material', width: 100 },
  {
    field: 'UniqueMaterialName',
    headerName: 'Material Source',
    width: 200,
  },
  {
    field: 'AnnualAmountDisplayWeight',
    headerName: 'Annual amount',
    width: 150,
    valueGetter: (_value, row) =>
      row?.AnnualAmountDisplayWeight || row?.AnnualAmountDisplayVolume || '',
  },
  {
    // Not currently collected
    field: 'landApplied',
    headerName: 'Land applied',
    width: 150,
  },
  {
    // Not enough info collected to calculate
    field: 'amountRemaining',
    headerName: 'Amount remaining',
    width: 150,
  },
];

function NO_ROWS() {
  return <div style={{ width: '100%', textAlign: 'center' }}>No data</div>;
}

export default function ManureCompostUse({
  GeneratedManures = [],
  ImportedManures = [],
}: {
  GeneratedManures: NMPFileGeneratedManureData[] | undefined;
  ImportedManures: NMPFileImportedManureData[] | undefined;
}) {
  return (
    <div>
      <DataGrid
        sx={{ ...customTableStyle, marginTop: '8px' }}
        rows={[...GeneratedManures, ...ImportedManures]}
        columns={TABLE_COLUMNS}
        getRowId={() => crypto.randomUUID()}
        disableRowSelectionOnClick
        disableColumnMenu
        hideFooterPagination
        hideFooter
        rowHeight={ROW_HEIGHT}
        slots={{
          noRowsOverlay: NO_ROWS,
        }}
      />
    </div>
  );
}
