import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { customTableStyle } from '../reporting.styles';
import type { NMPFileFarmManureData } from '@/types';

const TABLE_COLUMNS: GridColDef[] = [
  { field: 'ManureSource', headerName: 'Source of Material', width: 200 },
  { field: 'MaterialType', headerName: 'Material Type', width: 200 },
  {
    field: 'Moisture',
    headerName: 'Moisture (%)',
    width: 90,
    valueGetter: (_value, row) => row.Nutrients.Moisture,
  },
  {
    field: 'N',
    renderHeader: () => (
      <span style={{ fontWeight: 'bold' }}>
        NH<sub>4</sub>N (ppm)
      </span>
    ),
    width: 75,
    valueGetter: (_value, row) => row.Nutrients.N,
  },
  {
    field: 'NH4N',
    headerName: 'P (%)',
    width: 75,
    valueGetter: (_value, row) => row.Nutrients.NH4N,
  },
  {
    field: 'P2O5',
    headerName: 'K (%)',
    width: 75,
    valueGetter: (_value, row) => row.Nutrients.P2O5,
  },
];

function NO_ROWS() {
  return <div style={{ width: '100%', textAlign: 'center' }}>No data</div>;
}

export default function ManureCompostAnalysis({
  farmManures,
}: {
  farmManures: NMPFileFarmManureData[];
}) {
  return (
    <DataGrid
      sx={{ ...customTableStyle, marginTop: '8px' }}
      rows={farmManures}
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
  );
}
