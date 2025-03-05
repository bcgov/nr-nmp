import CropData from './NMPFileCropData';
import SoilTestData from './SoilTestData';

interface NMPFileFieldData {
  FieldName: string;
  Area: string;
  PreviousYearManureApplicationFrequency: string;
  Comment: string;
  SoilTest: SoilTestData;
  Crops: CropData[];
}

export default NMPFileFieldData;
