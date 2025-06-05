import { NMPFileCropData, NMPFileSoilTestData } from './Crops';

export type NMPFileFieldData = {
  index?: number;
  FieldName: string;
  Area: number;
  PreviousYearManureApplicationFrequency: string;
  Comment: string;
  SoilTest: NMPFileSoilTestData;
  Crops: NMPFileCropData[];
  /*
  Fields from old NMP, currently unused, feel free to re-add
  Nutrients?: any | null;
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
