import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { customTableStyle } from '../reporting.styles';
import {
  NMPFileManureStorageSystem,
  ManureType,
  NMPFileNutrientAnalysis,
  NMPFileImportedManureData,
  NMPFileGeneratedManureData,
} from '@/types';

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
  NutrientAnalysisData = [],
  GeneratedManures = [],
  ImportedManures = [],
}: {
  ManureStorageSystems?: NMPFileManureStorageSystem[];
  NutrientAnalysisData?: NMPFileNutrientAnalysis[];
  GeneratedManures?: NMPFileGeneratedManureData[];
  ImportedManures?: NMPFileImportedManureData[];
}) {
  const storageSystemEntries = ManureStorageSystems.map((systemEle) => {
    const sumAmount = systemEle.manuresInSystem.reduce(
      (accumulator, currentValue) => accumulator + currentValue.data.AnnualAmount,
      0,
    );

    const nutrientSource = NutrientAnalysisData.find(
      (nurtrientEle) => nurtrientEle.sourceUuid === systemEle.uuid,
    );

    return {
      title: systemEle.name,
      AnnualAmount: sumAmount,
      UniqueMaterialName: nutrientSource?.UniqueMaterialName,
      // TODO: when application rates/schedules implemented
      landApplied: undefined,
      amountRemaining: (sumAmount / sumAmount) * 100,
    };
  });

  const unAssignedManures = [
    ...GeneratedManures.filter((ele) => !ele.AssignedToStoredSystem),
    ...ImportedManures.filter((ele) => !ele.AssignedToStoredSystem),
  ].map((unassignedEle) => {
    const nutrientSource = NutrientAnalysisData.find(
      (nurtrientEle) => nurtrientEle.sourceUuid === unassignedEle.uuid,
    );
    return {
      title: unassignedEle.ManagedManureName,
      AnnualAmount: unassignedEle.AnnualAmount,
      UniqueMaterialName: nutrientSource?.UniqueMaterialName,
      // TODO: when application rates/schedules implemented
      landApplied: undefined,
      amountRemaining: (unassignedEle.AnnualAmount / unassignedEle.AnnualAmount) * 100,
    };
  });

  return (
    <div>
      <DataGrid
        sx={{ ...customTableStyle }}
        rows={[...storageSystemEntries, ...unAssignedManures]}
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
    </div>
  );
}
