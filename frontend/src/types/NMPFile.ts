/**
 * @summary Type definition for NMP File
 */

type NMPFile = {
  farmDetails?: {
    Year?: string;
    FarmName?: string;
    FarmRegion?: number;
    FarmSubRegion?: number | null;
    SoilTests?: any | null;
    TestingMethod?: any | null;
    Manure?: any | null;
    HasSelectedFarmType?: boolean;
    ImportsManureCompost?: boolean;
    HasAnimals?: boolean;
    HasDairyCows?: boolean;
    HasBeefCows?: boolean;
    HasPoultry?: boolean;
    HasMixedLiveStock?: boolean;
    HasHorticulturalCrops?: boolean;
    HasBerries?: boolean;
    HasVegetables?: boolean;
    LeafTests?: any | null;
    LeafTestingMethod?: any | null;
    UserJourney?: number;
  };
  unsaved?: boolean;
  years?: Array<{
    Year?: string;
    Fields?: Array<{
      Id?: number;
      FieldName?: string;
      Area?: number;
      Comment?: string | null;
      Nutrients?: any | null;
      HasNutrients?: boolean;
      Crops?: Array<{
        id?: number;
        cropId?: string;
        cropTypeId?: number;
        cropName?: string;
        cropTypeName?: string;
        cropOther?: string | null;
        yield?: number;
        reqN?: number;
        stdN?: number;
        reqP2o5?: number;
        reqK2o?: number;
        remN?: number;
        remP2o5?: number;
        remK2o?: number;
        crudeProtien?: number;
        prevCropId?: number;
        coverCropHarvested?: string | null;
        prevYearManureAppl_volCatCd?: number;
        yieldHarvestUnit?: number;
        yieldByHarvestUnit?: number;
        plantAgeYears?: number | null;
        numberOfPlantsPerAcre?: number;
        distanceBtwnPlantsRows?: number | null;
        willPlantsBePruned?: boolean;
        whereWillPruningsGo?: string | null;
        willSawdustBeApplied?: boolean;
      }>;
      FeedForageAnalyses?: any[];
      SoilTest?: any | null;
      LeafTest?: any | null;
      HasSoilTest?: boolean;
      PreviousYearManureApplicationFrequency?: string;
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
    }>;
    FarmAnimals?: any[];
    FarmManures?: any[];
    GeneratedManures?: any[];
    ImportedManures?: any[];
    SeparatedSolidManures?: any[];
    ManureStorageSystems?: any[];
  }>;
  LastAppliedFarmManureId?: any | null;
  NMPReleaseVersion?: number;
};

export default NMPFile;
