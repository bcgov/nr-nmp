/* eslint-disable prefer-const */
import { jsPDF } from 'jspdf';
import { autoTable, CellInput, HookData, RowInput, UserOptions } from 'jspdf-autotable';
import { DAIRY_COW_ID, DEFAULT_SOIL_TEST } from '@/constants';
import {
  CalculateNutrientsRow,
  FertilizerUnit,
  ManureType,
  NMPFile,
  NMPFileField,
  NMPFileManure,
  NMPFileManureStorageSystem,
  NMPFileYear,
  Schedule,
  SoilTestMethods,
  SoilTestNutrientRange,
  MaterialRemainingData,
} from '@/types';
import SEASON_APPLICATION from '../CalculateNutrients/unseededData';
import {
  addText,
  getFertilizerUnitKgPerAcreConversion,
  getFertilizerUnitUSGallonPerAcreConversion,
  numberToSuperscript,
} from './utils';
import { fertigationToFertigationRows, findBalanceMessage } from '../CalculateNutrients/utils';
import { printNum, sumPropertyInObjectArr } from '@/utils/utils';

const sharedAutoTableSettings: Partial<UserOptions> = {
  theme: 'grid',
  styles: { lineColor: 'black', lineWidth: 0.5, textColor: 'black', font: 'BCSans' },
  headStyles: { fillColor: [164, 205, 215], lineWidth: 0.5 },
};

type FertilizerRequiredStep = {
  name: string;
  totalAmount: number;
  unit: string;
};

// Each page of the full report will start with this
const drawStandardHeader = (data: HookData, doc: jsPDF, farmName: string, year: string) => {
  doc.setFontSize(14);
  const x = Math.ceil(data.settings.margin.left);
  let nextY = Math.ceil(data.settings.margin.left);
  nextY = addText(doc, `Farm Name: ${farmName}`, x, nextY);
  nextY = addText(doc, `Planning Year: ${year}`, x, nextY);
  return [x, nextY];
};

const generateApplicationSchedule = (
  doc: jsPDF,
  pageWidth: number,
  farmName: string,
  year: string,
  nmpFileYear: NMPFileYear,
  fertilizerUnits: FertilizerUnit[],
) => {
  for (let i = 0; i < nmpFileYear.fields.length; i += 1) {
    const field = nmpFileYear.fields[i];
    const allApplied = [...field.manures, ...field.fertilizers];
    autoTable(doc, {
      ...sharedAutoTableSettings,
      // Page Header
      margin: { top: i === 0 ? 40 : undefined },
      willDrawPage(data) {
        const [nextX, nextY] = drawStandardHeader(data, doc, farmName, year);
        doc.setFont(doc.getFont().fontName, 'bold');
        addText(doc, 'Application Schedule', nextX, nextY + 2);
        doc.setFont(doc.getFont().fontName, 'normal');
      },
      // Table
      head: [
        [
          {
            content: `Field: ${field.fieldName}`,
            styles: {
              fontStyle: 'normal',
              fillColor: [255, 255, 255],
              lineWidth: { top: 0.5, left: 0.5, bottom: 0.5, right: 0 },
              cellWidth: pageWidth * 0.2,
            },
          },
          {
            content: `Area: ${field.area} ac`,
            styles: {
              fontStyle: 'normal',
              fillColor: [255, 255, 255],
              lineWidth: { top: 0.5, left: 0, bottom: 0.5, right: 0 },
              cellWidth: pageWidth * 0.15,
            },
          },
          {
            content: `Crops: ${field.crops.map((c) => `${c.name}`).join('\n             ')}`, // newline + spaces
            styles: {
              fontStyle: 'normal',
              fillColor: [255, 255, 255],
              lineWidth: { top: 0.5, left: 0, bottom: 0.5, right: 0.5 },
            },
          },
        ],
        ['Nutrient Source', 'Application Timing', 'Rate'], // column names
      ],
      columnStyles: {
        0: { cellWidth: pageWidth * 0.35 },
        1: { cellWidth: pageWidth * 0.25 },
        2: { cellWidth: 'auto' },
      },
      body:
        allApplied.length > 0
          ? allApplied.map((nutrientSource) => [
              nutrientSource.name,
              // Manures, but not fertilizers, have a season
              'applicationId' in nutrientSource
                ? SEASON_APPLICATION.find((s) => s.Id === nutrientSource.applicationId)!.Season
                : '',
              // Example display: 10 L/ac
              `${nutrientSource.applicationRate} ${fertilizerUnits.find((f) => f.id === nutrientSource.applUnitId)!.name}`,
            ])
          : [['None planned', '', '']],
      foot: [
        [
          {
            content: `Comments: ${field.comment || ''}`,
            styles: {
              fillColor: [255, 255, 255],
              fontStyle: 'normal',
              lineWidth: { top: 0.5, left: 0, bottom: 0, right: 0 },
            },
            colSpan: 3,
          },
        ],
      ],
    });
  }
};

