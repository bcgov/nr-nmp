import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { customTableStyle } from '../reporting.styles';
import { NMPFileManureStorageSystem, ManureType } from '@/types';

const TABLE_COLUMNS: GridColDef[] = [
  {
    field: 'title',
    headerName: 'Material',
    width: 150,
  },
  {
    field: 'UniqueMaterialName',
    headerName: 'Material Source',
    width: 150,
  },
  {
    field: 'AnnualAmount',
    headerName: 'Annual amount',
    width: 150,
  },
  {
    // Not currently collected, awaiting Fertigation function
    field: 'landApplied',
    headerName: 'Land applied',
    width: 150,
    valueGetter: (value, row) =>
      `${value ?? 0} ${row.liqOrSol === ManureType.Liquid ? 'US Gallons' : 'ton'}`,
  },
  {
    // Not enough info collected to calculate, awaiting Fertigation function
    field: 'amountRemaining',
    headerName: 'Amount remaining',
    width: 125,
    valueGetter: (value) => `${value ?? 0}%`,
  },
];

function NO_ROWS() {
  return <div style={{ width: '100%', textAlign: 'center', paddingTop: '2rem' }}>No data</div>;
}

export default function ManureCompostUse({
  ManureStorageSystems = [],
}: {
  ManureStorageSystems?: NMPFileManureStorageSystem[];
}) {
  const storedLiquidManuresAmount = ManureStorageSystems.filter(
    (manureEle) => manureEle.manureType === ManureType.Liquid,
  )
    .flatMap((manureEle) => manureEle.manuresInSystem)
    .reduce((accumulator, currentValue) => accumulator + currentValue.data.AnnualAmount, 0);

  const storedSolidManuresAmount = ManureStorageSystems.filter(
    (manureEle) => manureEle.manureType === ManureType.Solid,
  )
    .flatMap((manureEle) => manureEle.manuresInSystem)
    .reduce((accumulator, currentValue) => accumulator + currentValue.data.AnnualAmount, 0);

  return (
    <div>
      <DataGrid
        sx={{ ...customTableStyle, marginTop: '8px' }}
        rows={[
          {
            liqOrSol: ManureType.Liquid,
            title: 'Material in Liquid Storage System',
            AnnualAmount: `${storedLiquidManuresAmount} US Gallons`,
          },
          {
            liqOrSol: ManureType.Solid,
            title: 'Material in Solid Storage System',
            AnnualAmount: `${storedSolidManuresAmount} tons`,
          },
        ]}
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
