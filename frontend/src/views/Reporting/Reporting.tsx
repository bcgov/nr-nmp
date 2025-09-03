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
import { DAIRY_COW_ID, FertilizerUnit, ManureType } from '@/types';
import { APICacheContext } from '@/context/APICacheContext';
import SEASON_APPLICATION from '../CalculateNutrients/unseededData';

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

  const unassignedManures = useMemo(
    () =>
      [
        ...(state.nmpFile.years[0].GeneratedManures || []),
        ...(state.nmpFile.years[0].ImportedManures || []),
      ].filter((m) => !m.AssignedToStoredSystem),
    [state.nmpFile.years],
  );

  const isDairyCattle = useMemo(() => {
    const animalList = state.nmpFile?.years[0].FarmAnimals || [];
    return animalList.some((animal) => animal.animalId === DAIRY_COW_ID);
  }, [state.nmpFile?.years]);

  // Fetch all of the data tables needed to generate the report
  useEffect(() => {
    apiCache.callEndpoint('api/fertilizerunits/').then((response: { status?: any; data: any }) => {
      if (response.status === 200) {
        setFertilizerUnits(response.data);
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
    const farmName = state.nmpFile?.farmDetails?.FarmName;

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
    nextY = addText(doc, `Farm Name: ${state.nmpFile.farmDetails.FarmName}`, x, nextY);
    nextY = addText(doc, `Planning Year: ${state.nmpFile.farmDetails.Year}`, x, nextY);
    return [x, nextY];
  };

  const makeFullReportPdf = async () => {
    // eslint-disable-next-line new-cap
    const doc = new jsPDF();

    // TODO: Add Table of Contents as the first page

    // ---------- APPLICATION SCHEDULE ---------- //
    for (let i = 0; i < state.nmpFile.years[0].Fields!.length; i += 1) {
      const field = state.nmpFile.years[0].Fields![i];
      // QUESTION: Should fertigation go in this table?
      const allApplied = [...field.Manures, ...field.Fertilizers];
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
              content: `Field: ${field.FieldName}`,
              colSpan: 3,
              styles: { fontStyle: 'normal', fillColor: [255, 255, 255] },
            },
          ],
          ['Nutrient Source', 'Application Timing', 'Rate'], // these are the actual columns
        ],
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
      doc.addPage();
    }

    // ---------- MANURE/COMPOST INVENTORY ---------- //
    const storageSystems = state.nmpFile.years[0].ManureStorageSystems || [];
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
                    `\t${m.data.UniqueMaterialName}`,
                    `${m.data.AnnualAmount} ${m.data.manureType === ManureType.Liquid ? 'US Gallons' : 'tons'}`,
                  ]);
                  // TODO: Add Milking Centre Wash Water
                });
                if (system.annualPrecipitation) {
                  newRows.push([
                    'Precipitation',
                    `${system.annualPrecipitation} ${system.manureType === ManureType.Liquid ? 'US Gallons' : 'tons'}`,
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
                  `\t${manure.UniqueMaterialName}`,
                  `${manure.AnnualAmount} ${manure.manureType === ManureType.Liquid ? 'US Gallons' : 'tons'}`,
                ]);
                return acc.concat(newRows);
              }, [] as RowInput[]),
            ],
    });
    doc.addPage();

    const field = state.nmpFile.years[0].Fields![0];
    // Field Summary
    autoTable(doc, {
      head: [['Crop', 'Yield', 'Previous crop ploughed down (N credit)']],
      body: field.Crops.map((crop) => [
        `${crop.name}`,
        `${crop.yield} ${crop.yieldHarvestUnit ? crop.yieldHarvestUnit : 'ton/ac'}`,
        `${crop.nCredit === 0 ? 'none (no N credit)' : crop.nCredit}`,
      ]),
      theme: 'grid',
      styles: { lineColor: 'black', lineWidth: 0.5, textColor: 'black' },
      headStyles: { fillColor: [164, 205, 215], lineWidth: 0.5 },

      // Header
      willDrawPage(data) {
        doc.setFontSize(14);
        // NOTE: Start is 15
        const start = Math.ceil(data.settings.margin.left);
        let nextY = Math.ceil(data.settings.margin.left);
        nextY = addText(doc, `Farm Name: ${state.nmpFile.farmDetails.FarmName}`, start, nextY);
        nextY = addText(doc, `Planning Year: ${state.nmpFile.farmDetails.Year}`, start, nextY);
        const fieldSummaryY = nextY + 2;
        nextY = addText(doc, 'Field Summary:', start, fieldSummaryY);
        doc.setFont(doc.getFont().fontName, 'bold');
        doc.text(`${field.FieldName}`, start + 40, fieldSummaryY);
        doc.setFontSize(10);
        addText(doc, `Area: ${field.Area} ac`, start + 2, nextY + 4);
        doc.setFont(doc.getFont().fontName, 'normal');
      },
      margin: { top: 50 },
    });
    const soilTest = state.nmpFile.years[0].Fields![0].SoilTest;
    let splitDateStr: string[] | undefined;
    if (soilTest?.sampleDate) {
      splitDateStr = new Date(soilTest.sampleDate).toDateString().split(' ');
    }

    // Uncomment to show on separate pages
    // doc.addPage();

    autoTable(doc, {
      head: [
        [
          {
            content: `Soil Test Results: ${splitDateStr ? `${splitDateStr[1]} ${splitDateStr[3]}` : ''}`,
            styles: { lineWidth: { top: 0.5, left: 0.5, bottom: 0.5, right: 0 } },
            colSpan: 1,
          },
          {
            content: `Soil test P & K Method: ${soilTest?.soilTestId || ''}`,
            styles: { lineWidth: { top: 0.5, left: 0, bottom: 0.5, right: 0.5 } },
            colSpan: 3,
          },
        ],
      ],
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
            content: `Field Comments: ${state.nmpFile.years[0].Fields![0].Comment || ''}`,
            styles: { fillColor: [255, 255, 255] },
            colSpan: 4,
          },
        ],
      ],
      theme: 'grid',
      styles: { lineColor: 'black', lineWidth: 0.5, textColor: 'black' },
      headStyles: { fillColor: [164, 205, 215] },
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
                <li key={`${manure.ManagedManureName}`}>
                  {manure.manureType} - {manure.ManagedManureName}
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
