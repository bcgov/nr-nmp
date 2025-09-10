import {
  CalculateNutrientsColumn,
  NMPFileAppliedManure,
  NMPFileFertigation,
  NMPFileFertilizer,
} from './CalculateNutrients';
import { NMPFileCropData, NMPFileSoilTestData } from './Crops';

export type NMPFileOtherNutrient = CalculateNutrientsColumn;

export type NMPFileFieldData = {
  FieldName: string;
  Area: number;
  PreviousYearManureApplicationFrequency: number;
  Comment: string;
  SoilTest?: NMPFileSoilTestData;
  Crops: NMPFileCropData[];
  Fertilizers: NMPFileFertilizer[];
  Fertigations: NMPFileFertigation[];
  Manures: NMPFileAppliedManure[];
  OtherNutrients: NMPFileOtherNutrient[];
  PreviousYearManureApplicationNitrogenCredit?: number | null;

  /*
  Fields from old NMP, currently unused, feel free to re-add
  FeedForageAnalyses?: any[];
  SoilTestNitrateOverrideNitrogenCredit?: any | null;
  IsSeasonalFeedingArea?: boolean;
  SeasonalFeedingArea?: any | null;
  FeedingDaysSpentInFeedingArea?: any | null;
  FeedingPercentageOutsideFeeingArea?: any | null;
  MatureAnimalCount?: any | null;
  GrowingAnimalCount?: any | null;
  MatureAnimalAverageWeight?: any | null;
  GrowingAnimalAverageWeight?: any | null;
  MatureAnimalDailyFeedRequirementId?: number;
  GrowingAnimalDailyFeedRequirementId?: number;
  */
};
