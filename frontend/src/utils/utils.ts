import defaultNMPFileYear from '@/constants/DefaultNMPFileYear';
import defaultNMPFile from '@/constants/DefaultNMPFile';
import NMPFile from '@/types/NMPFile';
import { NMPFileFarmManureData } from '@/types/NMPFileFarmManureData';
import NMPFileFieldData from '@/types/NMPFileFieldData';

export const initFields = (state: any) => {
  if (state.nmpFile) {
    const parsedData = JSON.parse(state.nmpFile);
    return parsedData.years[0].Fields;
  }
  return [];
};

export const saveFieldsToFile = (
  fields: NMPFileFieldData[],
  prevNMPFile: string,
  setNMPFile: (nmpFile: string | ArrayBuffer) => Promise<void>,
) => {
  let nmpFile: NMPFile;
  if (prevNMPFile) nmpFile = JSON.parse(prevNMPFile);
  else {
    nmpFile = { ...defaultNMPFile };
    nmpFile.years.push({ ...defaultNMPFileYear });
  }
  if (nmpFile.years.length > 0) {
    nmpFile.years[0].Fields = fields.map((field) => ({
      FieldName: field.FieldName,
      Area: parseFloat(field.Area),
      PreviousYearManureApplicationFrequency: field.PreviousYearManureApplicationFrequency,
      Comment: field.Comment,
      SoilTest: field.SoilTest,
      Crops: field.Crops,
    }));
  }
  setNMPFile(JSON.stringify(nmpFile));
};

export const saveFarmManuresToFile = (
  manures: NMPFileFarmManureData[],
  prevNMPFile: string,
  setNMPFile: (nmpFile: string | ArrayBuffer) => Promise<void>,
) => {
  let nmpFile: NMPFile | null = null;
  if (prevNMPFile) nmpFile = JSON.parse(prevNMPFile);
  if (nmpFile && nmpFile.years && nmpFile.years.length > 0 && manures.length > 0) {
    nmpFile.years[0].FarmManures = manures.map((manure) => ({
      ...manure,
    }));
  }
  setNMPFile(JSON.stringify(nmpFile));
};

export const booleanChecker = (value: any): boolean => {
  if (!value) {
    // value was empty string, false, 0, null, undefined
    return false;
  }
  if (typeof value === 'string' && value.toLowerCase() === 'false') {
    return false;
  }

  return true;
};

// Used in AddAnimals.tsx and ManureAndImports.tsx
export const liquidSolidManureDisplay = (manureObj: { [key: string]: number | string }) => {
  const solid = manureObj?.annualSolidManure ?? 0;
  const liquid = manureObj?.annualLiquidManure ?? 0;
  // for displaying solid and or liquid
  if (solid && liquid) {
    return `${solid} tons/ ${liquid} gal`;
  }
  if (solid) {
    return `${solid} tons`;
  }
  if (liquid) {
    return `${liquid} gal`;
  }
  return '0';
};
