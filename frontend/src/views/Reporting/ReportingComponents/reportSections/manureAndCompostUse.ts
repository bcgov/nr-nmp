import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { ManureType, NMPFileYear } from '@/types';
import { drawStandardHeader, addText } from '../reportingUtils';
import { sharedAutoTableSettings } from '../reportingConstants';

const generateManureAndCompostUse = (
  doc: jsPDF,
  nmpFileYear: NMPFileYear,
  farmName: string,
  year: number,
  pageWidth: number,
) => {
  if (nmpFileYear.nutrientAnalyses.length > 0) {
    // ---------- MANURE AND COMPOST USE ---------- //
    doc.addPage();
    autoTable(doc, {
      ...sharedAutoTableSettings,
      // Page Header
      margin: { top: 40 },
      willDrawPage(data) {
        const [nextX, nextY] = drawStandardHeader(data, doc, farmName, year);
        doc.setFont(doc.getFont().fontName, 'bold');
        addText(doc, 'Manure and Compost Use', nextX, nextY + 2);
        doc.setFont(doc.getFont().fontName, 'normal');
      },
      // Table
      head: [['Material', 'Material Source', 'Annual Amount', 'Land-applied', 'Amount Remaining']],
      columnStyles: {
        0: { cellWidth: pageWidth * 0.25 },
        1: { cellWidth: pageWidth * 0.25 },
        2: { cellWidth: pageWidth * 0.17 },
        3: { cellWidth: pageWidth * 0.17 },
        4: { cellWidth: 'auto' },
      },
      body: nmpFileYear.nutrientAnalyses.map((analysis) => [
        analysis.manureName,
        analysis.uniqueMaterialName,
        `${Math.round(analysis.annualAmount)} ${analysis.solidLiquid === 'Solid' ? 'tons' : 'US gallons'}`,
        'TBC',
        // TODO: Add logic for this footnote:
        // "If the amount remaining is less than 10% of the annual amount, then the amount remaining is insignificant (i.e. within the margin of error of the calculations)"
        'TBC',
      ]),
    });

    // ---------- LIQUID STORAGE CAPACITY ---------- //
    // On the same page as Manure and Compost Use
    const storageSystems = nmpFileYear.manureStorageSystems || [];
    for (let i = 0; i < storageSystems.length; i += 1) {
      const system = storageSystems[i];
      // eslint-disable-next-line no-continue
      if (system.manureType === ManureType.Solid) continue;
      const totalStored = 9999;
      const totalStorageVolume = system.manureStorages.reduce(
        (acc: number, m: any) => acc + m.volumeUSGallons,
        0,
      );
      autoTable(doc, {
        ...sharedAutoTableSettings,
        // Table
        head: [[system.name, 'October to March volume']],
        columnStyles: {
          0: { cellWidth: pageWidth * 0.6 },
          1: { cellWidth: 'auto' },
        },
        // \t doesn't work in this new font so I used spaces
        body: [
          [
            { content: 'Material Stored (October to March)', styles: { fontStyle: 'bold' } },
            '',
            '',
          ],
          ['        Materials Generated or Imported', `_ US gallons`],
          ['        Yard/Roof Runoff', `_ US gallons`],
          ['        Precipitation, Direct into Storage', `_ US gallons`],
          [
            { content: '        Total Stored', styles: { fontStyle: 'bold' } },
            `${totalStored} US gallons`,
          ],
          [
            { content: 'Storage Volume', styles: { fontStyle: 'bold' } },
            `${totalStorageVolume} US gallons`,
          ],
        ],
      });
      if (totalStored > totalStorageVolume) {
        // Text below table
        doc.setFontSize(10);
        const nextY: number = (doc as any).lastAutoTable.finalY + 5; // type shenanigans
        addText(
          doc,
          'There may not be enough capacity to contain the manure and water to be stored during the non-growing season of an average year.',
          15,
          nextY,
        );
      }
    }
  }
};

export default generateManureAndCompostUse;
