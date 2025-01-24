import CropData from './CropData';

interface Field {
  FieldName: string;
  Area: string;
  PreviousYearManureApplicationFrequency: string;
  Comment: string;
  SoilTest: object;
  Crops: CropData[];
}

export default Field;
