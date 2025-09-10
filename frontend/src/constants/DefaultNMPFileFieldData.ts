import { NMPFileFieldData } from '@/types';

const initialFieldFormData: NMPFileFieldData = {
  FieldName: '',
  Area: 1, // default to 1 acre to avoid a divide by 0 error
  PreviousYearManureApplicationFrequency: 0,
  Comment: '',
  SoilTest: undefined,
  Crops: [],
  Fertilizers: [],
  Fertigations: [],
  OtherNutrients: [],
  Manures: [],
};

export default initialFieldFormData;