const generateManureCompostInventory = (
  doc: jsPDF,
  pageWidth: number,
  farmName: string,
  year: string,
  nmpFileYear: NMPFileYear,
  unassignedManures: NMPFileManure[],
) => {
  const storageSystems = nmpFileYear.manureStorageSystems || [];
  if (storageSystems.length > 0 || unassignedManures.length > 0) {
    doc.addPage();
    // TODO: Check on this
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
          const newRows: CellInput[][] = [];
          let storageSum = 0;
          let totalWashWater = 0;
          system.manuresInSystem.forEach((m) => {
            // The *actual* annual amount needs to remove wash water and
            // take into account solid-liquid separation
            let { annualAmount } = m.data;
            if (
              m.type === 'Generated' &&
              m.data.originalAnnualAmount !== undefined &&
              m.data.originalWashWaterAmount !== undefined
            ) {
              annualAmount = m.data.originalAnnualAmount;
              totalWashWater += m.data.originalWashWaterAmount;
            }
            if (system.manureType === ManureType.Liquid && system.percentLiquidSeperation > 0) {
              annualAmount *= (100 - system.percentLiquidSeperation) / 100;
            }
            storageSum += annualAmount;
            // \t doesn't work in this new font so I used spaces
            newRows.push([
              `        ${m.data.uniqueMaterialName}`,
              `${printNum(annualAmount)} ${m.data.manureType === ManureType.Liquid ? 'US gallons' : 'tons'}`,
            ]);
          });
          if (totalWashWater > 0) {
            // Wash water is also affected by solid-liquid separation
            if (system.manureType === ManureType.Liquid && system.percentLiquidSeperation > 0) {
              totalWashWater *= (100 - system.percentLiquidSeperation) / 100;
            }
            storageSum += totalWashWater;
            newRows.push(['Milking Center Wash Water', `${printNum(totalWashWater)} US gallons`]);
          }
          if (system.annualPrecipitation) {
            const { annualPrecipitation } = system;
            storageSum += annualPrecipitation;
            newRows.push([
              'Precipitation',
              `${printNum(annualPrecipitation)} ${system.manureType === ManureType.Liquid ? 'US gallons' : 'tons'}`,
            ]);
          }

          // The title is prepended to the array with the sum
          newRows.unshift([
            { content: system.name, styles: { fontStyle: 'bold' } },
            {
              content: `${printNum(storageSum)} ${system.manureType === ManureType.Liquid ? 'US gallons' : 'tons'}`,
              styles: { fontStyle: 'bold' },
            },
          ]);

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
            `${printNum(manure.annualAmount)} ${manure.manureType === ManureType.Liquid ? 'US gallons' : 'tons'}`,
          ]);
          return acc.concat(newRows);
        }, [] as RowInput[]),
      ],
    });
  }
};

