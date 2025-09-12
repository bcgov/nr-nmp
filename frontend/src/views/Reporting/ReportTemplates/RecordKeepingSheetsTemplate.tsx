import { useContext, useEffect, useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import useAppState from '@/hooks/useAppState';
import {
  customTableStyle,
  FieldContainer,
  FieldInfoItem,
  FieldInfoSection,
} from '../reporting.styles';
import { APICacheContext } from '@/context/APICacheContext';
import { Region, SelectOption, Subregion } from '@/types';

const TABLE_COLUMNS: GridColDef[] = [
  { field: 'name', headerName: 'Nutrient Source', width: 200 },
  { field: 'cropTypeName', headerName: 'Application Timing', width: 150 },
  { field: 'applicationRate', headerName: 'Rate', width: 150 },
];

function NO_ROWS() {
  return <div style={{ width: '100%', textAlign: 'center', paddingTop: '2rem' }}>No data</div>;
}

export default function RecordKeepingSheets() {
  const { nmpFile } = useAppState().state;
  const { farmDetails, years } = nmpFile;
  const { farmName, farmRegion, farmSubregion } = farmDetails;

  const [regionOptions, setRegionOptions] = useState<SelectOption<Region>[]>([]);
  const [subregionOptions, setSubregionOptions] = useState<SelectOption<Subregion>[]>([]);

  const apiCache = useContext(APICacheContext);

  useEffect(() => {
    apiCache.callEndpoint('api/regions/').then((response) => {
      const { data } = response;
      const regions: SelectOption<Region>[] = (data as Region[]).map((row) => ({
        id: row.id.toString(),
        label: row.name,
        value: row,
      }));
      setRegionOptions(regions);
    });
    apiCache.callEndpoint(`api/subregions/${farmRegion}/`).then((response) => {
      const { data } = response;
      const subregions: SelectOption<Subregion>[] = (data as Subregion[]).map((row) => ({
        id: row.id.toString(),
        label: row.name,
        value: row,
      }));

      setSubregionOptions(subregions);
    });
  }, [apiCache, farmRegion]);

  return (
    <div style={{ width: '744px' }}>
      <FieldContainer>
        <FieldInfoSection>
          <FieldInfoItem>
            <span
              style={{
                fontWeight: 'bold',
                textDecoration: 'underline',
                fontSize: '32px',
                marginBottom: '8px',
              }}
            >
              NMP Farm Report
            </span>
          </FieldInfoItem>
          <FieldInfoItem>
            <span>
              <strong>Farm name:</strong> {farmName}
            </span>
          </FieldInfoItem>
          <FieldInfoItem>
            <span>
              <strong>Farm region:</strong>{' '}
              {regionOptions.find((ele) => ele.id === farmRegion)?.label ?? farmRegion}
            </span>
          </FieldInfoItem>
          <FieldInfoItem>
            <span>
              <strong>Farm subregion:</strong>{' '}
              {subregionOptions.find((ele) => ele.id === farmSubregion)?.label ?? farmSubregion}
            </span>
          </FieldInfoItem>
        </FieldInfoSection>
      </FieldContainer>
      <div style={{ fontWeight: 'bold', marginTop: '32px' }}>Application Schedule</div>
      {years.map((yearEle) =>
        yearEle.fields.map((fieldEle) => (
          <div
            key={fieldEle.fieldName}
            style={{ marginTop: '16px' }}
          >
            <FieldContainer>
              <FieldInfoSection>
                <FieldInfoItem>
                  <span style={{ fontWeight: 'bold', textDecoration: 'underline' }}>
                    Field Name: {fieldEle.fieldName}
                  </span>
                </FieldInfoItem>
                <FieldInfoItem>
                  <span>
                    <strong>Planning Year:</strong> {farmDetails.year}
                  </span>
                </FieldInfoItem>
                <FieldInfoItem>
                  <span>
                    <strong>Field Area:</strong> {fieldEle.area}
                  </span>
                </FieldInfoItem>
                <FieldInfoItem>
                  <span>
                    <strong>Crops</strong>{' '}
                    {fieldEle.crops.map((cropEle) => (
                      <div key={cropEle.name}>{cropEle.name}</div>
                    ))}
                  </span>
                </FieldInfoItem>
              </FieldInfoSection>
            </FieldContainer>
            <DataGrid
              sx={{ ...customTableStyle, marginTop: '16px' }}
              rows={fieldEle.fertilizers}
              columns={TABLE_COLUMNS}
              getRowId={() => crypto.randomUUID()}
              disableRowSelectionOnClick
              disableColumnMenu
              getRowHeight={() => 'auto'}
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
