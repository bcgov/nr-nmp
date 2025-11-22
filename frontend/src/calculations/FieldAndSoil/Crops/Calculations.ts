import {
  Crop,
  CropsConversionFactors,
  CropType,
  NMPFileCrop,
  NMPFileField,
  NMPFileSoilTest,
  Region,
  SoilTestNutrientKelownaRange,
  SoilTestPhosphorousRegion,
  SoilTestPotassiumRegion,
  SoilTestPhosphorousRecommendation,
  SoilTestPotassiumRecommendation,
} from '@/types';
import {
  PLANT_AGES,
  DEFAULT_SOIL_TEST,
  COVER_CROP_ID,
  HarvestUnit,
  CROP_RASPBERRIES_ID,
  DEFAULT_BERRY_DATA,
  CROP_BLUEBERRIES_ID,
} from '@/constants';
import { AppStateTables } from '@/types/AppState';

export function getPhosphorousRegionFromList(
  list: SoilTestPhosphorousRegion[],
  cropId: number,
  region: Region,
) {
  const phosphorousRegion = list.find(
    (p) =>
      p.cropid === cropId && p.soiltestphosphorousregioncode === region.soiltestphosphorousregioncd,
  );
  if (!phosphorousRegion) {
    throw new Error(
      `No soil test phosphorous region found with crop id ${cropId} and soil test phosphorous region code ${region.soiltestphosphorousregioncd}.`,
    );
  }
  return phosphorousRegion;
}

export function getPotassiumRegionFromList(
  list: SoilTestPotassiumRegion[],
  cropId: number,
  region: Region,
) {
  const potassiumRegion = list.find(
    (p) =>
      p.cropid === cropId && p.soiltestpotassiumregioncode === region.soiltestpotassiumregioncd,
  );
  if (!potassiumRegion) {
    throw new Error(
      `No soil test potassium region found with crop id ${cropId} and soil test potassium region code ${region.soiltestpotassiumregioncd}.`,
    );
  }
  return potassiumRegion;
}

function validateIds(combinedCropData: NMPFileCrop, crop: Crop, cropType: CropType) {
  if (crop.id !== combinedCropData.cropId) {
    throw new Error(
      `Crop id mismatch: expected ${combinedCropData.cropId} but received ${crop.id}`,
    );
  }
  if (cropType.id !== combinedCropData.cropTypeId) {
    throw new Error(
      `Crop type id mismatch: expected ${combinedCropData.cropTypeId} but received ${cropType.id}`,
    );
  }
}

/**
 * Calculates potassium (K₂O) removal for a crop
 *
 * @param {NMPFileCrop} combinedCropData - Crop data including yields and specifications
 * @param {Crop} crop - Crop object that corresponds with the combinedCropData cropId
 * @param {CropType} cropType - CropType object that corresponds with the combinedCropData cropTypeId
 * @returns {number} Amount of K₂O removed in lbs/acre, rounded to nearest integer
 */
export function getCropRemovalK20(
  combinedCropData: NMPFileCrop,
  crop: Crop,
  cropType: CropType,
): number {
  validateIds(combinedCropData, crop, cropType);
  // For cover crops not harvested, there's no removal
  if (cropType.covercrop && !combinedCropData.coverCropHarvested) {
    return 0;
  }

  let k2oRemoval: number = 0;

  // Calculate removal differently based on crop harvesting method
  if (
    crop.harvestbushelsperton &&
    crop.harvestbushelsperton > 0 &&
    combinedCropData.yieldHarvestUnit === HarvestUnit.BushelsPerAcre
  ) {
    k2oRemoval = (combinedCropData.yield / crop.harvestbushelsperton) * crop.cropremovalfactork2o;
  } else {
    k2oRemoval = combinedCropData.yield * crop.cropremovalfactork2o;
  }

  return Math.round(k2oRemoval) || 0;
}

/**
 * Calculates phosphorous (P₂O₅) removal for a crop
 *
 * @param {NMPFileCrop} combinedCropData - Crop data including yields and specifications
 * @param {Crop} crop - Crop object that corresponds with the combinedCropData cropId
 * @param {CropType} cropType - CropType object that corresponds with the combinedCropData cropTypeId
 * @returns {number} Amount of P₂O₅ removed in lbs/acre, rounded to nearest integer
 */
