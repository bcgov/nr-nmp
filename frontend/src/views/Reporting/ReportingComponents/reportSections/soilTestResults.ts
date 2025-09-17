import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { NMPFileYear, SoilTestMethods } from '@/types';
import { drawStandardHeader, addText } from '../reportingUtils';
import { sharedAutoTableSettings } from '../reportingConstants';
import { DEFAULT_SOIL_TEST } from '@/constants';

const generateSoilTestResults = (
  doc: jsPDF,
  nmpFileYear: NMPFileYear,
  soilTestMethods: SoilTestMethods[],
  farmName: string,
  year: number,
  pageWidth: number,
) => {
  doc.addPage();
  // If any soil test is defined, all fields use the same ST method
  const soilTests = nmpFileYear.fields.map((f) => f.soilTest).filter((s) => s !== undefined);
  // The first table just shows the name of the soil test
  autoTable(doc, {
    ...sharedAutoTableSettings,
    // Page Header
    margin: { top: 40 },
    willDrawPage(data) {
      const [nextX, nextY] = drawStandardHeader(data, doc, farmName, year);
      doc.setFont(doc.getFont().fontName, 'bold');
      addText(doc, 'Soil Test Results', nextX, nextY + 2);
      doc.setFont(doc.getFont().fontName, 'normal');
    },
    columnStyles: {
      0: { cellWidth: pageWidth * 0.35 },
      1: { cellWidth: 'auto' },
    },
    // Table
    body: [
      [
        {
          content: 'Soil Test P and K Method',
          styles: { fillColor: [164, 205, 215], fontStyle: 'bold' },
        },
        soilTests.length > 0
          ? soilTestMethods.find((m) => m.id === soilTests[0].soilTestId)!.name
          : 'Not Specified',
      ],
    ],
  });

  // The second table has the soil test results for each field
  autoTable(doc, {
    ...sharedAutoTableSettings,
    head: [
      [
        'Field',
        'Sampling Date',
        `${year} Crops`,
        'pH',
        'NO₃-N (ppm)',
        'Soil Test P (ppm)',
        'Soil Test K (ppm)',
      ],
    ],
    columnStyles: {
      0: { cellWidth: pageWidth * 0.2 },
      1: { cellWidth: pageWidth * 0.15 },
      2: { cellWidth: pageWidth * 0.25 },
      3: { cellWidth: pageWidth * 0.1 },
      4: { cellWidth: pageWidth * 0.1 },
      5: { cellWidth: pageWidth * 0.1 },
      6: { cellWidth: 'auto' },
    },
    body: nmpFileYear.fields.map((field) => {
      const soilTest = field.soilTest || DEFAULT_SOIL_TEST;
      let splitDateStr: string[] | undefined;
      if (soilTest?.sampleDate) {
        splitDateStr = new Date(soilTest.sampleDate).toDateString().split(' ');
      }
      return [
        field.fieldName,
        splitDateStr ? `${splitDateStr[1]} ${splitDateStr[3]}` : 'Default Values',
        `${field.crops.map((c) => `${c.name}`).join('\n')}`,
        soilTest.valPH!,
        soilTest.valNO3H!,
        soilTest.valP!,
        soilTest.valK!,
      ];
    }),
  });
};

export default generateSoilTestResults;
