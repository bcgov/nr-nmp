import { useContext, useEffect, useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import useAppState from '@/hooks/useAppState';
import { customTableStyle } from '../reporting.styles';
import { APICacheContext } from '@/context/APICacheContext';
import { SelectOption } from '@/types';

const TABLE_COLUMNS: GridColDef[] = [
  { field: 'name', headerName: 'Nutrient Source', width: 200 },
  { field: 'cropTypeName', headerName: 'Application Timing', width: 150 },
  { field: 'applicationRate', headerName: 'Rate', width: 150 },
];

function NO_ROWS() {
  return <div style={{ width: '100%', textAlign: 'center' }}>No data</div>;
}

export default function RecordKeepingSheets() {
  const { nmpFile } = useAppState().state;
  const { farmDetails, years } = nmpFile;
  const { FarmName, FarmRegion, FarmSubRegion } = farmDetails;

  const [regionOptions, setRegionOptions] = useState<Array<SelectOption>>([]);
  const [subregionOptions, setSubregionOptions] = useState<Array<SelectOption>>([]);

  const apiCache = useContext(APICacheContext);

  useEffect(() => {
    apiCache.callEndpoint('api/regions/').then((response) => {
      const { data } = response;
      const regions = (data as { id: number; name: string }[]).map((row) => ({
        id: row?.id.toString(),
        label: row.name,
      }));
      setRegionOptions(regions as Array<SelectOption>);
    });
    apiCache.callEndpoint(`api/subregions/${FarmRegion}/`).then((response) => {
      const { data } = response;
      const subregions = (data as { id: number; name: string }[]).map((row) => ({
        id: row?.id.toString(),
        label: row.name,
      }));

      setSubregionOptions(subregions as Array<SelectOption>);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [FarmRegion, FarmSubRegion]);

  return (
    <div style={{ width: '744px' }}>
      <div style={{ fontSize: '32px', marginBottom: '8px', fontWeight: 'bold' }}>
        NMP Farm Report
      </div>
      <div>
        <span>Farm name: {FarmName}</span>
      </div>
      <div>
        <span>
          Farm Region: {regionOptions?.find((ele) => ele.id === FarmRegion)?.label ?? FarmRegion}
        </span>
      </div>
      <div>
        <span>
          Farm Sub Region:{' '}
          {subregionOptions?.find((ele) => ele.id === FarmSubRegion)?.label ?? FarmSubRegion}
        </span>
      </div>
      <div style={{ fontWeight: 'bold', marginTop: '64px' }}>Application Schedule</div>
      {years.map((yearEle) =>
        yearEle.Fields?.map((fieldEle) => (
          <div
            key={fieldEle.FieldName}
            style={{ marginTop: '16px' }}
          >
            <div>
              <span style={{ textDecoration: 'underline' }}>Field Name: {fieldEle.FieldName}</span>
            </div>
            <div>
              <span>Planning Year: {farmDetails.Year}</span>
            </div>
            <div>
              <span>Field Area: {fieldEle.Area}</span>
            </div>
            <div>Crops:</div>
            {fieldEle.Crops.map((cropEle) => (
              <div key={cropEle.name}>{cropEle.name}</div>
            ))}
            <DataGrid
              sx={{ ...customTableStyle, marginTop: '16px' }}
              rows={fieldEle.Fertilizers}
              columns={TABLE_COLUMNS}
              getRowId={() => crypto.randomUUID()}
              disableRowSelectionOnClick
              disableColumnMenu
              rowHeight={40}
              hideFooterPagination
              hideFooter
              slots={{
                noRowsOverlay: NO_ROWS,
              }}
            />
          </div>
        )),
      )}
    </div>
  );
}