export function getCropRemovalP205(
  combinedCropData: NMPFileCrop,
  crop: Crop,
  cropType: CropType,
): number {
  validateIds(combinedCropData, crop, cropType);
  // For cover crops not harvested, there's no removal
  if (cropType.covercrop && !combinedCropData.coverCropHarvested) {
    return 0;
  }

  let p2o5Removal: number = 0;

  // Calculate removal differently based on crop harvesting method
  if (
    crop.harvestbushelsperton &&
    crop.harvestbushelsperton > 0 &&
    combinedCropData.yieldHarvestUnit === HarvestUnit.BushelsPerAcre
  ) {
    p2o5Removal = (combinedCropData.yield / crop.harvestbushelsperton) * crop.cropremovalfactorp2o5;
  } else {
    p2o5Removal = combinedCropData.yield * crop.cropremovalfactorp2o5;
  }

  return Math.round(p2o5Removal) || 0;
}

/**
 * Calculates nitrogen removal for a crop
 *
 * @param {NMPFileCrop} combinedCropData - Crop data including yields and specifications
 * @param {Crop} crop - Crop object that corresponds with the combinedCropData cropId
 * @param {CropType} cropType - CropType object that corresponds with the combinedCropData cropTypeId
 * @returns {number} Amount of N removed in lbs/acre, rounded to nearest integer
 */
export function getCropRemovalN(
  combinedCropData: NMPFileCrop,
  crop: Crop,
  cropType: CropType,
): number {
  validateIds(combinedCropData, crop, cropType);
  let nRemoval: number = 0;

  // Special calculation for forage crops with crude protein data
  if (cropType.crudeproteinrequired) {
    if (!combinedCropData.crudeProtein || combinedCropData.crudeProtein === 0) {
      nRemoval = crop.cropremovalfactornitrogen * combinedCropData.yield;
    } else {
      const nToProteinConversionFactor = 0.625;
      const unitConversionFactor = 0.5;

      const newCropRemovalFactorNitrogen =
        combinedCropData.crudeProtein / (nToProteinConversionFactor * unitConversionFactor);
      nRemoval = newCropRemovalFactorNitrogen * combinedCropData.yield;
    }
  } else if (
    crop.harvestbushelsperton &&
    crop.harvestbushelsperton > 0 &&
    combinedCropData.yieldHarvestUnit === HarvestUnit.BushelsPerAcre
  ) {
    nRemoval =
      (combinedCropData.yield / crop.harvestbushelsperton) * crop.cropremovalfactornitrogen;
  } else {
    nRemoval = combinedCropData.yield * crop.cropremovalfactornitrogen;
  }

  if (cropType?.id === COVER_CROP_ID && !combinedCropData.coverCropHarvested) {
    // Override and set amount to zero in this case
    nRemoval = 0;
  }
  return Math.round(nRemoval) || 0;
}

/**
 * Calculates nitrogen requirement for a crop, accounting for previous crop credit
 *
 * @param {NMPFileCrop} combinedCropData - Crop data including yields and specifications
 * @param {Crop} crop - Crop object that corresponds with the combinedCropData cropId
 * @param {CropType} cropType - CropType object that corresponds with the combinedCropData cropTypeId
 * @returns {number} Required N application in lbs/acre, rounded to nearest integer
 */
export function getCropRequirementN(
  combinedCropData: NMPFileCrop,
  crop: Crop,
  cropType: CropType,
): number {
  validateIds(combinedCropData, crop, cropType);
  let nRequirement = 0;
  // Different calculation methods based on nitrogen recommendation ID
  switch (crop.nitrogenrecommendationid) {
    case 1:
      if (crop.nitrogenrecommendationpoundperacre !== null) {
        nRequirement = crop.nitrogenrecommendationpoundperacre;
      }
      break;
    case 2:
      if (crop.nitrogenrecommendationpoundperacre !== null) {
        nRequirement = crop.nitrogenrecommendationpoundperacre;
      }
      break;
    case 3:
      nRequirement = getCropRemovalN(combinedCropData, crop, cropType);
      break;
    case 4: {
      if (combinedCropData.yield !== 0) {
        // Wait wtf, why do we calculate 1????
        nRequirement = Math.round(
          (combinedCropData.yield / combinedCropData.yield) *
            crop.nitrogenrecommendationpoundperacre,
        );
      }
      break;
    }
    default:
      break;
  }
  // Subtract N credit from previous crop and ensure value isn't negative
  nRequirement -= combinedCropData.nCredit;
  nRequirement = nRequirement < 0 ? 0 : nRequirement;

  return Math.round(nRequirement);
}

