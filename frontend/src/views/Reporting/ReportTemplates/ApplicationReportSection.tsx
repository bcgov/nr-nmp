import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  customTableStyle,
  FieldContainer,
  FieldInfoItem,
  FieldInfoSection,
} from '../reporting.styles';
import type { NMPFileField } from '@/types';

const TABLE_COLUMNS: GridColDef[] = [
  { field: 'name', headerName: 'Nutrient Source', width: 200 },
  { field: 'cropTypeName', headerName: 'Application Timing', width: 150 },
  { field: 'applicationRate', headerName: 'Rate', width: 150 },
];

export default function ApplicationReportSection({
  field,
  year,
}: {
  field: NMPFileField;
  year: string;
}) {
  const { area, crops, fertilizers, fieldName } = field;

  return (
    <div style={{ marginTop: '16px' }}>
      <FieldContainer>
        <FieldInfoSection>
          <FieldInfoItem>
            <span style={{ fontWeight: 'bold', textDecoration: 'underline' }}>
              Field Name: {fieldName}
            </span>
          </FieldInfoItem>
          <FieldInfoItem>
            <span>
              <strong>Planning Year:</strong> {year}
            </span>
          </FieldInfoItem>
          <FieldInfoItem>
            <span>
              <strong>Field Area:</strong> {area}
            </span>
          </FieldInfoItem>
          <FieldInfoItem>
            <span>
              <strong>Crops:</strong>
              {crops.map((cropEle) => (
                <div key={cropEle.name}>{cropEle.name}</div>
              ))}
            </span>
          </FieldInfoItem>
        </FieldInfoSection>
      </FieldContainer>
      <DataGrid
        sx={{ ...customTableStyle }}
        rows={fertilizers}
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
