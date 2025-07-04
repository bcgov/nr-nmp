import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { customTableStyle } from '../reporting.styles';
import { NMPFileImportedManureData, NMPFileGeneratedManureData } from '@/types';

const TABLE_COLUMNS: GridColDef[] = [
  { field: 'UniqueMaterialName', headerName: 'Material', width: 300 },
  {
    field: 'AnnualAmountDisplayWeight',
    headerName: 'Annual Amount',
    width: 300,
    valueGetter: (_value, row) =>
      row?.AnnualAmountDisplayWeight || row?.AnnualAmountDisplayVolume || '',
  },
];

function NO_ROWS() {
  return <div style={{ width: '100%', textAlign: 'center' }}>No data</div>;
}

export default function ManureCompostInventory({
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
        slots={{
          noRowsOverlay: NO_ROWS,
        }}
      />
    </div>
  );
}