/**
 * Calculates potassium (K₂O) requirement based on soil test and crop needs
 *
 * @returns {number} Required K₂O application in lbs/acre, rounded to nearest integer
 */
export function getCropRequirementK2O(
  soilTest: NMPFileSoilTest | undefined,
  cropSTKRegion: SoilTestPotassiumRegion,
  potassiumRanges: SoilTestNutrientKelownaRange[],
  potassiumRecommendations: SoilTestPotassiumRecommendation[],
  conversionFactors: CropsConversionFactors,
): number {
  // Use default K if soil test data is missing
  // Kelowna ranges require integers, so this number is rounded
  const soilTestK = Math.round(soilTest?.convertedKelownaK || DEFAULT_SOIL_TEST.convertedKelownaK!);

  // Find the range this number falls into. If it exceeds the max, use the highest (last) range
  const kelownaRange =
    potassiumRanges.find((r) => r.rangelow <= soilTestK && r.rangehigh >= soilTestK) ||
    potassiumRanges[potassiumRanges.length - 1];

  const potassiumRecommendation = potassiumRecommendations.find(
    (r) =>
      r.soiltestpotassiumkelownarangeid === kelownaRange.id &&
      r.soiltestpotassiumregioncode === cropSTKRegion.soiltestpotassiumregioncode &&
      r.potassiumcropgroupregioncode === cropSTKRegion.potassiumcropgroupregioncode,
  );

  // Convert from kg/ha to lbs/acre
  return Math.round(
    potassiumRecommendation!.k2orecommendationkilogramperhectare *
      conversionFactors.kilogramperhectaretopoundperacreconversion,
  );
}

/**
 * Calculates phosphorous (P₂O₅) requirement based on soil test and crop needs
 *
 * @returns {number} Required P₂O₅ application in lbs/acre, rounded to nearest integer
 */
export function getCropRequirementP205(
  soilTest: NMPFileSoilTest | undefined,
  cropSTPRegion: SoilTestPhosphorousRegion,
  phosphorousRanges: SoilTestNutrientKelownaRange[],
  phosphorousRecommendations: SoilTestPhosphorousRecommendation[],
  conversionFactors: CropsConversionFactors,
): number {
  // Use default P if soil test data is missing
  // Kelowna ranges require integers, so this number is rounded
  const soilTestP = Math.round(soilTest?.convertedKelownaP || DEFAULT_SOIL_TEST.convertedKelownaP!);

  // Find the range this number falls into. If it exceeds the max, use the highest (last) range
  const kelownaRange =
    phosphorousRanges.find((r) => r.rangelow <= soilTestP && r.rangehigh >= soilTestP) ||
    phosphorousRanges[phosphorousRanges.length - 1];

  const phosphorousRecommendation = phosphorousRecommendations.find(
    (r) =>
      r.soiltestphosphorouskelownarangeid === kelownaRange.id &&
      r.soiltestphosphorousregioncode === cropSTPRegion.soiltestphosphorousregioncode &&
      r.phosphorouscropgroupregioncode === cropSTPRegion.phosphorouscropgroupregioncode,
  );

  // Convert from kg/ha to lbs/acre
  return Math.round(
    phosphorousRecommendation!.p2o5recommendationkilogramperhectare *
      conversionFactors.kilogramperhectaretopoundperacreconversion,
  );
}

