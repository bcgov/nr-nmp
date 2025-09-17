import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import {
  FertilizerUnit,
  NMPFileYear,
  SoilTestMethods,
  CalculateNutrientsRow,
  Schedule,
} from '@/types';
import {
  drawStandardHeader,
  addText,
  numberToSuperscript,
  sumPropertyInObjectArr,
} from '../reportingUtils';
import { sharedAutoTableSettings } from '../reportingConstants';
import {
  fertigationToFertigationRows,
  findBalanceMessage,
} from '../../../CalculateNutrients/utils';
import SEASON_APPLICATION from '../../../CalculateNutrients/unseededData';

const generateFieldSummary = (
  doc: jsPDF,
  nmpFileYear: NMPFileYear,
  fertilizerUnits: FertilizerUnit[],
  soilTestMethods: SoilTestMethods[],
  farmName: string,
  year: number,
  pageWidth: number,
) => {
  for (let i = 0; i < nmpFileYear.fields.length; i += 1) {
    doc.addPage();
    const field = nmpFileYear.fields[i];

    // First table shows crops
    autoTable(doc, {
      ...sharedAutoTableSettings,
      // Page Header
      margin: { top: 50 },
      willDrawPage(data) {
        const [nextX, nextY] = drawStandardHeader(data, doc, farmName, year);
        const fieldSummaryY = nextY + 2;
        const updatedNextY = addText(doc, 'Field Summary:', nextX, fieldSummaryY);
        doc.setFont(doc.getFont().fontName, 'bold');
        doc.text(`${field.fieldName}`, nextX + 40, fieldSummaryY);
        doc.setFontSize(10);
        addText(doc, `Area: ${field.area} ac`, nextX + 2, updatedNextY + 4);
        doc.setFont(doc.getFont().fontName, 'normal');
      },
      head: [['Crop', 'Yield', 'Previous crop ploughed down (N credit)']],
      columnStyles: {
        0: { cellWidth: pageWidth * 0.4 },
        1: { cellWidth: pageWidth * 0.2 },
        2: { cellWidth: 'auto' },
      },
      body: field.crops.map((crop) => [
        `${crop.name}`,
        `${crop.yield} ${crop.yieldHarvestUnit ? crop.yieldHarvestUnit : 'ton/ac'}`,
        `${crop.nCredit === 0 ? 'none (no N credit)' : crop.nCredit}`,
      ]),
    });

    // Second table shows the soil test results
    const { soilTest } = field;
    let splitDateStr: string[] | undefined;
    if (soilTest?.sampleDate) {
      splitDateStr = new Date(soilTest.sampleDate).toDateString().split(' ');
    }
    const soilTestName =
      soilTestMethods.find((m) => m.id === soilTest?.soilTestId)?.name || 'not selected';
    autoTable(doc, {
      ...sharedAutoTableSettings,
      head: [
        [
          {
            content: `Soil Test Results: ${splitDateStr ? `${splitDateStr[1]} ${splitDateStr[3]}` : ''}`,
            styles: { lineWidth: { top: 0.5, left: 0.5, bottom: 0.5, right: 0 } },
            colSpan: soilTest ? 1 : undefined,
          },
          {
            content: `Soil test P & K Method: ${soilTestName}`,
            styles: { lineWidth: { top: 0.5, left: 0, bottom: 0.5, right: 0.5 } },
            colSpan: soilTest ? 3 : undefined,
          },
        ],
      ],
      columnStyles: {
        0: { cellWidth: pageWidth * 0.3 },
        1: { cellWidth: pageWidth * 0.3 },
        2: { cellWidth: pageWidth * 0.3 },
        3: { cellWidth: 'auto' },
      },
      body: soilTest
        ? [
            [
              `Nitrate-N: ${soilTest.valNO3H} ppm`,
              `Phosphorus: ${soilTest.valP} ppm`,
              `Potassium: ${soilTest.valK} ppm`,
              `pH: ${soilTest.valPH}`,
            ],
          ]
        : undefined,
      foot: [
        [
          {
            content: `Field Comments: ${field.comment || ''}`,
            styles: { fillColor: [255, 255, 255], fontStyle: 'normal' },
            colSpan: 4,
          },
        ],
      ],
    });

    // Third table is the nutrient application plan (a version of Application Schedule)
    const allApplied = [...field.manures, ...field.fertilizers];
    autoTable(doc, {
      ...sharedAutoTableSettings,
      head: [
        [
          {
            content: `Nutrient Application Plan: ${year}`,
            styles: {
              fillColor: [255, 255, 255],
              lineWidth: { top: 0, left: 0, bottom: 0.5, right: 0 },
            },
            colSpan: 4,
          },
        ],
        ['Nutrient Source', 'Application Timing', 'Method', 'Rate'],
      ],
      columnStyles: {
        0: { cellWidth: pageWidth * 0.26 },
        1: { cellWidth: pageWidth * 0.26 },
        2: { cellWidth: pageWidth * 0.26 },
        3: { cellWidth: 'auto' },
      },
      body:
        allApplied.length > 0
          ? allApplied.map((nutrientSource) => {
              let seasonApplication;
              // Manures, but not fertilizers, have a season and application method
              if ('applicationId' in nutrientSource) {
                seasonApplication = SEASON_APPLICATION.find(
                  (s: any) => s.Id === nutrientSource.applicationId,
                );
                if (!seasonApplication) {
                  throw new Error(`Season application ${nutrientSource.applicationId} not found`);
                }
              }
              return [
                nutrientSource.name,
                seasonApplication?.Season || '',
                seasonApplication?.ApplicationMethod || '',
                // Example display: 10 L/ac
                `${nutrientSource.applicationRate} ${fertilizerUnits.find((f) => f.id === nutrientSource.applUnitId)!.name}`,
              ];
            })
          : [['None planned', '', '', '']],
    });

    // Fourth is the fertigation application plan
    if (field.fertigations.length > 0) {
      autoTable(doc, {
        ...sharedAutoTableSettings,
        head: [
          [
            {
              content: `Fertigation Application Plan: ${year}`,
              styles: {
                fillColor: [255, 255, 255],
                lineWidth: { top: 0, left: 0, bottom: 0.5, right: 0 },
              },
              colSpan: 4,
            },
          ],
          ['Nutrient Source', 'Applications', 'Cadence', 'Start Date'],
        ],
        columnStyles: {
          0: { cellWidth: pageWidth * 0.26 },
          1: { cellWidth: pageWidth * 0.26 },
          2: { cellWidth: pageWidth * 0.26 },
          3: { cellWidth: 'auto' },
        },
        body: field.fertigations.map((fertigation) => [
          fertigation.name,
          fertigation.eventsPerSeason,
          fertigation.eventsPerSeason === 1 ? 'Once' : Schedule[fertigation.schedule!],
          fertigation.startDate!,
        ]),
      });
    }

    // Fifth is the nutrient table shown on Calculate Nutrients
    const tableFootnotes: string[] = [];
    const allRows: CalculateNutrientsRow[] = [
      ...field.crops,
      ...(field.previousYearManureApplicationNCredit
        ? [
            {
              name: "Previous years' manure",
              reqN: field.previousYearManureApplicationNCredit,
              reqP2o5: 0,
              reqK2o: 0,
              remN: 0,
              remP2o5: 0,
              remK2o: 0,
            },
          ]
        : []),
      ...field.fertilizers,
      ...field.manures,
      ...fertigationToFertigationRows(field.fertigations),
      ...field.otherNutrients,
    ];
    const balance = {
      reqN: sumPropertyInObjectArr(allRows, 'reqN'),
      reqP2o5: sumPropertyInObjectArr(allRows, 'reqP2o5'),
      reqK2o: sumPropertyInObjectArr(allRows, 'reqK2o'),
      remN: sumPropertyInObjectArr(allRows, 'remN'),
      remP2o5: sumPropertyInObjectArr(allRows, 'remP2o5'),
      remK2o: sumPropertyInObjectArr(allRows, 'remK2o'),
    };
    autoTable(doc, {
      theme: 'grid',
      styles: {
        lineColor: 'black',
        textColor: 'black',
        lineWidth: 0,
        halign: 'center',
        font: 'BCSans',
      },
      headStyles: { fillColor: [239, 239, 239], lineWidth: 0 },
      head: [
        [
          { content: '', styles: { fillColor: [255, 255, 255] } },
          { content: 'Agronomic (lb/ac)', colSpan: 3 },
          { content: 'Crop Removal (lb/ac)', colSpan: 3 },
        ],
        [
          { content: '', styles: { fillColor: [255, 255, 255], lineWidth: { bottom: 1 } } },
          { content: 'N', styles: { lineWidth: { bottom: 1 } } },
          { content: 'P₂O₅', styles: { lineWidth: { bottom: 1 } } },
          { content: 'K₂O', styles: { lineWidth: { bottom: 1 } } },
          { content: 'N', styles: { lineWidth: { bottom: 1 } } },
          { content: 'P₂O₅', styles: { lineWidth: { bottom: 1 } } },
          { content: 'K₂O', styles: { lineWidth: { bottom: 1 } } },
        ],
      ],
      columnStyles: {
        0: { cellWidth: pageWidth * 0.25, fillColor: [255, 255, 255], halign: 'left' },
        1: { cellWidth: pageWidth * 0.125, fillColor: [239, 239, 239] },
        2: { cellWidth: pageWidth * 0.125, fillColor: [239, 239, 239] },
        3: { cellWidth: pageWidth * 0.125, fillColor: [239, 239, 239] },
        4: { cellWidth: pageWidth * 0.125, fillColor: [239, 239, 239] },
        5: { cellWidth: pageWidth * 0.125, fillColor: [239, 239, 239] },
        6: { cellWidth: 'auto', fillColor: [239, 239, 239] },
      },
      body: allRows.map((row) => {
        let hasFootnote = false;
        if ('crudeProtein' in row && 'crudeProteinAdjusted' in row && row.crudeProteinAdjusted) {
          tableFootnotes.push(`Crude protein adjusted to ${row.crudeProtein}%`);
          hasFootnote = true;
          // TODO: Change this condition to check if this is a field veg w/ a changed N
          // eslint-disable-next-line no-constant-condition
        } else if ('reqN' in row && false) {
          tableFootnotes.push(`Crop required nitrogen adjusted to ${row.reqN}`);
          hasFootnote = true;
        } else if ('nh4Retention' in row && 'nAvailable' in row) {
          let footnote;
          if ('nAvailableAdjusted' in row && row.nAvailableAdjusted) {
            footnote = `1st Yr Organic N Availability adjusted to ${row.nAvailable}%`;
            hasFootnote = true;
          }
          if ('nh4RetentionAdjusted' in row && row.nh4RetentionAdjusted) {
            footnote = `${footnote ? `${footnote}, ` : ''}Ammonium-N Retention adjusted to ${row.nh4Retention}%`;
            hasFootnote = true;
          }
          if (hasFootnote) {
            tableFootnotes.push(footnote!);
          }
        } else if ('density' in row && 'densityAdjusted' in row && row.densityAdjusted) {
          tableFootnotes.push(`Liquid density adjusted to ${row.density}`);
          hasFootnote = true;
        }
        // Some type shenanigans to accomodate fertigation, which has a date
        const rowName = (row as any).date ? `${row.name} on ${(row as any).date}` : row.name;
        return [
          hasFootnote ? `${rowName}${numberToSuperscript(tableFootnotes.length)}` : rowName,
          row.reqN,
          row.reqP2o5,
          row.reqK2o,
          row.remN,
          row.remP2o5,
          row.remK2o,
        ];
      }),
      foot: [
        [
          {
            content: 'Balance',
            styles: { fillColor: [255, 255, 255], fontStyle: 'bold', halign: 'left' },
          },
          `${balance.reqN}`,
          `${balance.reqP2o5}`,
          `${balance.reqK2o}`,
          `${balance.remN}`,
          `${balance.remP2o5}`,
          `${balance.remK2o}`,
        ],
      ],
      footStyles: {
        fillColor: [239, 239, 239],
        lineWidth: { top: 0.5, left: 0, right: 0, bottom: 0 },
        fontStyle: 'italic',
      },
    });

    // Text below table
    doc.setFontSize(10);
    let nextY: number = (doc as any).lastAutoTable.finalY + 5; // type shenanigans
    // First are all of the balance messages, then the table footnotes
    const balanceFootnotes: string[] = [];
    Object.entries(balance).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'name') {
        const message = findBalanceMessage(key, value);
        if (message && message.icon !== '/good.svg') {
          balanceFootnotes.push(message.text.replace('{0}', Math.abs(value ?? 0).toFixed(1)));
        }
      }
    });
    if (balanceFootnotes.length > 0) {
      nextY = addText(doc, 'Considerations:', 15, nextY + 2);
      balanceFootnotes.forEach((footnote) => {
        nextY = addText(doc, footnote, 15, nextY);
      });
    }
    if (tableFootnotes.length > 0) {
      nextY = addText(doc, 'Assumptions:', 15, nextY + 2);
      tableFootnotes.forEach((footnote, j) => {
        nextY = addText(doc, `${j + 1}   ${footnote}`, 15, nextY);
      });
    }
  }
};

export default generateFieldSummary;
