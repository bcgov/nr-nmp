/* eslint-disable prefer-const */
import { useContext, useEffect, useMemo, useState } from 'react';
import { jsPDF } from 'jspdf';
import { autoTable, CellInput, HookData, RowInput, UserOptions } from 'jspdf-autotable';
import { Button, ButtonGroup } from '@bcgov/design-system-react-components';
import Grid from '@mui/material/Grid';
import { useNavigate } from 'react-router-dom';
import { SectionHeader } from './reporting.styles';
import { View } from '../../components/common';
import { CALCULATE_NUTRIENTS } from '@/constants/routes';

import useAppState from '@/hooks/useAppState';
import { APICacheContext } from '@/context/APICacheContext';
import SEASON_APPLICATION from '../CalculateNutrients/unseededData';
import { FertilizerUnit, ManureType, SoilTestMethods } from '@/types';
import { DAIRY_COW_ID, DEFAULT_SOIL_TEST } from '@/constants';
import {
  getFertilizerUnitKgPerAcreConversion,
  getFertilizerUnitUSGallonPerAcreConversion,
} from './utils';

type FertilizerRequiredStep = {
  name: string;
  totalAmount: number;
  unit: string;
};

const sharedAutoTableSettings: Partial<UserOptions> = {
  theme: 'grid',
  styles: { lineColor: 'black', lineWidth: 0.5, textColor: 'black' },
  headStyles: { fillColor: [164, 205, 215], lineWidth: 0.5 },
};

// https://stackoverflow.com/questions/65942761/jspdf-add-text-after-another-dynamic-text
function addText(doc: jsPDF, text: string, start: number, nextY: number) {
  doc.text(text, start, nextY, { maxWidth: 180 });
  return Math.ceil(doc.getTextDimensions(doc.splitTextToSize(text, 180)).h) + 2 + nextY;
}

