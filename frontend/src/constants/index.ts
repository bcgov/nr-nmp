import DEFAULT_NMPFILE_YEAR from './DefaultNMPFileYear';
import DefaultLiquidManureConversionFactors from './DefaultLiquidManureConversionFactors';
import DefaultManureFormData from './DefaultManureFormData';
import DEFAULT_NMPFILE from './DefaultNMPFile';
import DEFAULT_NMPFILE_CROPS from './DefaultNMPFileCropsData';
import DefaultSolidManureConversionFactors from './DefaultSolidManureConversionFactors';
import {
  DRY_CUSTOM_ID,
  LIQUID_CUSTOM_ID,
  EMPTY_CROP_NUTRIENTS,
  EMPTY_CUSTOM_FERTILIZER,
  INJECTION_RATE_UNITS,
  INJECTION_UNIT_OPTIONS,
  SCHEDULE_OPTIONS,
} from './CalculateNutrients';
import MANURE_APPLICATION_FREQ from './ManureApplication';
import { INITIAL_BEEF_FORM_DATA, INITIAL_DAIRY_FORM_DATA } from './Animals';
import APP_STATE_KEY from './context';
import { HarvestUnit, HARVEST_UNIT_OPTIONS } from './harvestUnits';
import MANURE_TYPE_OPTIONS from './ManureTypeOptions';
import PrecipitationConversionFactor from './PrecipitationConversionFactor';
import PLANT_AGES from './PlantsAges';
import DEFAULT_BERRY_DATA from './DefaultBerryData';
import {
  DEFAULT_CIRCULAR_STORAGE,
  DEFAULT_LIQUID_MANURE_STORAGE,
  DEFAULT_LIQUID_MANURE_SYSTEM,
  DEFAULT_RECTANGULAR_STORAGE,
  DEFAULT_SLOPED_WALL_STORAGE,
  DEFAULT_SOLID_MANURE_STORAGE,
  DEFAULT_SOLID_MANURE_SYSTEM,
} from './storage';

// TODO: Standardize these variable names. Global constants should be in all caps
export {
  DEFAULT_NMPFILE_YEAR,
  APP_STATE_KEY,
  DefaultLiquidManureConversionFactors,
  DefaultManureFormData,
  DEFAULT_NMPFILE,
  DEFAULT_NMPFILE_CROPS,
  DefaultSolidManureConversionFactors,
  DRY_CUSTOM_ID,
  LIQUID_CUSTOM_ID,
  EMPTY_CROP_NUTRIENTS,
  EMPTY_CUSTOM_FERTILIZER,
  INJECTION_RATE_UNITS,
  INJECTION_UNIT_OPTIONS,
  SCHEDULE_OPTIONS,
  INITIAL_BEEF_FORM_DATA,
  INITIAL_DAIRY_FORM_DATA,
  HarvestUnit,
  HARVEST_UNIT_OPTIONS,
  MANURE_APPLICATION_FREQ,
  MANURE_TYPE_OPTIONS,
  PrecipitationConversionFactor,
  DEFAULT_LIQUID_MANURE_STORAGE,
  DEFAULT_SOLID_MANURE_STORAGE,
  DEFAULT_RECTANGULAR_STORAGE,
  DEFAULT_CIRCULAR_STORAGE,
  DEFAULT_SLOPED_WALL_STORAGE,
  DEFAULT_LIQUID_MANURE_SYSTEM,
  DEFAULT_SOLID_MANURE_SYSTEM,
  PLANT_AGES,
  DEFAULT_BERRY_DATA,
};
