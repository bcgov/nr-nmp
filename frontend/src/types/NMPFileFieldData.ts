import CropData from './NMPFileCropData';

interface NMPFileFieldData {
  FieldName: string;
  Area: string;
  PreviousYearManureApplicationFrequency: string;
  Comment: string;
  SoilTest: object;
  Crops: CropData[];
}

export default NMPFileFieldData;
