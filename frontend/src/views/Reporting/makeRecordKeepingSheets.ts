/* eslint-disable prefer-const */
import { jsPDF } from 'jspdf';
import { autoTable, HookData } from 'jspdf-autotable';
import { FertilizerUnit, NMPFile, Units } from '@/types';
import SEASON_APPLICATION from '../CalculateNutrients/unseededData';
import { addText } from './utils';

const drawStandardHeader = (
  data: HookData,
  doc: jsPDF,
  farmName: string,
  year: string,
) => {
  doc.setFontSize(14);
  const x = Math.ceil(data.settings.margin.left);
  let nextY = Math.ceil(data.settings.margin.left);
  nextY = addText(doc, `Farm Name: ${farmName}`, x, nextY);
  nextY = addText(doc, `Planning Year: ${year}`, x, nextY);
  return [x, nextY];
};

export default async function makeRecordKeepingSheetsPdf(
  nmpFile: NMPFile,
  fertilizerUnits: FertilizerUnit[],
  manureUnits: Units[],
) {
  // eslint-disable-next-line new-cap
  const doc = new jsPDF();
  doc.setFont('BCSans');
  const pageWidth: number = doc.internal.pageSize.getWidth() - 30;
  const { farmName, year } = nmpFile.farmDetails;

  const nmpFileYear = nmpFile.years[0];

  for (let i = 0; i < nmpFileYear.fields.length; i += 1) {
    const field = nmpFileYear.fields[i];
    const allApplied = [...field.manures, ...field.fertilizers];
    autoTable(doc, {
      theme: 'grid',
      styles: {
        lineColor: 'black',
        lineWidth: 0.5,
        textColor: 'black',
        font: 'BCSans',
      },
      headStyles: { fillColor: [164, 205, 215], lineWidth: 0.5 },
      // Page Header
      margin: { top: i === 0 ? 40 : undefined },
      willDrawPage(data) {
        const [nextX, nextY] = drawStandardHeader(data, doc, farmName, year);
        doc.setFont(doc.getFont().fontName, 'bold');
        addText(doc, 'Record Keeping Sheets', nextX, nextY + 2);
        doc.setFont(doc.getFont().fontName, 'normal');
      },
      // Table
      head: [
        [
          {
            content: `Field: ${field.fieldName}`,
            colSpan: 1,
            styles: {
              fontStyle: 'normal',
              fillColor: [255, 255, 255],
              lineWidth: { top: 0.5, left: 0.5, bottom: 0.5, right: 0 },
            },
          },
          {
            content: `Area: ${field.area} ac`,
            colSpan: 1,
            styles: {
              fontStyle: 'normal',
              fillColor: [255, 255, 255],
              lineWidth: { top: 0.5, left: 0, bottom: 0.5, right: 0 },
            },
          },
          {
            content: `Crops: ${field.crops.map((c) => `${c.name}`).join('\n             ')}`, // newline + spaces
            colSpan: 2,
            styles: {
              fontStyle: 'normal',
              fillColor: [255, 255, 255],
              lineWidth: { top: 0.5, left: 0, bottom: 0.5, right: 0 },
            },
          },
          {
            // this value is blank on purpose as the farmer will print and complete
            content: 'Actual Yield:', // newline + spaces
            colSpan: 1,
            styles: {
              fontStyle: 'normal',
              fillColor: [255, 255, 255],
              lineWidth: { top: 0.5, left: 0, bottom: 0.5, right: 0.5 },
            },
          },
        ], // field headings
        [
          {
            content: `${nmpFileYear.year} Plan`,
            colSpan: 3,
            styles: { halign: 'center', fontStyle: 'bold' },
          },
          {
            content: `${nmpFileYear.year} Records`,
            colSpan: 2,
            styles: { halign: 'center', fontStyle: 'bold' },
          },
        ], // year headings
        [
          {
            content: 'Application',
            colSpan: 1,
            styles: { halign: 'center', fontStyle: 'bold' },
          },
          {
            content: 'Timing',
            colSpan: 1,
            styles: { halign: 'center', fontStyle: 'bold' },
          },
          {
            content: 'Rate',
            colSpan: 1,
            styles: { halign: 'center', fontStyle: 'bold' },
          },
          {
            // this is blank on purpose as the farmer will print and complete
            content: 'Notes or modifications to plan',
            colSpan: 2,
            styles: { halign: 'center', fontStyle: 'bold' },
          },
        ], // column names
      ],
      columnStyles: {
        0: { cellWidth: pageWidth * 0.2 },
        1: { cellWidth: pageWidth * 0.2 },
        2: { cellWidth: pageWidth * 0.2 },
        // make last 2 columns appear as 1 wide column
        3: {
          cellWidth: pageWidth * 0.2,
          lineWidth: { top: 0.5, left: 0.5, bottom: 0.5, right: 0 },
        },
        4: {
          cellWidth: pageWidth * 0.2,
          lineWidth: { top: 0.5, left: 0, bottom: 0.5, right: 0.5 },
        },
      },
      body:
        allApplied.length > 0
          ? allApplied.map((nutrientSource) => {
            if ('applicationId' in nutrientSource) {
            // Manures have 'applicationId' and seasonal values
              const seasonApplication = SEASON_APPLICATION.find(
                (s) => s.Id === nutrientSource.applicationId,
              );
              if (!seasonApplication) {
                throw new Error(
                  `Season application ${nutrientSource.applicationId} not found`,
                );
              }
              return [
                // manure nutrient name, amount, season, application, unit
                nutrientSource.name,
                seasonApplication.Season,
                // Example display: 10 L/ac
                `${nutrientSource.applicationRate} ${manureUnits.find((u) => u.id === nutrientSource.applUnitId)!.name}`,
              ];
            }
            // Fertilizers have different properties
            return [
              // fertilizer nutrient type, name, amount, season, application, unit
              // if custom fertilizer display Custom - type - N-P-K, else display name
              nutrientSource.customFertilizer ? `Custom (${nutrientSource.customFertilizer.dryliquid}) ${nutrientSource.customFertilizer.nitrogen}-${nutrientSource.customFertilizer.phosphorous}-${nutrientSource.customFertilizer.potassium}` : `${nutrientSource.name}`,
              nutrientSource.applDate || '',
              // Example display: 10 L/ac
              `${nutrientSource.applicationRate} ${fertilizerUnits.find((u) => u.id === nutrientSource.applUnitId)!.name}`,
            ];
          })
          : [['None planned', '', '']],
    });
  }

  // Download document
  const prependDate = new Date().toLocaleDateString('sv-SE', {
    dateStyle: 'short',
  });
  doc.save(`${prependDate}-${farmName}-Record-Keeping-Sheets.pdf`);
  return doc;
}
