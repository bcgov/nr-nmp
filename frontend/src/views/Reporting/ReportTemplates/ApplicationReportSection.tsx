import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  customTableStyle,
  FieldContainer,
  FieldInfoItem,
  FieldInfoSection,
} from '../reporting.styles';
import type { NMPFileFieldData } from '@/types';

const TABLE_COLUMNS: GridColDef[] = [
  { field: 'name', headerName: 'Nutrient Source', width: 200 },
  { field: 'cropTypeName', headerName: 'Application Timing', width: 150 },
  { field: 'applicationRate', headerName: 'Rate', width: 150 },
];

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
              <strong>Crops:</strong>
              {Crops.map((cropEle) => (
                <div key={cropEle.name}>{cropEle.name}</div>
              ))}
            </span>
          </FieldInfoItem>
        </FieldInfoSection>
      </FieldContainer>
      <DataGrid
        sx={{ ...customTableStyle }}
        rows={Fertilizers}
        columns={TABLE_COLUMNS}
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
        disableColumnResize
      />
    </div>
  );
}