const generateManureAndCompostUse = (
  doc: jsPDF,
  pageWidth: number,
  farmName: string,
  year: string,
  nmpFileYear: NMPFileYear,
  materialRemainingData: MaterialRemainingData | null,
) => {
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
    body: nmpFileYear.nutrientAnalyses.map((analysis) => {
      let landApplied = 'N/A';
      let amountRemaining = 'N/A';

      if (materialRemainingData) {
        const allMaterials = [
          ...materialRemainingData.appliedStoredManures,
          ...materialRemainingData.appliedImportedManures,
        ];
        const matchingMaterial = allMaterials.find(
          (material) => material.sourceUuid === analysis.sourceUuid,
        );

        if (matchingMaterial) {
          const unit = analysis.solidLiquid === 'Solid' ? 'tons' : 'US gallons';

          // Format land-applied with percentage
          landApplied = `${printNum(matchingMaterial.totalApplied)} ${unit} (${matchingMaterial.wholePercentApplied}%)`;

          // Format amount remaining - show "None" if less than 10%, otherwise show amount with percentage
          if (matchingMaterial.wholePercentRemaining < 10) {
            amountRemaining = 'None';
          } else {
            amountRemaining = `${printNum(matchingMaterial.totalAnnualManureRemainingToApply)} (${matchingMaterial.wholePercentRemaining}%)`;
          }
        }
      }

      return [
        analysis.manureName,
        analysis.uniqueMaterialName,
        `${printNum(analysis.annualAmount)} ${analysis.solidLiquid === 'Solid' ? 'tons' : 'US gallons'}`,
        landApplied,
        amountRemaining,
      ];
    }),
  });
};

