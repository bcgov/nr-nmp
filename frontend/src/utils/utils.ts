import defaultNMPFileYear from '@/constants/DefaultNMPFileYear';
import defaultNMPFile from '@/constants/DefaultNMPFile';
import NMPFile from '@/types/NMPFile';
import { NMPFileFarmManureData } from '@/types/NMPFileFarmManureData';
import NMPFileFieldData from '@/types/NMPFileFieldData';
import { AnimalData } from '@/views/AddAnimals/types';

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
