import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { customTableStyle } from '../reporting.styles';
import type { NMPFileFarmManureData } from '@/types';

const TABLE_COLUMNS: GridColDef[] = [
  { field: 'materialSource', headerName: 'Source of Material', width: 150 },
  { field: 'materialType', headerName: 'Material Type', width: 150 },
  {
    field: 'Moisture',
    headerName: 'Moisture (%)',
    valueGetter: (_value, row) => row.Nutrients.Moisture,
  },
  {
    field: 'N',
    renderHeader: () => (
      <span style={{ fontWeight: 'bold' }}>
        NH<sub>4</sub>N (ppm)
      </span>
    ),

    valueGetter: (_value, row) => row.Nutrients.N,
  },
  {
    field: 'NH4N',
    headerName: 'P (%)',

    valueGetter: (_value, row) => row.Nutrients.NH4N,
  },
  {
    field: 'P2O5',
    headerName: 'K (%)',

    valueGetter: (_value, row) => row.Nutrients.P2O5,
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
      slots={{
        noRowsOverlay: NO_ROWS,
      }}
    />
  );
}