export function getRaspberryNutrients(
  cropYield: number,
  willSawdustBeApplied: boolean,
  willPlantsBePruned: boolean,
  whereWillPruningsGo: string,
  soilTestValP: number,
  soilTestValK: number,
  leafTissueP: number,
  leafTissueK: number,
) {
  const nutrientInputs = {
    reqN: 0,
    reqP2o5: 0,
    reqK2o: 0,
    remN: 0,
    remP2o5: 0,
    remK2o: 0,
  };

  // Calculate nitrogen requirement based on yield
  let tempN = 0;
  if (cropYield < 3.35) {
    tempN = 54;
  } else if (cropYield >= 3.35 && cropYield <= 5.35) {
    tempN = 71;
  } else if (cropYield > 5.35) {
    tempN = 89;
  }

  nutrientInputs.reqN = Math.round(tempN + (willSawdustBeApplied ? 25 : 0));

  // Calculate P₂O₅ requirement based on leaf tissue P and soil test P
  let tempReqP2O5 = 0;
  if (leafTissueP < 0.16) {
    if (soilTestValP < 15) {
      tempReqP2O5 = 80;
    } else if (soilTestValP >= 15 && soilTestValP <= 30) {
      tempReqP2O5 = 70;
    } else if (soilTestValP > 30) {
      tempReqP2O5 = 40;
    }
  } else if (leafTissueP >= 0.16 && leafTissueP <= 0.18) {
    if (soilTestValP < 15) {
      tempReqP2O5 = 70;
    } else if (soilTestValP >= 15 && soilTestValP <= 30) {
      tempReqP2O5 = 60;
    } else if (soilTestValP > 30) {
      tempReqP2O5 = 30;
    }
  } else if (leafTissueP > 0.19) {
    if (soilTestValP < 15) {
      tempReqP2O5 = 40;
    } else if (soilTestValP >= 15 && soilTestValP <= 30) {
      tempReqP2O5 = 30;
    } else if (soilTestValP > 30) {
      tempReqP2O5 = 0;
    }
  }
  nutrientInputs.reqP2o5 = Math.round(tempReqP2O5);

  // Calculate K₂O requirement based on leaf tissue K and soil test K
  let tempReqK2O = 0;
  if (leafTissueK < 1.0) {
    if (soilTestValK < 120) {
      tempReqK2O = 100;
    } else if (soilTestValK >= 120 && soilTestValK <= 280) {
      tempReqK2O = 80;
    } else if (soilTestValK > 280) {
      tempReqK2O = 50;
    }
  } else if (leafTissueK >= 1.0 && leafTissueK <= 1.25) {
    if (soilTestValK < 120) {
      tempReqK2O = 80;
    } else if (soilTestValK >= 120 && soilTestValK <= 280) {
      tempReqK2O = 60;
    } else if (soilTestValK > 280) {
      tempReqK2O = 30;
    }
  } else if (leafTissueK > 1.25) {
    if (soilTestValK < 120) {
      tempReqK2O = 50;
    } else if (soilTestValK >= 120 && soilTestValK <= 280) {
      tempReqK2O = 30;
    } else if (soilTestValK > 280) {
      tempReqK2O = 0;
    }
  }
  nutrientInputs.reqK2o = Math.round(tempReqK2O);

  // Calculate P₂O₅ removal
  let tempRemP2O5 = cropYield;
  const isPrunedAndRemoved = willPlantsBePruned && whereWillPruningsGo === 'Removed from field';
  tempRemP2O5 = tempRemP2O5 * 1.145 + (isPrunedAndRemoved ? 2.748 : 0);
  nutrientInputs.remP2o5 = Math.round(tempRemP2O5);

  // Calculate K₂O removal
  let tempRemK2O = cropYield;
  tempRemK2O = tempRemK2O * 3.63 + (isPrunedAndRemoved ? 11.374 : 0);
  nutrientInputs.remK2o = Math.round(tempRemK2O);

  return nutrientInputs;
}

