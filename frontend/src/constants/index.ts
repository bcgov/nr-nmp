import DEFAULT_NMPFILE_YEAR from './DefaultNMPFileYear';
import DefaultLiquidManureConversionFactors from './DefaultLiquidManureConversionFactors';
import DefaultManureFormData from './DefaultManureFormData';
import DEFAULT_NMPFILE from './DefaultNMPFile';
import DEFAULT_NMPFILE_CROPS from './DefaultNMPFileCropsData';
import DefaultSolidManureConversionFactors from './DefaultSolidManureConversionFactors';
import { EMPTY_CROP_NUTRIENTS, EMPTY_NUTRIENT_COLUMNS } from './CalculateNutrients';
import MANURE_APPLICATION_FREQ from './ManureApplication';
import { INITIAL_BEEF_FORM_DATA, INITIAL_DAIRY_FORM_DATA } from './Animals';
import NMP_FILE_KEY from './context';
import { HarvestUnit, HARVEST_UNIT_OPTIONS } from './harvestUnits';
import MANURE_TYPE_OPTIONS from './ManureTypeOptions';

// TODO: Standardize these variable names. Global constants should be in all caps
export {
  DEFAULT_NMPFILE_YEAR,
  NMP_FILE_KEY,
  DefaultLiquidManureConversionFactors,
  DefaultManureFormData,
  DEFAULT_NMPFILE,
  DEFAULT_NMPFILE_CROPS,
  DefaultSolidManureConversionFactors,
  EMPTY_CROP_NUTRIENTS,
  EMPTY_NUTRIENT_COLUMNS,
  INITIAL_BEEF_FORM_DATA,
  INITIAL_DAIRY_FORM_DATA,
  HarvestUnit,
  HARVEST_UNIT_OPTIONS,
  MANURE_APPLICATION_FREQ,
  MANURE_TYPE_OPTIONS,
};
