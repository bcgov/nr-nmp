import { inventoryTableCss, inventoryTableHeader } from '../reporting.styles';
import {
  NMPFileImportedManure,
  NMPFileGeneratedManure,
  NMPFileAnimal,
  NMPFileDairyCattle,
  NMPFileManureStorageSystem,
  ManureType,
} from '@/types';

export default function ManureCompostInventory({
  FarmAnimals = [],
  GeneratedManures = [],
  ImportedManures = [],
  ManureStorageSystems = [],
}: {
  FarmAnimals?: NMPFileAnimal[];
  GeneratedManures?: NMPFileGeneratedManure[];
  ImportedManures?: NMPFileImportedManure[];
  ManureStorageSystems?: NMPFileManureStorageSystem[];
}) {
  const getMilkWashAmount = (manureSourceUuid: string) => {
    const milkManure = FarmAnimals.find(
      (animalEle) => animalEle.uuid === manureSourceUuid,
    ) as NMPFileDairyCattle;
    if (!milkManure) return 0;
    return milkManure.washWater;
  };

  const unAssignedManures = [
    ...GeneratedManures.filter((ele) => !ele.assignedToStoredSystem),
    ...ImportedManures.filter((ele) => !ele.assignedToStoredSystem),
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
                (accumulator, currentValue) => currentValue.data.annualAmount + accumulator,
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
            <tr key={manureEle.data.uniqueMaterialName}>
              <td style={{ paddingLeft: '3rem' }}>{manureEle.data.uniqueMaterialName}</td>
              <td style={{ textAlign: 'right' }}>{manureEle.data.annualAmount}</td>
              <td>{systemEle.manureType === ManureType.Liquid ? 'US gallons' : 'tons'}</td>
            </tr>
          ))}
          {systemEle.manuresInSystem
            .filter(
              (manureEle) =>
                'manureId' in manureEle.data && manureEle.data.uniqueMaterialName === 'Milking Cow',
            )
            .map((manureEle) => (
              <tr key={manureEle.data.uniqueMaterialName}>
                <td>Milking Center Wash Water</td>
                <td style={{ textAlign: 'right' }}>{getMilkWashAmount(manureEle.data.uuid)}</td>
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
            <tr key={manureEle.uniqueMaterialName}>
              <td style={{ paddingLeft: '3rem' }}>{manureEle.uniqueMaterialName}</td>
              <td style={{ textAlign: 'right' }}>{manureEle.annualAmount}</td>
              <td>{manureEle.manureType === ManureType.Liquid ? 'US gallons' : 'tons'}</td>
            </tr>
          ))}
        </tbody>
      )}
    </table>
  );
}
