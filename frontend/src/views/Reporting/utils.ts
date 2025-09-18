import { jsPDF } from 'jspdf';

export function getFertilizerUnitKgPerAcreConversion(unitId: number) {
  switch (unitId) {
    // Pounds per acre
    case 1:
      return 0.4536;
    // Kilograms per hectare
    case 2:
      return 0.4047;
    // Pounds per 1000 sq ft
    case 7:
      return 19.759;
    default:
      console.error(`Unrecognized dry fertilizer unit: ${unitId}`);
      return 0;
  }
}

/**
 * @param unit A liquid fertilizer unit id
 * @returns The conversion factor to convert that unit to US gallons per acre
 */
export function getFertilizerUnitUSGallonPerAcreConversion(unitId: number) {
  switch (unitId) {
    // Litres per acre
    case 3:
      return 0.2642;
    // Imperial gallons per acre
    case 4:
      return 1.201;
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

// https://stackoverflow.com/questions/65942761/jspdf-add-text-after-another-dynamic-text
/**
 * Adds text to a page at the given position and returns a position just below the text
 * @param doc The jsPDF
 * @param text The text to insert
 * @param x The x-axis position of the text
 * @param nextY The y-axis position of the text
 * @returns The y-axis value below the added text
 */
export function addText(doc: jsPDF, text: string, x: number, nextY: number) {
  doc.text(text, x, nextY, { maxWidth: 180 });
  return Math.ceil(doc.getTextDimensions(doc.splitTextToSize(text, 180)).h) + 2 + nextY;
}

const superscriptNumberDict: { [num: string]: string } = {
  0: '⁰',
  1: '¹',
  2: '²',
  3: '³',
  4: '⁴',
  5: '⁵',
  6: '⁶',
  7: '⁷',
  8: '⁸',
  9: '⁹',
};
export function numberToSuperscript(num: number): string {
  const str = String(num);
  return str
    .split('')
    .map((c) => superscriptNumberDict[c])
    .join();
}
