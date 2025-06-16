import { NMPFileNutrientRow } from './calculateNutrients';
import { NMPFileCropData, NMPFileSoilTestData } from './crops';

export type NMPFileFieldData = {
  index: number;
  FieldName: string;
  Area: number;
  PreviousYearManureApplicationFrequency: string;
  Comment: string;
  SoilTest?: NMPFileSoilTestData;
  Crops: NMPFileCropData[];
  Nutrients?: NMPFileNutrientRow[]; // concept: these rows will 'link' to the other arrays
  /*
  Fields from old NMP, currently unused, feel free to re-add
  FeedForageAnalyses?: any[];
  LeafTest?: any | null;
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
