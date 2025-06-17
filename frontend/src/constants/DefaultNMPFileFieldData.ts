import { NMPFileFieldData } from '@/types';

const initialFieldFormData: Omit<NMPFileFieldData, 'index'> = {
  FieldName: '',
  Area: 0,
  PreviousYearManureApplicationFrequency: '0',
  Comment: '',
  SoilTest: undefined,
  Crops: [],
};

export default initialFieldFormData;
