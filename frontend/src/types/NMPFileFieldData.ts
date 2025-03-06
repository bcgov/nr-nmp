import { NMPFileCropData, SoilTestData } from './Crops';

interface NMPFileFieldData {
  FieldName: string;
  Area: string;
  PreviousYearManureApplicationFrequency: string;
  Comment: string;
  SoilTest: SoilTestData;
  Crops: NMPFileCropData[];
}

export default NMPFileFieldData;
