import {
  CalculateNutrientsColumn,
  NMPFileFertigation,
  NMPFileFertilizer,
  NMPNutrients,
} from './calculateNutrients';
import { NMPFileCropData, NMPFileSoilTestData } from './Crops';

export type NMPFileOtherNutrient = CalculateNutrientsColumn;

export type NMPFileFieldData = {
  FieldName: string;
  Area: number;
  PreviousYearManureApplicationFrequency: string;
  Comment: string;
  SoilTest?: NMPFileSoilTestData;
  Crops: NMPFileCropData[];
  Fertilizers: NMPFileFertilizer[];
  Fertigations: NMPFileFertigation[];
  Nutrients: NMPNutrients;
  OtherNutrients: NMPFileOtherNutrient[];
  /*
  Fields from old NMP, currently unused, feel free to re-add
  FeedForageAnalyses?: any[];
  PreviousYearManureApplicationNitrogenCredit?: any | null;
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
