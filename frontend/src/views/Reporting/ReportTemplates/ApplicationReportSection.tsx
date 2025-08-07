import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { customTableStyle } from '../reporting.styles';
import type { NMPFileFieldData } from '@/types';

const TABLE_COLUMNS: GridColDef[] = [
  { field: 'name', headerName: 'Nutrient Source', width: 200 },
  { field: 'cropTypeName', headerName: 'Application Timing', width: 150 },
  { field: 'applicationRate', headerName: 'Rate', width: 150 },
];

function NO_ROWS() {
  return <div style={{ width: '100%', textAlign: 'center', paddingTop: '2rem' }}>No data</div>;
}

export default function ApplicationReportSection({
  field,
  year,
}: {
  field: NMPFileFieldData;
  year: string;
}) {
  const { Area, Crops, Fertilizers, FieldName } = field;

  return (
    <div style={{ marginTop: '16px' }}>
      <div>
        <span style={{ textDecoration: 'underline' }}>Field Name: {FieldName}</span>
      </div>
      <div>
        <span>Planning Year: {year}</span>
      </div>
      <div>
        <span>Field Area: {Area}</span>
      </div>
      <div>Crops:</div>
      {Crops.map((cropEle) => (
        <div key={cropEle.name}>{cropEle.name}</div>
      ))}
      <DataGrid
        sx={{ ...customTableStyle, marginTop: '16px' }}
        rows={Fertilizers}
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
    </div>
  );
}
