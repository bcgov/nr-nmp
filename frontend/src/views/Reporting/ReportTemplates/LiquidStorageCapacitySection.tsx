import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { customTableStyle, ROW_HEIGHT } from '../reporting.styles';
import { NMPFileManureStorageSystem, ManureType } from '@/types';

const TABLE_COLUMNS: GridColDef[] = [
  {
    field: 'title',
    headerName: 'Material',
    width: 275,
    renderCell: (params) => {
      const styleObj = {
        fontWeight: '',
        paddingLeft: '',
      };
      if (params.row.bold) styleObj.fontWeight = 'bold';
      if (params.row.paddingLeft) styleObj.paddingLeft = '2rem';

      return <div style={styleObj}>{params.value}</div>;
    },
  },
  {
    field: 'amount',
    headerName: '',
    width: 200,
    renderCell: (params) => {
      const styleObj = {
        textAlign: '',
      };
      if (params.row.alignRight) styleObj.textAlign = 'right';
      // Somehow the standard css attribute is not in the type def, so any
      return <div style={styleObj as any}>{params.value}</div>;
    },
  },
  {
    field: 'units',
    headerName: '',
    width: 150,
  },
];

function NO_ROWS() {
  return <div style={{ width: '100%', textAlign: 'center', paddingTop: '2rem' }}>No data</div>;
}

export default function LiquidStorageCapacitySection({
  ManureStorageSystems = [],
}: {
  ManureStorageSystems?: NMPFileManureStorageSystem[];
}) {
  const liquidStorageSystems = ManureStorageSystems.filter(
    (manureEle) => manureEle.manureType === ManureType.Liquid,
  );
  const storedLiquidManuresAmount = liquidStorageSystems
    .flatMap((manureEle) => manureEle.manuresInSystem)
    .reduce((accumulator, currentValue) => accumulator + currentValue.data.AnnualAmount, 0);

  const totalYardRoofRunoff = liquidStorageSystems
    .filter((systemEle) => systemEle.getsRunoff)
    .reduce((accumulator, currentValue) => accumulator + currentValue.runoffAreaSqFt, 0);

  const totalPrecipitation = liquidStorageSystems
    .filter((systemEle) => systemEle.annualPrecipitation)
    .reduce(
      (accumulator, currentValue) => accumulator + (currentValue?.annualPrecipitation ?? 0),
      0,
    );

  const totalVolume = liquidStorageSystems
    .flatMap((manureEle) => manureEle.manureStorages)
    .reduce((accumulator, currentValue) => accumulator + (currentValue?.volumeUSGallons ?? 0), 0);
  return (
    <div>
      <DataGrid
        sx={{ ...customTableStyle, marginTop: '8px' }}
        rows={[
          {
            alignRight: false,
            bold: true,
            paddingLeft: '',
            title: 'Material Stored (October to March)',
            amount: '',
          },
          {
            alignRight: true,
            bold: false,
            paddingLeft: true,
            title: 'Materials Generated or Imported',
            amount: storedLiquidManuresAmount,
            units: 'US Gallons',
          },
          {
            alignRight: true,
            bold: false,
            paddingLeft: true,
            title: 'Yard/Roof Runoff',
            amount: totalYardRoofRunoff,
            units: 'US Gallons',
          },
          {
            alignRight: true,
            bold: false,
            paddingLeft: true,
            title: 'Precipitation, Direct into Storage',
            amount: totalPrecipitation,
            units: 'US Gallons',
          },
          {
            alignRight: true,
            bold: true,
            paddingLeft: true,
            title: 'Total Stored',
            amount: storedLiquidManuresAmount + totalYardRoofRunoff + totalPrecipitation,
            units: 'US Gallons',
          },
          {
            alignRight: true,
            bold: true,
            paddingLeft: false,
            title: 'Storage Volume',
            amount: totalVolume,
            units: 'US Gallons',
          },
        ]}
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
      {storedLiquidManuresAmount + totalYardRoofRunoff + totalPrecipitation > totalVolume ? (
        <div style={{ marginTop: '2rem', fontSize: '0.75rem' }}>
          There may not be enough capacity to contain the manure and water to be stored during the
          non-growing season of an average year
        </div>
      ) : (
        <div>none</div>
      )}
    </div>
  );
}
