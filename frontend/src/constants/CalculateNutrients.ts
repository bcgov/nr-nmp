import {
  CropNutrients,
  Fertilizer,
  DryFertilizerSolubility,
  Schedule,
  InjectionUnit,
  SelectOption,
} from '@/types';

export const DRY_CUSTOM_ID = 2;
export const LIQUID_CUSTOM_ID = 4;

export const EMPTY_CROP_NUTRIENTS: CropNutrients = {
  N: 0,
  P2O5: 0,
  K2O: 0,
};

export const EMPTY_CUSTOM_FERTILIZER: Fertilizer = {
  id: 0,
  name: 'Custom fertilizer',
  dryliquid: 'dry',
  fertigation: false,
  nitrogen: 0,
  phosphorous: 0,
  potassium: 0,
  sortnum: 0,
};

// Taken from https://github.com/bcgov/agri-nmp/blob/ce60d005a1990fe441ee347a9bfac700dd092bd3/app/Agri.Data/SeedData/FertigationData.json#L232
// Could get converted into a table, but, given that this seems to just be conversion factors, I wouldn't do it unless we're asked
export const DRY_FERTILIZER_SOLUBILITIES: DryFertilizerSolubility[] = [
  {
    id: 1,
    fertilizerId: 1,
    solubilityUnitId: 1,
    value: 1080,
  },
  {
    id: 2,
    fertilizerId: 1,
    solubilityUnitId: 2,
    value: 1.08,
  },
  {
    id: 3,
    fertilizerId: 1,
    solubilityUnitId: 3,
    value: 9.01,
  },
  {
    id: 4,
    fertilizerId: 6,
    solubilityUnitId: 1,
    value: 1900,
  },
  {
    id: 5,
    fertilizerId: 6,
    solubilityUnitId: 2,
    value: 1.9,
  },
  {
    id: 6,
    fertilizerId: 6,
    solubilityUnitId: 3,
    value: 19.02,
  },
  {
    id: 7,
    fertilizerId: 7,
    solubilityUnitId: 1,
    value: 764,
  },
  {
    id: 8,
    fertilizerId: 7,
    solubilityUnitId: 2,
    value: 0.764,
  },
  {
    id: 9,
    fertilizerId: 7,
    solubilityUnitId: 3,
    value: 6.38,
  },
  {
    id: 10,
    fertilizerId: 29,
    solubilityUnitId: 1,
    value: 1444,
  },
  {
    id: 11,
    fertilizerId: 29,
    solubilityUnitId: 2,
    value: 1.444,
  },
  {
    id: 12,
    fertilizerId: 29,
    solubilityUnitId: 3,
    value: 12.03,
  },
];

// Taken from https://github.com/bcgov/agri-nmp/blob/ce60d005a1990fe441ee347a9bfac700dd092bd3/app/Agri.Data/SeedData/FertigationData.json
export const INJECTION_RATE_UNITS: InjectionUnit[] = [
  { id: 1, name: 'US gallon/min', conversionToImpGallonsPerMinute: 0.836 },
  { id: 2, name: 'L/min', conversionToImpGallonsPerMinute: 0.22 },
  { id: 3, name: 'Imp. gallon/min', conversionToImpGallonsPerMinute: 1 },
];

export const INJECTION_UNIT_OPTIONS: SelectOption<InjectionUnit>[] = INJECTION_RATE_UNITS.map(
  (value) => ({ id: value.id, label: value.name, value }),
);

export const SOLUBILITY_RATE_UNITS: { id: number; label: string }[] = [
  { id: 1, label: 'g/L' },
  { id: 2, label: 'kg/L' },
  { id: 3, label: 'lb/imp. gallon' },
];

export const AMOUNT_TO_DISSOLVE_UNITS: { id: number; label: string }[] = [
  { id: 1, label: 'lbs' },
  { id: 2, label: 'kgs' },
  { id: 3, label: 'grams' },
];

export const TANK_VOLUME_UNITS: { id: number; label: string }[] = [
  { id: 1, label: 'Imperial Gallons' },
  { id: 2, label: 'US Gallons' },
  { id: 3, label: 'Litres' },
];

export const SCHEDULE_OPTIONS = [
  { id: Schedule.Monthly, label: Schedule[Schedule.Monthly] },
  { id: Schedule.Biweekly, label: Schedule[Schedule.Biweekly] },
  { id: Schedule.Weekly, label: Schedule[Schedule.Weekly] },
  { id: Schedule.Daily, label: Schedule[Schedule.Daily] },
];