export function getBlueberryNutrients(
  cropYield: number,
  willSawdustBeApplied: boolean,
  willPlantsBePruned: boolean,
  whereWillPruningsGo: string,
  plantAgeYears: number,
  numberOfPlantsPerAcre: number,
  soilTestValP: number,
  leafTissueP: number,
  leafTissueK: number,
) {
  const nutrientInputs = {
    reqN: 0,
    reqP2o5: 0,
    reqK2o: 0,
    remN: 0,
    remP2o5: 0,
    remK2o: 0,
  };

  const tempN = PLANT_AGES.find((item) => item.key === plantAgeYears)?.value || 0;

  nutrientInputs.reqN = Math.round(
    (numberOfPlantsPerAcre * tempN) / 1000 / 1.12 + (willSawdustBeApplied ? 25 : 0),
  );

  // P₂O₅ requirement calculation
  let tempReqP2O5 = 0;
  const soilTestP = soilTestValP;
  if (leafTissueP < 0.08) {
    tempReqP2O5 = soilTestP < 100 ? 63 : 40;
  } else if (leafTissueP >= 0.08 && leafTissueP <= 0.1) {
    tempReqP2O5 = soilTestP < 100 ? 40 : 0;
  } else if (leafTissueP > 0.1) {
    tempReqP2O5 = 0;
  }
  nutrientInputs.reqP2o5 = Math.round(tempReqP2O5);

  // K₂O requirement calculation
  let tempReqK2O = 0;
  if (leafTissueK < 0.2) {
    tempReqK2O = 103;
  } else if (leafTissueK >= 0.2 && leafTissueK <= 0.4) {
    tempReqK2O = 76;
  } else if (leafTissueK > 0.4) {
    tempReqK2O = 0;
  }
  nutrientInputs.reqK2o = Math.round(tempReqK2O);

  // P₂O₅ removal calculation
  let tempRemP2O5 = cropYield;
  const isPrunedAndRemoved = willPlantsBePruned && whereWillPruningsGo === 'Removed from field';
  tempRemP2O5 = tempRemP2O5 * 0.687 + (isPrunedAndRemoved ? 3.435 : 0);
  nutrientInputs.remP2o5 = Math.round(tempRemP2O5);

  // K₂O removal calculation
  let tempRemK2O = cropYield;
  tempRemK2O = tempRemK2O * 3.509 + (isPrunedAndRemoved ? 7.865 : 0);
  nutrientInputs.remK2o = Math.round(tempRemK2O);

  return nutrientInputs;
}

/**
 * Turns all of the nutrient values negative for CalculateNutrients.
 * Crops only remove, not add, nutrients from the soil.
 * @param data The formData
 * @returns Identical data with all nutrient values negative
 */
export function postprocessModalData(data: NMPFileCrop, calculatedN?: number): NMPFileCrop {
  return {
    ...data,
    reqN: -1 * data.reqN,
    reqP2o5: -1 * data.reqP2o5,
    reqK2o: -1 * data.reqK2o,
    remN: -1 * data.remN,
    remP2o5: -1 * data.remP2o5,
    remK2o: -1 * data.remK2o,
    // Store the calculated N value if N was adjusted
    // Store as positive value since we'll need it in the UI
    calculatedN: data.reqNAdjusted ? calculatedN || 0 : undefined,
  };
}

/**
 * Helper function to extract nutrient values from calculation results
 */
export function extractNutrientValues(_nutrients: any) {
  return {
    cropRequirementN: _nutrients.reqN,
    cropRequirementP205: _nutrients.reqP2o5,
    cropRequirementK2O: _nutrients.reqK2o,
    cropRemovalN: _nutrients.remN,
    cropRemovalP205: _nutrients.remP2o5,
    cropRemovalK20: _nutrients.remK2o,
  };
}