export default function Reporting() {
  const { state } = useAppState();
  const navigate = useNavigate();
  const apiCache = useContext(APICacheContext);
  const [fertilizerUnits, setFertilizerUnits] = useState<FertilizerUnit[]>([]);
  const [soilTestMethods, setSoilTestMethods] = useState<SoilTestMethods[]>([]);

  const unassignedManures = useMemo(
    () =>
      [
        ...(state.nmpFile.years[0].generatedManures || []),
        ...(state.nmpFile.years[0].importedManures || []),
      ].filter((m) => !m.assignedToStoredSystem),
    [state.nmpFile.years],
  );

  const isDairyCattle = useMemo(() => {
    const animalList = state.nmpFile?.years[0].farmAnimals || [];
    return animalList.some((animal) => animal.animalId === DAIRY_COW_ID);
  }, [state.nmpFile?.years]);

  // Fetch all of the data tables needed to generate the report
  useEffect(() => {
    apiCache
      .callEndpoint('api/fertilizerunits/')
      .then((response: { status?: any; data: FertilizerUnit[] }) => {
        if (response.status === 200) {
          setFertilizerUnits(response.data);
        }
      });
    apiCache
      .callEndpoint('api/soiltestmethods/')
      .then((response: { status?: any; data: SoilTestMethods[] }) => {
        if (response.status === 200) {
          setSoilTestMethods(response.data);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function downloadBlob() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(state.nmpFile)], { type: 'application/json' }),
    );
    const a = document.createElement('a');
    a.href = url;

    const prependDate = new Date().toLocaleDateString('sv-SE', { dateStyle: 'short' });
    const farmName = state.nmpFile?.farmDetails?.farmName;

    a.download = `${prependDate}-${farmName}.nmp`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Each page of the full report will start with this
  const drawStandardHeader = (data: HookData, doc: jsPDF) => {
    doc.setFontSize(14);
    const x = Math.ceil(data.settings.margin.left);
    let nextY = Math.ceil(data.settings.margin.left);
    nextY = addText(doc, `Farm Name: ${state.nmpFile.farmDetails.farmName}`, x, nextY);
    nextY = addText(doc, `Planning Year: ${state.nmpFile.farmDetails.year}`, x, nextY);
    return [x, nextY];
  };

  const makeFullReportPdf = async () => {
    // eslint-disable-next-line new-cap
    const doc = new jsPDF();
    const pageWidth: number = doc.internal.pageSize.getWidth() - 30;
    const nmpFileYear = state.nmpFile.years[0];

    // TODO: Add Table of Contents as the first page

    // ---------- APPLICATION SCHEDULE ---------- // DONE
    for (let i = 0; i < nmpFileYear.fields.length; i += 1) {
      const field = nmpFileYear.fields[i];
      // QUESTION: Should fertigation go in this table?
      const allApplied = [...field.manures, ...field.fertilizers];
      autoTable(doc, {
        ...sharedAutoTableSettings,
        // Page Header
        margin: { top: i === 0 ? 40 : undefined },
        willDrawPage(data) {
          let [nextX, nextY] = drawStandardHeader(data, doc);
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
              content: `Crops: ${field.crops.map((c) => `${c.name}`).join('\n\t    ')}`, // newline + tab + spaces
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
          1: { cellWidth: pageWidth * 0.2 },
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
      });
      // Text below table
      doc.setFontSize(10);
      const nextY: number = (doc as any).lastAutoTable.finalY + 5; // type shenanigans
      addText(doc, `Comments: ${field.comment}`, 15, nextY);
    }

    // ---------- MANURE/COMPOST INVENTORY ---------- //
    doc.addPage();
    const storageSystems = nmpFileYear.manureStorageSystems || [];
    autoTable(doc, {
      ...sharedAutoTableSettings,
      // Page Header
      margin: { top: 40 },
      willDrawPage(data) {
        let [nextX, nextY] = drawStandardHeader(data, doc);
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
      body:
        storageSystems.length === 0 && unassignedManures.length === 0
          ? [['TODO']]
          : [
              ...storageSystems.reduce((acc, system) => {
                // For a storage system, the rows are the system name in bold,
                // a row for each manure in the system, an extra row if the manure
                // is a Milking Cow for the wash water, and a final row for
                // precipitation, if the system contains any
                const newRows: CellInput[][] = [
                  [{ content: system.name, styles: { fontStyle: 'bold' } }, ''],
                ];
                system.manuresInSystem.forEach((m) => {
                  newRows.push([
                    `\t${m.data.uniqueMaterialName}`,
                    `${m.data.annualAmount} ${m.data.manureType === ManureType.Liquid ? 'US gallons' : 'tons'}`,
                  ]);
                  // TODO: Add Milking Centre Wash Water
                });
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
                  `\t${manure.uniqueMaterialName}`,
                  `${manure.annualAmount} ${manure.manureType === ManureType.Liquid ? 'US gallons' : 'tons'}`,
                ]);
                return acc.concat(newRows);
              }, [] as RowInput[]),
            ],
    });

    if (nmpFileYear.nutrientAnalyses.length > 0) {
      // ---------- MANURE AND COMPOST USE ---------- //
      doc.addPage();
      autoTable(doc, {
        ...sharedAutoTableSettings,
        // Page Header
        margin: { top: 40 },
        willDrawPage(data) {
          let [nextX, nextY] = drawStandardHeader(data, doc);
          doc.setFont(doc.getFont().fontName, 'bold');
          addText(doc, 'Manure and Compost Use', nextX, nextY + 2);
          doc.setFont(doc.getFont().fontName, 'normal');
        },
        // Table
        head: [
          ['Material', 'Material Source', 'Annual Amount', 'Land-applied', 'Amount Remaining'],
        ],
        columnStyles: {
          0: { cellWidth: pageWidth * 0.25 },
          1: { cellWidth: pageWidth * 0.25 },
          2: { cellWidth: pageWidth * 0.17 },
          3: { cellWidth: pageWidth * 0.14 },
          4: { cellWidth: 'auto' },
        },
        body: nmpFileYear.nutrientAnalyses.map((analysis) => [
          analysis.manureName,
          analysis.uniqueMaterialName,
          `${Math.round(analysis.annualAmount)} ${analysis.solidLiquid === 'Solid' ? 'tons' : 'US gallons'}`,
          'TBC',
          'TBC',
        ]),
      });

      // ---------- LIQUID STORAGE CAPACITY ---------- //
      // On the same page as Manure and Compost Use
      for (let i = 0; i < storageSystems.length; i += 1) {
        const system = storageSystems[i];
        // eslint-disable-next-line no-continue
        if (system.manureType === ManureType.Solid) continue;
        const totalStored = 9999;
        const totalStorageVolume = system.manureStorages.reduce(
          (acc, m) => acc + m.volumeUSGallons,
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
          body: [
            [
              { content: 'Material Stored (October to March)', styles: { fontStyle: 'bold' } },
              '',
              '',
            ],
            ['\tMaterials Generated or Imported', `_ US gallons`],
            ['\tYard/Roof Runoff', `_ US gallons`],
            ['\tPrecipitation, Direct into Storage', `_ US gallons`],
            [
              { content: '\tTotal Stored', styles: { fontStyle: 'bold' } },
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

    // ---------- FERTILIZER REQUIRED ---------- //
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
          let [nextX, nextY] = drawStandardHeader(data, doc);
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
        body: fertilizers.map((f) => [f.name, `${Math.round(f.totalAmount)} ${f.unit}`]),
      });
    }

    // ---------- FIELD SUMMARY ---------- //
    for (let i = 0; i < nmpFileYear.fields.length; i += 1) {
      doc.addPage();
      const field = nmpFileYear.fields[i];

      // First table shows crops
      autoTable(doc, {
        ...sharedAutoTableSettings,
        // Page Header
        margin: { top: 50 },
        willDrawPage(data) {
          let [nextX, nextY] = drawStandardHeader(data, doc);
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
      // QUESTION: Should fertigation go in this table?
      const allApplied = [...field.manures, ...field.fertilizers];
      autoTable(doc, {
        ...sharedAutoTableSettings,
        head: [
          [
            {
              content: `Nutrient Application Plan: ${nmpFileYear.year}`,
              styles: {
                fontStyle: 'bold',
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
    }

    // ---------- MANURE AND COMPOST ANALYSIS ---------- //
    if (nmpFileYear.nutrientAnalyses.length > 0) {
      doc.addPage();
      autoTable(doc, {
        ...sharedAutoTableSettings,
        // Page Header
        margin: { top: 45 },
        willDrawPage(data) {
          let [nextX, nextY] = drawStandardHeader(data, doc);
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
            'NH4-N (ppm)',
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
        body: nmpFileYear.nutrientAnalyses.map((analysis) => [
          analysis.uniqueMaterialName,
          analysis.manureName,
          analysis.moisture,
          analysis.N,
          analysis.NH4N,
          analysis.P,
          analysis.K,
        ]),
      });
    }

    // ---------- SOIL TEST RESULTS ---------- //
    doc.addPage();
    // If any soil test is defined, all fields use the same ST method
    const soilTests = nmpFileYear.fields.map((f) => f.soilTest).filter((s) => s !== undefined);
    autoTable(doc, {
      ...sharedAutoTableSettings,
      // Page Header
      margin: { top: 40 },
      willDrawPage(data) {
        let [nextX, nextY] = drawStandardHeader(data, doc);
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

    autoTable(doc, {
      ...sharedAutoTableSettings,
      head: [
        [
          'Field',
          'Sampling Date',
          `${nmpFileYear.year} Crops`,
          'pH',
          'NO3-N (ppm)',
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
    doc.save('table.pdf');
  };

  const handlePreviousPage = () => {
    navigate(CALCULATE_NUTRIENTS);
  };

  return (
    <View title="Reporting">
      {/* only show if you have dairy cattle */}
      {unassignedManures.length > 0 && isDairyCattle && (
        <Grid
          container
          sx={{ marginTop: '1rem' }}
        >
          <div style={{ border: '1px solid #c81212', width: '100%' }}>
            The following materials are not stored:
            <ul>
              {unassignedManures.map((manure) => (
                <li key={`${manure.managedManureName}`}>
                  {manure.manureType} - {manure.managedManureName}
                </li>
              ))}
            </ul>
          </div>
        </Grid>
      )}

      <Grid
        container
        spacing={2}
        sx={{ marginTop: '1rem', marginBottom: '2rem' }}
      >
        <Grid
          size={{ xs: 4 }}
          sx={{
            justifyItems: 'center',
          }}
        >
          <SectionHeader>PDFs (Opens a new file)</SectionHeader>
          <div css={{ paddingBottom: '1rem' }}>
            <ButtonGroup
              alignment="center"
              ariaLabel="A group of buttons"
              orientation="vertical"
            >
              <Button onPress={() => makeFullReportPdf()}>
                <div style={{ width: '100%', textAlign: 'center' }}>Complete report</div>
              </Button>
              <Button onPress={() => {}}>Record keeping sheets</Button>
            </ButtonGroup>
          </div>
        </Grid>
        <Grid
          size={{ xs: 8 }}
          sx={{
            '.MuiGrid-root & div': { marginBottom: '1rem' },
            justifyItems: 'center',
          }}
        >
          <SectionHeader>NMP data file</SectionHeader>
          <div>To continue later, Download file to your computer</div>
          <div>Load a file on the Home page when you want to continue</div>
          <div>
            <Button onPress={() => downloadBlob()}>Download file</Button>
          </div>
        </Grid>
      </Grid>
      <ButtonGroup
        alignment="start"
        ariaLabel="A group of buttons"
        orientation="horizontal"
      >
        <Button
          size="medium"
          variant="secondary"
          onPress={handlePreviousPage}
        >
          Back
        </Button>
        {/* Go to BC soil nutrient testing site */}
        <Button
          size="medium"
          variant="primary"
          onPress={() => {
            navigate(
              'https://www2.gov.bc.ca/gov/content/industry/agriculture-seafood/agricultural-land-and-' +
                'environment/soil-nutrients/nutrient-management/what-to-apply/soil-nutrient-testing',
            );
          }}
        >
          Finished
        </Button>
      </ButtonGroup>
    </View>
  );
}
