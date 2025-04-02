import blankNMPFileYearData from '@/constants/BlankNMPFileYearData';
import defaultNMPFile from '@/constants/DefaultNMPFile';
import NMPFile from '@/types/NMPFile';
import NMPFileFieldData from '@/types/NMPFileFieldData';
import NMPFileImportedManureData from '@/types/NMPFileImportedManureData';

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
    nmpFile.years.push({ ...blankNMPFileYearData });
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

export const initManures = (state: any) => {
  if (state.nmpFile) {
    const parsedData = JSON.parse(state.nmpFile);
    return parsedData.years[0].ImportedManures;
  }
  return [];
};

export const saveManuresToFile = (
  manures: NMPFileImportedManureData[],
  prevNMPFile: string,
  setNMPFile: (nmpFile: string | ArrayBuffer) => Promise<void>,
) => {
  let nmpFile: NMPFile | null = null;
  if (prevNMPFile) nmpFile = JSON.parse(prevNMPFile);
  if (nmpFile && nmpFile.years && nmpFile.years.length > 0 && manures.length > 0) {
    nmpFile.years[0].ImportedManures = manures.map((manure) => ({
      ...manure,
    }));
  }
  setNMPFile(JSON.stringify(nmpFile));
};