function oldCalcCropRequirements(
  selectedCrop: Crop,
  selectedCropType: CropType,
  nmpFileCrop: NMPFileCrop,
  field: NMPFileField,
  phosphorousRegion: SoilTestPhosphorousRegion,
  phosphorousRanges: SoilTestNutrientKelownaRange[],
  phosphorousRecommendations: SoilTestPhosphorousRecommendation[],
  potassiumRegion: SoilTestPotassiumRegion,
  potassiumRanges: SoilTestNutrientKelownaRange[],
  potassiumRecommendations: SoilTestPotassiumRecommendation[],
  conversionFactors: CropsConversionFactors,
) {
  const cropDataForCalc = nmpFileCrop;

  let nutrientValues;
  if (selectedCrop.id === CROP_RASPBERRIES_ID) {
    const nutrients = getRaspberryNutrients(
      cropDataForCalc.yield,
      cropDataForCalc.willSawdustBeApplied!,
      cropDataForCalc.willPlantsBePruned!,
      cropDataForCalc.whereWillPruningsGo!,
      field.soilTest?.valP !== undefined
        ? field.soilTest.valP
        : DEFAULT_BERRY_DATA.defaultRaspberrySoilTestP,
      field.soilTest?.valK !== undefined
        ? field.soilTest.valK
        : DEFAULT_BERRY_DATA.defaultRaspberrySoilTestK,
      cropDataForCalc.leafTissueP !== undefined
        ? cropDataForCalc.leafTissueP
        : DEFAULT_BERRY_DATA.defaultRaspberryLeafTestP,
      cropDataForCalc.leafTissueK !== undefined
        ? cropDataForCalc.leafTissueK
        : DEFAULT_BERRY_DATA.defaultRaspberryLeafTestK,
    );
    nutrientValues = extractNutrientValues(nutrients);
  } else if (selectedCrop.id === CROP_BLUEBERRIES_ID) {
    const nutrients = getBlueberryNutrients(
      cropDataForCalc.yield,
      cropDataForCalc.willSawdustBeApplied!,
      cropDataForCalc.willPlantsBePruned!,
      cropDataForCalc.whereWillPruningsGo!,
      cropDataForCalc.plantAgeYears!,
      cropDataForCalc.numberOfPlantsPerAcre!,
      field.soilTest?.valP !== undefined
        ? field.soilTest.valP
        : DEFAULT_BERRY_DATA.defaultBlueberrySoilTestP,
      cropDataForCalc.leafTissueP !== undefined
        ? cropDataForCalc.leafTissueP
        : DEFAULT_BERRY_DATA.defaultBlueberryLeafTestP,
      cropDataForCalc.leafTissueK !== undefined
        ? cropDataForCalc.leafTissueK
        : DEFAULT_BERRY_DATA.defaultBlueberryLeafTestK,
    );
    nutrientValues = extractNutrientValues(nutrients);
  } else {
    // Calculate crop requirements (P₂O₅, K₂O, N)
    const cropRequirementN = getCropRequirementN(cropDataForCalc, selectedCrop, selectedCropType);
    const cropRequirementP205 = getCropRequirementP205(
      field.soilTest,
      phosphorousRegion,
      phosphorousRanges,
      phosphorousRecommendations,
      conversionFactors,
    );
    const cropRequirementK2O = getCropRequirementK2O(
      field.soilTest,
      potassiumRegion,
      potassiumRanges,
      potassiumRecommendations,
      conversionFactors,
    );

    // Calculate crop removals (N, P₂O₅, K₂O)
    const cropRemovalN = getCropRemovalN(cropDataForCalc, selectedCrop, selectedCropType);
    const cropRemovalP205 = getCropRemovalP205(cropDataForCalc, selectedCrop, selectedCropType);
    const cropRemovalK20 = getCropRemovalK20(cropDataForCalc, selectedCrop, selectedCropType);

    nutrientValues = {
      cropRequirementN,
      cropRequirementP205,
      cropRequirementK2O,
      cropRemovalN,
      cropRemovalP205,
      cropRemovalK20,
    };
  }

  // Mark calculations as performed
  return nutrientValues;
}

export function calculateCropRequirements(
  nmpFileRegionId: number,
  nmpFileField: NMPFileField,
  nmpFileCrop: NMPFileCrop,
  tables: AppStateTables,
) {
  // Get all the data from the database needed to perform these calculations
  const region = tables.regions.find((r) => r.id === nmpFileRegionId);
  if (!region) {
    throw new Error(`No region found with id ${nmpFileRegionId}`);
  }
  const phosphorousRegion = getPhosphorousRegionFromList(
    tables.soilTestPhosphorousRegions,
    nmpFileCrop.cropId,
    region,
  );
  const potassiumRegion = getPotassiumRegionFromList(
    tables.soilTestPotassiumRegions,
    nmpFileCrop.cropId,
    region,
  );
  const crop = tables.crops.find((c) => c.id === nmpFileCrop.cropId);
  const cropType = tables.cropTypes.find((c) => c.id === nmpFileCrop.cropTypeId);
  if (!phosphorousRegion || !potassiumRegion || !crop || !cropType) {
    throw new Error(
      `calculateCropRequirements failed to fetch necessary data. Region id: ${nmpFileRegionId}. Crop id: ${nmpFileCrop.cropId}. Crop type id: ${nmpFileCrop.cropTypeId}.`,
    );
  }

  return oldCalcCropRequirements(
    crop,
    cropType,
    nmpFileCrop,
    nmpFileField,
    phosphorousRegion,
    tables.soilTestPhosphorousKelownaRanges,
    tables.soilTestPhosphorousRecommendations,
    potassiumRegion,
    tables.soilTestPotassiumKelownaRanges,
    tables.soilTestPotassiumRecommendation,
    tables.cropConversionFactors,
  );
}