const generateLiquidStorageCapacity = (
  doc: jsPDF,
  pageWidth: number,
  storageSystems: NMPFileManureStorageSystem[],
) => {
  // This is on the same page as the previous table (Manure and Compost Use)
  for (let i = 0; i < storageSystems.length; i += 1) {
    const system = storageSystems[i];
    // eslint-disable-next-line no-continue
    if (system.manureType === ManureType.Solid) continue;
    const totalStored = 9999;
    const totalStorageVolume = system.manureStorages.reduce((acc, m) => acc + m.volumeUSGallons, 0);
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
        [{ content: 'Material Stored (October to March)', styles: { fontStyle: 'bold' } }, '', ''],
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
};

const generateFertilizerRequired = (
  doc: jsPDF,
  pageWidth: number,
  farmName: string,
  year: string,
  nmpFileYear: NMPFileYear,
  fertilizerUnits: FertilizerUnit[],
) => {
  const fertilizers: FertilizerRequiredStep[] =
    // Group fertilizers across each field by name and sum the amounts
    nmpFileYear.fields.reduce((acc, field) => {
      field.fertilizers.forEach((fert) => {
        let idx = acc.findIndex((f) => f.name === fert.name);
        if (idx === -1) {
          idx = acc.length;
          const fertilizerUnit = fertilizerUnits.find((u) => u.id === fert.applUnitId);
          if (fertilizerUnit === undefined) {
            throw new Error(`Fertilizer unit ${fert.applUnitId} not found.`);
          }
          acc.push({
            name: fert.name,
            totalAmount: 0,
            unit: fertilizerUnit.dryliquid === 'dry' ? 'kg' : 'US gallons',
          });
        }
        // Add the converted amount and field acreage
        const stats = acc[idx];
        stats.totalAmount +=
          // Converts to kg/ac or US gal/ac and multiplies by # of acres
          fert.applicationRate *
          (stats.unit === 'kg'
            ? getFertilizerUnitKgPerAcreConversion(fert.applUnitId)
            : getFertilizerUnitUSGallonPerAcreConversion(fert.applUnitId)) *
          field.area;
      });
      return acc;
    }, [] as FertilizerRequiredStep[]);

  if (fertilizers.length > 0) {
    doc.addPage();
    autoTable(doc, {
      ...sharedAutoTableSettings,
      // Page Header
      margin: { top: 40 },
      willDrawPage(data) {
        const [nextX, nextY] = drawStandardHeader(data, doc, farmName, year);
        doc.setFont(doc.getFont().fontName, 'bold');
        addText(doc, 'Fertilizer Required', nextX, nextY + 2);
        doc.setFont(doc.getFont().fontName, 'normal');
      },
      // Table
      head: [['Material', `Total Amount Required in ${nmpFileYear.year}`]],
      columnStyles: {
        0: { cellWidth: pageWidth * 0.6 },
        1: { cellWidth: 'auto' },
      },
      body: fertilizers.map((f) => [f.name, `${printNum(f.totalAmount)} ${f.unit}`]),
    });
  }
};

const generateFieldSummary = (
  doc: jsPDF,
  pageWidth: number,
  farmName: string,
  year: string,
  field: NMPFileField,
  fertilizerUnits: FertilizerUnit[],
  soilTestMethods: SoilTestMethods[],
  phosphorousRanges: SoilTestNutrientRange[],
  potassiumRanges: SoilTestNutrientRange[],
) => {
  doc.addPage();
  // First table shows crops
  autoTable(doc, {
    ...sharedAutoTableSettings,
    // Page Header
    margin: { top: 50 },
    willDrawPage(data) {
      let [nextX, nextY] = drawStandardHeader(data, doc, farmName, year);
      const fieldSummaryY = nextY + 2;
      nextY = addText(doc, 'Field Summary:', nextX, fieldSummaryY);
      doc.setFont(doc.getFont().fontName, 'bold');
      doc.text(`${field.fieldName}`, nextX + 40, fieldSummaryY);
      doc.setFontSize(10);
      addText(doc, `Area: ${field.area} ac`, nextX + 2, nextY + 4);
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
            `Phosphorous: ${soilTest.valP} ppm (${phosphorousRanges.find((r) => soilTest.valP! < r.upperlimit)?.rating || ''})`,
            `Potassium: ${soilTest.valK} ppm (${potassiumRanges.find((r) => soilTest.valK! < r.upperlimit)?.rating || ''})`,
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
                (s) => s.Id === nutrientSource.applicationId,
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
      } else if ('reqN' in row && 'reqNAdjusted' in row && row.reqNAdjusted) {
        tableFootnotes.push(`Crop required nitrogen adjusted to ${Math.abs(row.reqN)}`);
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
};

const generateManureAndCompostAnalysis = (
  doc: jsPDF,
  pageWidth: number,
  farmName: string,
  year: string,
  nmpFileYear: NMPFileYear,
  unassignedManures: NMPFileManure[],
  hasDairyCattle: boolean,
) => {
  const footnotes: string[] = [];
  doc.addPage();
  autoTable(doc, {
    ...sharedAutoTableSettings,
    // Page Header
    margin: { top: 45 },
    willDrawPage(data) {
      let [nextX, nextY] = drawStandardHeader(data, doc, farmName, year);
      doc.setFont(doc.getFont().fontName, 'bold');
      nextY = addText(doc, 'Manure and Compost Analysis', nextX, nextY + 2);
      doc.setFont(doc.getFont().fontName, 'normal');
      doc.setFontSize(10);
      addText(
        doc,
        'All results are provided on an as-received (wet weight) basis.',
        nextX,
        nextY + 4,
      );
    },
    // Table
    head: [
      [
        'Source of Material',
        'Material Type',
        'Moisture (%)',
        'Total N (%)',
        'NH₄-N (ppm)',
        'P (%)',
        'K (%)',
      ],
    ],
    columnStyles: {
      0: { cellWidth: pageWidth * 0.21 },
      1: { cellWidth: pageWidth * 0.21 },
      2: { cellWidth: pageWidth * 0.14 },
      3: { cellWidth: pageWidth * 0.14 },
      4: { cellWidth: pageWidth * 0.14 },
      5: { cellWidth: pageWidth * 0.08 },
      6: { cellWidth: 'auto' },
    },
    body: nmpFileYear.nutrientAnalyses.map((analysis) => {
      let hasFootnote = false;
      if (hasDairyCattle && unassignedManures.some((m) => m.uuid === analysis.sourceUuid)) {
        footnotes.push(
          `${analysis.uniqueMaterialName} includes materials that have not been allocated to a storage.`,
        );
        hasFootnote = true;
      }
      return [
        hasFootnote
          ? `${analysis.uniqueMaterialName}${numberToSuperscript(footnotes.length)}`
          : analysis.uniqueMaterialName,
        analysis.manureName,
        analysis.moisture,
        analysis.N,
        analysis.NH4N,
        analysis.P,
        analysis.K,
      ];
    }),
  });
  // Text below table
  doc.setFontSize(10);
  let nextY: number = (doc as any).lastAutoTable.finalY + 5; // type shenanigans
  footnotes.forEach((footnote, i) => {
    nextY = addText(doc, `${i + 1}   ${footnote}`, 15, nextY);
  });
};

const generateSoilTestResults = (
  doc: jsPDF,
  pageWidth: number,
  farmName: string,
  year: string,
  nmpFileYear: NMPFileYear,
  soilTestMethods: SoilTestMethods[],
  phosphorousRanges: SoilTestNutrientRange[],
  potassiumRanges: SoilTestNutrientRange[],
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
        `${nmpFileYear.year} Crops`,
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
        `${soilTest.valP} ${phosphorousRanges.find((r) => soilTest.valP! < r.upperlimit)?.rating || ''}`,
        `${soilTest.valK} ${potassiumRanges.find((r) => soilTest.valK! < r.upperlimit)?.rating || ''}`,
      ];
    }),
  });
};

