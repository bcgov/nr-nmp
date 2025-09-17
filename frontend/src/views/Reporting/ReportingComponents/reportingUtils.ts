import { jsPDF } from 'jspdf';
import { HookData } from 'jspdf-autotable';
import { FertilizerUnit, NMPFileYear } from '@/types';
import { FertilizerRequiredStep, superscriptNumberDict } from './reportingConstants';

// PDF helper functions
// https://stackoverflow.com/questions/65942761/jspdf-add-text-after-another-dynamic-text
export function addText(doc: jsPDF, text: string, start: number, nextY: number): number {
  doc.text(text, start, nextY, { maxWidth: 180 });
  return Math.ceil(doc.getTextDimensions(doc.splitTextToSize(text, 180)).h) + 2 + nextY;
}

export function numberToSuperscript(num: number): string {
  const str = String(num);
  return str
    .split('')
    .map((c) => superscriptNumberDict[c])
    .join();
}

export function sumPropertyInObjectArr(arr: any[], prop: string): number {
  return (
    Math.round(
      arr.reduce((sum, obj) => {
        if (!(prop in obj)) {
          throw new Error(`Property ${prop} not in object: ${JSON.stringify(obj)}`);
        }
        return sum + obj[prop];
      }, 0) * 10,
    ) / 10
  );
}

// Fertilizer unit conversion functions
export function getFertilizerUnitKgPerAcreConversion(unitId: number) {
  switch (unitId) {
    // Pounds per acre
    case 1:
      return 0.4536;
    case 2:
      return 0.4047;
    case 7:
      return 19.759;
    default:
      console.error(`Unrecognized dry fertilizer unit: ${unitId}`);
      return 0;
  }
}

/**
 * @param unitId A liquid fertilizer unit id
 * @returns The conversion factor to convert that unit to US gallons per acre
 */
export function getFertilizerUnitUSGallonPerAcreConversion(unitId: number) {
  switch (unitId) {
    // Litres per acre
    case 3:
      return 3.875;
    // Imperial gallons per acre
    case 4:
      return 0.8326;
    case 5:
      return 1;
    // Litres per hectare
    case 6:
      return 0.1069;
    default:
      console.error(`Unrecognized liquid fertilizer unit: ${unitId}`);
      return 0;
  }
}

// Each page of the full report will start with this
export const drawStandardHeader = (
  data: HookData,
  doc: jsPDF,
  farmName: string,
  year: number,
): [number, number] => {
  doc.setFontSize(14);
  const x = Math.ceil(data.settings.margin.left);
  let nextY = Math.ceil(data.settings.margin.left);
  nextY = addText(doc, `Farm Name: ${farmName}`, x, nextY);
  nextY = addText(doc, `Planning Year: ${year}`, x, nextY);
  return [x, nextY];
};

// Group fertilizers across each field by name and sum the amounts
export const aggregateFertilizers = (
  nmpFileYear: NMPFileYear,
  fertilizerUnits: FertilizerUnit[],
): FertilizerRequiredStep[] =>
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

export const downloadNMPFile = (nmpFile: any) => {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(nmpFile)], { type: 'application/json' }),
  );
  const a = document.createElement('a');
  a.href = url;

  const prependDate = new Date().toLocaleDateString('sv-SE', { dateStyle: 'short' });
  const farmName = nmpFile?.farmDetails?.farmName;

  a.download = `${prependDate}-${farmName}.nmp`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
