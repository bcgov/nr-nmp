import { NMPFileField } from '@/types';

const DEFAULT_NMPFILE_FIELD: NMPFileField = {
  fieldName: '',
  area: 1, // default to 1 acre to avoid a divide by 0 error
  previousYearManureApplicationId: 0,
  comment: '',
  soilTest: undefined,
  crops: [],
  fertilizers: [],
  fertigations: [],
  otherNutrients: [],
  manures: [],
  previousYearManureApplicationNCredit: null,
};

export default DEFAULT_NMPFILE_FIELD;
