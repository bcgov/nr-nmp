import { NMPFileFieldData } from '@/types';

const initialFieldFormData: NMPFileFieldData = {
  FieldName: '',
  Area: 0,
  PreviousYearManureApplicationFrequency: '0',
  Comment: '',
  SoilTest: undefined,
  Crops: [],
  Fertilizers: [],
  OtherNutrients: [],
  Nutrients: {
    nutrientManures: [],
  },
};

export default initialFieldFormData;
