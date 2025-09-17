import { jsPDF } from 'jspdf';
import { autoTable, RowInput, CellInput } from 'jspdf-autotable';
import { ManureType, NMPFileYear } from '@/types';
import { drawStandardHeader, addText } from '../reportingUtils';
import { sharedAutoTableSettings } from '../reportingConstants';

const generateManureInventory = (
  doc: jsPDF,
  nmpFileYear: NMPFileYear,
  unassignedManures: any[],
  farmName: string,
  year: number,
  pageWidth: number,
) => {
  const storageSystems = nmpFileYear.manureStorageSystems || [];
  if (storageSystems.length > 0 || unassignedManures.length > 0) {
    doc.addPage();
    /* Commenting out for now bc I want to ask Josh about this and the assumptions
    const footnotes: string[] = [
      `Milking Center Wash Water adjusted to _ US gallons/day/animal`,
      `Milk Production adjusted to _ lb/day/animal`,
    ];
    */
    autoTable(doc, {
      ...sharedAutoTableSettings,
      // Page Header
      margin: { top: 40 },
      willDrawPage(data) {
        const [nextX, nextY] = drawStandardHeader(data, doc, farmName, year);
        doc.setFont(doc.getFont().fontName, 'bold');
        addText(doc, 'Manure/Compost Inventory', nextX, nextY + 2);
        doc.setFont(doc.getFont().fontName, 'normal');
      },
      // Table
      head: [['Material', 'Annual Amount']],
      columnStyles: {
        0: { cellWidth: pageWidth * 0.6 },
        1: { cellWidth: 'auto' },
      },
      body: [
        ...storageSystems.reduce((acc, system) => {
          // For a storage system, there is a rows with system name in bold,
          // a row for each manure in the system, an extra row if there is
          // Milking Center Wash Water and a final row for precipitation,
          // if the system contains any
          const newRows: CellInput[][] = [
            [{ content: system.name, styles: { fontStyle: 'bold' } }, ''],
          ];
          let totalWashWater = 0;
          system.manuresInSystem.forEach((m: any) => {
            // \t doesn't work in this new font so I used spaces
            if (
              m.type === 'Generated' &&
              m.data.originalAnnualAmount !== undefined &&
              m.data.originalWashWaterAmount !== undefined
            ) {
              newRows.push([
                `        ${m.data.uniqueMaterialName}`,
                `${m.data.originalAnnualAmount} US gallons`,
              ]);
              totalWashWater += m.data.originalWashWaterAmount;
            } else {
              newRows.push([
                `        ${m.data.uniqueMaterialName}`,
                `${m.data.annualAmount} ${m.data.manureType === ManureType.Liquid ? 'US gallons' : 'tons'}`,
              ]);
            }
          });
          if (totalWashWater > 0) {
            newRows.push(['Milking Center Wash Water', `${totalWashWater} US gallons`]);
          }
          if (system.annualPrecipitation) {
            newRows.push([
              'Precipitation',
              `${system.annualPrecipitation} ${system.manureType === ManureType.Liquid ? 'US gallons' : 'tons'}`,
            ]);
          }
          return acc.concat(newRows);
        }, [] as RowInput[]),
        ...unassignedManures.reduce((acc, manure, idx) => {
          const newRows: CellInput[][] =
            // Add the section header if this is the first manure
            idx === 0
              ? [[{ content: 'Material not Stored', styles: { fontStyle: 'bold' } }, '']]
              : [];
          newRows.push([
            `        ${manure.uniqueMaterialName}`,
            `${manure.annualAmount} ${manure.manureType === ManureType.Liquid ? 'US gallons' : 'tons'}`,
          ]);
          return acc.concat(newRows);
        }, [] as RowInput[]),
      ],
    });
  }
};

export default generateManureInventory;
