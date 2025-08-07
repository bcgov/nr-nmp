import { inventoryTableCss, inventoryTableHeader } from '../reporting.styles';
import {
  NMPFileImportedManureData,
  NMPFileGeneratedManureData,
  AnimalData,
  DairyCattleData,
  NMPFileManureStorageSystem,
  ManureType,
} from '@/types';
import { calculateAnnualWashWater } from '@/views/AddAnimals/utils';

export default function ManureCompostInventory({
  FarmAnimals = [],
  GeneratedManures = [],
  ImportedManures = [],
  ManureStorageSystems = [],
}: {
  FarmAnimals?: AnimalData[];
  GeneratedManures?: NMPFileGeneratedManureData[];
  ImportedManures?: NMPFileImportedManureData[];
  ManureStorageSystems?: NMPFileManureStorageSystem[];
}) {
  const getMilkWashAmount = (manureId: string) => {
    const milkManure = FarmAnimals.find(
      (animalEle) => animalEle.manureId === manureId,
    ) as DairyCattleData;
    if (!milkManure) return 0;

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
          (animalEle) => animalEle.uuid === ele.manureId,
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

  const unAssignedManures = [
    ...GeneratedManures.filter((ele) => !ele.AssignedToStoredSystem),
    ...ImportedManures.filter((ele) => !ele.AssignedToStoredSystem),
  ];

  return (
    <table css={inventoryTableCss}>
      <thead css={inventoryTableHeader}>
        <tr>
          <th>Material</th>
          <th colSpan={2}>Annual Amount</th>
        </tr>
      </thead>
      {ManureStorageSystems.map((systemEle, index) => (
        <tbody key={systemEle.name}>
          {index !== 0 ? (
            <tr>
              {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
              <td colSpan={3} />
            </tr>
          ) : (
            ''
          )}
          <tr style={{ fontWeight: 'bold' }}>
            <td>
              Material in {`${systemEle.name} `}
              Storage System
            </td>
            <td style={{ textAlign: 'right' }}>
              {systemEle.manuresInSystem.reduce(
                (accumulator, currentValue) => currentValue.data.AnnualAmount + accumulator,
                0,
              )}
            </td>
            <td>{systemEle.manureType === ManureType.Liquid ? 'US gallons' : 'tons'}</td>
          </tr>
          <tr>
            <td
              colSpan={3}
              style={{ paddingLeft: '2rem' }}
            >
              Animal manure
            </td>
          </tr>
          {systemEle.manuresInSystem.map((manureEle) => (
            <tr key={manureEle.data.UniqueMaterialName}>
              <td style={{ paddingLeft: '3rem' }}>{manureEle.data.UniqueMaterialName}</td>
              <td style={{ textAlign: 'right' }}>{manureEle.data.AnnualAmount}</td>
              <td>{systemEle.manureType === ManureType.Liquid ? 'US gallons' : 'tons'}</td>
            </tr>
          ))}
          {systemEle.manuresInSystem
            .filter(
              (manureEle) =>
                'manureId' in manureEle.data && manureEle.data.UniqueMaterialName === 'Milking Cow',
            )
            .map((manureEle) => (
              <tr key={manureEle.data.UniqueMaterialName}>
                <td>Milking Center Wash Water</td>
                <td style={{ textAlign: 'right' }}>
                  {getMilkWashAmount((manureEle.data as NMPFileGeneratedManureData).manureId)}
                </td>
                <td>{systemEle.manureType === ManureType.Liquid ? 'US gallons' : 'tons'}</td>
              </tr>
            ))}
          <tr>
            <td>Precipitation</td>
            <td style={{ textAlign: 'right' }}>{systemEle.annualPrecipitation}</td>
            <td>{systemEle.manureType === ManureType.Liquid ? 'US gallons' : 'tons'}</td>
          </tr>
        </tbody>
      ))}
      {unAssignedManures.length > 0 && (
        <tbody>
          <tr>
            {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
            <td colSpan={3} />
          </tr>
          <tr>
            <td
              colSpan={3}
              style={{ fontWeight: 'bold' }}
            >
              Material not stored
            </td>
          </tr>
          {unAssignedManures.map((manureEle) => (
            <tr key={manureEle.UniqueMaterialName}>
              <td style={{ paddingLeft: '3rem' }}>{manureEle.UniqueMaterialName}</td>
              <td style={{ textAlign: 'right' }}>{manureEle.AnnualAmount}</td>
              <td>{manureEle.ManureType === ManureType.Liquid ? 'US gallons' : 'tons'}</td>
            </tr>
          ))}
        </tbody>
      )}
    </table>
  );
}
