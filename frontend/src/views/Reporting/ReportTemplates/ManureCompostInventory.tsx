import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useMemo } from 'react';
import { customTableStyle, ROW_HEIGHT } from '../reporting.styles';
import {
  NMPFileImportedManureData,
  NMPFileGeneratedManureData,
  AnimalData,
  DairyCattleData,
} from '@/types';
import { calculateAnnualWashWater } from '@/views/AddAnimals/utils';

function NO_ROWS() {
  return <div style={{ width: '100%', textAlign: 'center' }}>No data</div>;
}

export default function ManureCompostInventory({
  FarmAnimals = [],
  GeneratedManures = [],
  ImportedManures = [],
}: {
  FarmAnimals: AnimalData[] | undefined;
  GeneratedManures: NMPFileGeneratedManureData[] | undefined;
  ImportedManures: NMPFileImportedManureData[] | undefined;
}) {
  // TODO categorize manures by table by if they have storage systems,
  // and by liquid/solid storage systems when implemented

  const TABLE_COLUMNS: GridColDef[] = useMemo(
    () => [
      {
        field: 'UniqueMaterialName',
        headerName: 'Material',
        width: 300,
        renderCell: (params: any) => {
          const { row } = params;
          if (row?.bold) {
            return <div style={{ fontWeight: 'bold' }}>{params.value}</div>;
          }
          return <div style={{ marginLeft: '16px' }}>{params.value}</div>;
        },
      },
      {
        field: 'AnnualAmountDisplayWeight',
        headerName: 'Annual Amount',
        width: 300,
        valueGetter: (_value, row) =>
          row?.AnnualAmountDisplayWeight || row?.AnnualAmountDisplayVolume || '',
      },
    ],
    [],
  );

  const insertWashWater = (
    manureArray: Array<NMPFileGeneratedManureData | NMPFileImportedManureData>,
  ) => {
    const resultArray: Array<{
      UniqueMaterialName: string;
      AnnualAmountDisplayWeight: string | undefined;
      AnnualAmountDisplayVolume: string | undefined;
    }> = [];
    manureArray.forEach((ele) => {
      resultArray.push({
        UniqueMaterialName: ele.UniqueMaterialName,
        AnnualAmountDisplayWeight: ele.AnnualAmountDisplayWeight,
        AnnualAmountDisplayVolume:
          'AnnualAmountDisplayVolume' in ele ? ele.AnnualAmountDisplayVolume : undefined,
      });
      if ('manureId' in ele && ele.UniqueMaterialName === 'Milking Cow') {
        const milkCowEntry = FarmAnimals.find(
          (animalEle) => animalEle.manureId === ele.manureId,
        ) as DairyCattleData;
        const washWaterGallons = calculateAnnualWashWater(
          milkCowEntry.washWater!,
          milkCowEntry.washWaterUnit!,
          milkCowEntry.animalsPerFarm!,
        );
        resultArray.push({
          UniqueMaterialName: 'Milking Center Wash Water',
          AnnualAmountDisplayWeight: `${washWaterGallons} U.S. gallons`,
          AnnualAmountDisplayVolume: undefined,
        });
      }
    });

    return resultArray;
  };
  const assignedToStorage = insertWashWater(
    [...GeneratedManures, ...ImportedManures].filter((ele) => ele.AssignedToStoredSystem),
  );

  const notAssignedToStorage = insertWashWater(
    [...GeneratedManures, ...ImportedManures].filter((ele) => !ele.AssignedToStoredSystem),
  );

  const totalTable = [
    {
      UniqueMaterialName: 'Material in liquid or solid storage system',
      AnnualAmountDisplayWeight: '',
      bold: true,
    },
    ...assignedToStorage,
    {
      UniqueMaterialName: 'Material not assigned to storage system',
      AnnualAmountDisplayWeight: '',
      bold: true,
    },
    ...notAssignedToStorage,
  ];
  return (
    <div>
      <DataGrid
        sx={{ ...customTableStyle, marginTop: '8px' }}
        rows={totalTable}
        columns={TABLE_COLUMNS}
        getRowId={() => crypto.randomUUID()}
        rowHeight={ROW_HEIGHT}
        disableRowSelectionOnClick
        disableColumnMenu
        hideFooterPagination
        hideFooter
        slots={{
          noRowsOverlay: NO_ROWS,
        }}
      />
    </div>
  );
}
