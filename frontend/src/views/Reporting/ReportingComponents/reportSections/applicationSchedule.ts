import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { FertilizerUnit, NMPFileYear } from '@/types';
import { drawStandardHeader, addText } from '../reportingUtils';
import { sharedAutoTableSettings } from '../reportingConstants';
import SEASON_APPLICATION from '../../../CalculateNutrients/unseededData';

const generateApplicationSchedule = (
  doc: jsPDF,
  nmpFileYear: NMPFileYear,
  fertilizerUnits: FertilizerUnit[],
  farmName: string,
  year: number,
  pageWidth: number,
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
                ? SEASON_APPLICATION.find((s: any) => s.Id === nutrientSource.applicationId)!.Season
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

export default generateApplicationSchedule;
