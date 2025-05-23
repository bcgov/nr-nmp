const defaultNMPFileYear = {
  Year: '',
  Fields: [],
  // Keeping these properties to show what used to be stored in the NMP file
  /*
  Fields: [
    {
      Id: 0,
      FieldName: '',
      Area: 0,
      Comment: null,
      Nutrients: null,
      HasNutrients: false,
      Crops: [
        {
          id: 0,
          cropId: '',
          cropOther: null,
          cropName: '',
          cropTypeName: '',
          yield: 0,
          reqN: 0,
          stdN: 0,
          reqP2o5: 0,
          reqK2o: 0,
          remN: 0,
          remP2o5: 0,
          remK2o: 0,
          crudeProtien: 0,
          prevCropId: 0,
          coverCropHarvested: null,
          prevYearManureAppl_volCatCd: 0,
          yieldHarvestUnit: 0,
          yieldByHarvestUnit: 0,
          plantAgeYears: null,
          numberOfPlantsPerAcre: 0,
          distanceBtwnPlantsRows: null,
          willPlantsBePruned: false,
          whereWillPruningsGo: null,
          willSawdustBeApplied: false,
        },
      ],
      FeedForageAnalyses: [],
      SoilTest: null,
      LeafTest: null,
      HasSoilTest: false,
      PreviousYearManureApplicationFrequency: '',
      PreviousYearManureApplicationNitrogenCredit: null,
      SoilTestNitrateOverrideNitrogenCredit: null,
      IsSeasonalFeedingArea: false,
      SeasonalFeedingArea: null,
      FeedingDaysSpentInFeedingArea: null,
      FeedingPercentageOutsideFeeingArea: null,
      MatureAnimalCount: null,
      GrowingAnimalCount: null,
      MatureAnimalAverageWeight: null,
      GrowingAnimalAverageWeight: null,
      MatureAnimalDailyFeedRequirementId: 0,
      GrowingAnimalDailyFeedRequirementId: 0,
    },
  ],
  */
  FarmAnimals: [],
  FarmManures: [],
  GeneratedManures: [],
  ImportedManures: [],
  SeparatedSolidManures: [],
  ManureStorageSystems: [],
};

export default defaultNMPFileYear;
