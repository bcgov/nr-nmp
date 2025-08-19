import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { customTableStyle } from '../reporting.styles';
import { NMPFileNutrientAnalysis } from '@/types';

const TABLE_COLUMNS: GridColDef[] = [
  { field: 'materialSource', headerName: 'Source of Material', width: 150 },
  { field: 'materialType', headerName: 'Material Type', width: 150 },
  {
    field: 'Moisture',
    headerName: 'Moisture (%)',
  },
  {
    field: 'N',
    renderHeader: () => (
      <span style={{ fontWeight: 'bold' }}>
        NH<sub>4</sub>N (ppm)
      </span>
    ),
    width: 80,
    valueGetter: (_value, row) => row.N,
  },
  {
    field: 'NH4N',
    headerName: 'P (%)',
    width: 75,
    valueGetter: (_value, row) => row.NH4N,
  },
  {
    field: 'P2O5',
    headerName: 'K (%)',
    width: 75,
    valueGetter: (_value, row) => row.P2O5,
  },
];

function NO_ROWS() {
  return <div style={{ width: '100%', textAlign: 'center', paddingTop: '2rem' }}>No data</div>;
}

export default function ManureCompostAnalysis({
  nutrientAnalyses,
}: {
  nutrientAnalyses: NMPFileNutrientAnalysis[];
}) {
  return (
    <DataGrid
      sx={{ ...customTableStyle, marginTop: '8px' }}
      rows={nutrientAnalyses}
      columns={TABLE_COLUMNS}
      getRowId={() => crypto.randomUUID()}
      disableRowSelectionOnClick
      disableColumnMenu
      hideFooterPagination
      hideFooter
      getRowHeight={() => 'auto'}
      columnHeaderHeight={80}
      slots={{
        noRowsOverlay: NO_ROWS,
      }}
      disableAutosize
      disableColumnSorting
      disableColumnSelector
    />
  );
}
