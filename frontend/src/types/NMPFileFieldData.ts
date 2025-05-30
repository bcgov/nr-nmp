import { NMPFileCropData, SoilTestData } from './Crops';

export interface NMPFileFieldData {
  index?: number;
  FieldName: string;
  Area: string;
  PreviousYearManureApplicationFrequency: string;
  Comment: string;
  SoilTest: SoilTestData;
  Crops: NMPFileCropData[];
}

export const initialFieldFormData: NMPFileFieldData = {
  FieldName: '',
  Area: '',
  PreviousYearManureApplicationFrequency: '0',
  Comment: '',
  SoilTest: {},
  Crops: [],
};