export default async function makeFullReportPdf(
  nmpFile: NMPFile,
  fertilizerUnits: FertilizerUnit[],
  soilTestMethods: SoilTestMethods[],
  phosphorousRanges: SoilTestNutrientRange[],
  potassiumRanges: SoilTestNutrientRange[],
  materialRemainingData: MaterialRemainingData | null,
) {
  // eslint-disable-next-line new-cap
  const doc = new jsPDF();
  doc.setFont('BCSans');
  const pageWidth: number = doc.internal.pageSize.getWidth() - 30;
  const { farmName, year } = nmpFile.farmDetails;

  const nmpFileYear = nmpFile.years[0];
  const unassignedManures = [
    ...(nmpFileYear.generatedManures || []),
    ...(nmpFileYear.importedManures || []),
    ...(nmpFileYear.derivedManures || []),
  ].filter((m) => !m.assignedToStoredSystem);
  const hasDairyCattle = (nmpFileYear.farmAnimals || []).some(
    (animal) => animal.animalId === DAIRY_COW_ID,
  );
  const storageSystems = nmpFileYear.manureStorageSystems || [];

  // First page: Table of Contents
  // TODO: Add Table of Contents as the first page and page number

  // Second page: Application Schedule
  generateApplicationSchedule(doc, pageWidth, farmName, year, nmpFileYear, fertilizerUnits);

  // Third page: Manure/Compost Inventory
  generateManureCompostInventory(doc, pageWidth, farmName, year, nmpFileYear, unassignedManures);

  // Optional page: Manure and Compost Use
  if (nmpFileYear.nutrientAnalyses.length > 0) {
    generateManureAndCompostUse(doc, pageWidth, farmName, year, nmpFileYear, materialRemainingData);
    generateLiquidStorageCapacity(doc, pageWidth, storageSystems);
  }

  // Fourth page: Fertilizer Required
  generateFertilizerRequired(doc, pageWidth, farmName, year, nmpFileYear, fertilizerUnits);

  // Per field: Field Summary page
  for (let i = 0; i < nmpFileYear.fields.length; i += 1) {
    const field = nmpFileYear.fields[i];
    generateFieldSummary(
      doc,
      pageWidth,
      farmName,
      year,
      field,
      fertilizerUnits,
      soilTestMethods,
      phosphorousRanges,
      potassiumRanges,
    );
  }

  // Optional page: Manure and Compost Analysis
  if (nmpFileYear.nutrientAnalyses.length > 0) {
    generateManureAndCompostAnalysis(
      doc,
      pageWidth,
      farmName,
      year,
      nmpFileYear,
      unassignedManures,
      hasDairyCattle,
    );
  }

  // Last page: Soil Test Results
  generateSoilTestResults(
    doc,
    pageWidth,
    farmName,
    year,
    nmpFileYear,
    soilTestMethods,
    phosphorousRanges,
    potassiumRanges,
  );

  // Download document
  const prependDate = new Date().toLocaleDateString('sv-SE', { dateStyle: 'short' });
  doc.save(`${prependDate}-${farmName}-Full-Report.pdf`);
  return doc;
}
