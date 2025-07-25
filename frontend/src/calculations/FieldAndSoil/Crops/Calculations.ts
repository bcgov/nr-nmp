/* eslint-disable eqeqeq */
import axios from 'axios';
import { env } from '@/env';
import {
  Crop,
  CropsConversionFactors,
  CropType,
  NMPFileCropData,
  NMPFileSoilTestData,
} from '@/types';
import defaultSoilTestData from '@/constants/DefaultSoilTestData';

/**
 * Fetches crop conversion factors from the API
 *
 * @returns {Promise<CropsConversionFactors | null>} Conversion factors for calculations
 */
export async function getConversionFactors(): Promise<CropsConversionFactors | null> {
  try {
    const response = await axios.get(`${env.VITE_BACKEND_URL}/api/cropsconversionfactors/`);
    return response.data[0];
  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
 * Retrieves region data by region ID
 *
 * @param {number} regionId - The ID of the region to fetch
 * @returns {Promise<any>} Region data
 */
export async function getRegion(regionId: number) {
  try {
    const response = await axios.get(`${env.VITE_BACKEND_URL}/api/regions/${regionId}/`);
    return response.data[0];
  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
 * Fetches crop type data by crop type ID
 *
 * @param {number} cropTypeId - ID of the crop type to fetch
 * @returns {Promise<any>} Crop type data
 */
export async function getCropType(cropTypeId: number) {
  try {
    const response = await axios.get(`${env.VITE_BACKEND_URL}/api/croptypes/${cropTypeId}/`);
    return response.data[0];
  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
 * Gets soil test regions for a specific crop
 *
 * @param {number} cropId - ID of the crop
 * @param {number} soilTestPotassiumRegionCode - Region code for potassium soil test
 * @param {string} endpoint - API endpoint to query
 * @returns {Promise<any>} Soil test region data for the specified crop
 */
export async function getCropSoilTestRegions(
  cropId: number,
  soilTestPotassiumRegionCode: number,
  endpoint: string,
) {
  try {
    const response = await axios.get(
      `${env.VITE_BACKEND_URL}/api/${endpoint}/${cropId}/${soilTestPotassiumRegionCode}/`,
    );
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
 * Finds the Kelowna range that contains a specific soil test phosphorus value
 *
 * @param {number} STP - Soil test phosphorus value in ppm
 * @param {string} endpoint - API endpoint to query
 * @returns {Promise<any>} Matching Kelowna range
 */
export async function getKelownaRangeByPpm(STP: number, endpoint: string) {
  try {
    const ranges = await axios.get(`${env.VITE_BACKEND_URL}/api/${endpoint}/`);
    const response = ranges.data.find(
      (range: any) => range.rangelow <= STP && range.rangehigh >= STP,
    );
    return response;
  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
 * Retrieves recommendations based on soil test values, regions, and crop group
 *
 * @param {number} kelownaRangeId - ID of the Kelowna range
 * @param {number} soilTestRegionCd - Soil test region code
 * @param {number} cropGroupRegionCd - Crop group region code
 * @param {string} endpoint - API endpoint for recommendations
 * @returns {Promise<any>} Recommendations for nutrient application
 */
export async function getRecommendations(
  kelownaRangeId: number,
  soilTestRegionCd: number,
  cropGroupRegionCd: number,
  endpoint: string,
) {
  try {
    const response = await axios.get(`${env.VITE_BACKEND_URL}/api/${endpoint}/`);
    let recommendations;

    if (endpoint.includes('phosphorous')) {
      recommendations = response.data.find(
        (stp: any) =>
          stp.soiltestphosphorouskelownarangeid === kelownaRangeId &&
          stp.soiltestphosphorousregioncode === soilTestRegionCd &&
          stp.phosphorouscropgroupregioncode === cropGroupRegionCd,
      );
    } else if (endpoint.includes('potassium')) {
      recommendations = response.data.find(
        (stk: any) =>
          stk.soiltestpotassiumkelownarangeid === kelownaRangeId &&
          stk.soiltestpotassiumregioncode === soilTestRegionCd &&
          stk.potassiumcropgroupregioncode === cropGroupRegionCd,
      );
    }

    return recommendations;
  } catch (error) {
    console.error(error);
    return null;
  }
}

function validateIds(combinedCropData: NMPFileCropData, crop: Crop, cropType: CropType) {
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
 * Calculates potassium (K2O) removal for a crop
 *
 * @param {NMPFileCropData} combinedCropData - Crop data including yields and specifications
 * @param {Crop} crop - Crop object that corresponds with the combinedCropData cropId
 * @param {CropType} cropType - CropType object that corresponds with the combinedCropData cropTypeId
 * @returns {number} Amount of K2O removed in lbs/acre, rounded to nearest integer
 */
export function getCropRemovalK20(
  combinedCropData: NMPFileCropData,
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
  if (crop.harvestbushelsperton && crop.harvestbushelsperton > 0) {
    k2oRemoval = (combinedCropData.yield! / crop.harvestbushelsperton) * crop.cropremovalfactork2o;
  } else {
    k2oRemoval = combinedCropData.yield! * crop.cropremovalfactork2o;
  }

  return Math.round(k2oRemoval) || 0;
}

/**
 * Calculates phosphorus (P2O5) removal for a crop
 *
 * @param {NMPFileCropData} combinedCropData - Crop data including yields and specifications
 * @param {Crop} crop - Crop object that corresponds with the combinedCropData cropId
 * @param {CropType} cropType - CropType object that corresponds with the combinedCropData cropTypeId
 * @returns {number} Amount of P2O5 removed in lbs/acre, rounded to nearest integer
 */
export function getCropRemovalP205(
  combinedCropData: NMPFileCropData,
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
  if (crop.harvestbushelsperton && crop.harvestbushelsperton > 0) {
    p2o5Removal =
      (combinedCropData.yield! / crop.harvestbushelsperton) * crop.cropremovalfactorp2o5;
  } else {
    p2o5Removal = combinedCropData.yield! * crop.cropremovalfactorp2o5;
  }

  return Math.round(p2o5Removal) || 0;
}

/**
 * Calculates nitrogen removal for a crop
 *
 * @param {NMPFileCropData} combinedCropData - Crop data including yields and specifications
 * @param {Crop} crop - Crop object that corresponds with the combinedCropData cropId
 * @param {CropType} cropType - CropType object that corresponds with the combinedCropData cropTypeId
 * @returns {number} Amount of N removed in lbs/acre, rounded to nearest integer
 */
export function getCropRemovalN(
  combinedCropData: NMPFileCropData,
  crop: Crop,
  cropType: CropType,
): number {
  validateIds(combinedCropData, crop, cropType);
  let nRemoval: number = 0;

  // Special calculation for forage crops with crude protein data
  if (cropType.crudeproteinrequired) {
    if (!combinedCropData.crudeProtein || combinedCropData.crudeProtein == 0) {
      nRemoval = crop.cropremovalfactornitrogen * combinedCropData.yield!;
    } else {
      const nToProteinConversionFactor = 0.625;
      const unitConversionFactor = 0.5;

      const newCropRemovalFactorNitrogen =
        combinedCropData.crudeProtein / (nToProteinConversionFactor * unitConversionFactor);
      nRemoval = newCropRemovalFactorNitrogen * combinedCropData.yield!;
    }
  } else if (crop.harvestbushelsperton && crop.harvestbushelsperton > 0) {
    nRemoval =
      (combinedCropData.yield! / crop.harvestbushelsperton) * crop.cropremovalfactornitrogen;
  } else {
    nRemoval = combinedCropData.yield! * crop.cropremovalfactornitrogen;
  }

  return Math.round(nRemoval) || 0;
}

/**
 * Calculates nitrogen requirement for a crop, accounting for previous crop credit
 *
 * @param {NMPFileCropData} combinedCropData - Crop data including yields and specifications
 * @param {Crop} crop - Crop object that corresponds with the combinedCropData cropId
 * @param {CropType} cropType - CropType object that corresponds with the combinedCropData cropTypeId
 * @returns {number} Required N application in lbs/acre, rounded to nearest integer
 */
export function getCropRequirementN(
  combinedCropData: NMPFileCropData,
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
      if (combinedCropData.yield! !== 0) {
        // Wait wtf, why do we calculate 1????
        nRequirement = Math.round(
          (combinedCropData.yield! / combinedCropData.yield!) *
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
 * Calculates potassium (K2O) requirement based on soil test and crop needs
 *
 * @param {NMPFileCropData} combinedCropData - Crop data including yields and specifications
 * @param {NMPFileSoilTestData | undefined} soilTest - Soil test of field
 * @param {number} regionId - ID of the region
 * @returns {Promise<number>} Required K2O application in lbs/acre, rounded to nearest integer
 */
export async function getCropRequirementK2O(
  combinedCropData: NMPFileCropData,
  soilTest: NMPFileSoilTestData | undefined,
  regionId: number,
): Promise<number> {
  const conversionFactors = await getConversionFactors();
  if (conversionFactors === null) throw new Error('Failed to get conversion factors.');
  const region = await getRegion(regionId);

  // Use default if soil test data is missing
  let STK = soilTest?.convertedKelownaK || defaultSoilTestData.convertedKelownaK;
  if (STK == '0' || STK == null) STK = String(conversionFactors.defaultsoiltestkelownapotassium);

  const cropSTKRegionCd = await getCropSoilTestRegions(
    combinedCropData.cropId,
    region?.soiltestpotassiumregioncd,
    'cropsoilpotassiumregions',
  );

  const potassiumCropGroupRegionCd = cropSTKRegionCd[0].potassiumcropgroupregioncode;

  const sTKKelownaRange = await getKelownaRangeByPpm(Number(STK), 'soiltestpotassiumkelonwaranges');

  const stkKelownaRangeId = sTKKelownaRange.id;
  if (potassiumCropGroupRegionCd == null) {
    return 0;
  }
  const sTKRecommended = await getRecommendations(
    stkKelownaRangeId,
    region.soiltestpotassiumregioncd,
    potassiumCropGroupRegionCd,
    'soiltestpotassiumrecommendation',
  );

  // Convert from kg/ha to lbs/acre
  return Math.round(
    Number(sTKRecommended.k2orecommendationkilogramperhectare) *
      conversionFactors.kilogramperhectaretopoundperacreconversion,
  );
}

/**
 * Calculates phosphorus (P2O5) requirement based on soil test and crop needs
 *
 * @param {NMPFileCropData} combinedCropData - Crop data including yields and specifications
 * @param {NMPFileSoilTestData | undefined} soilTest - Soil test of field
 * @param {number} regionId - ID of the region
 * @returns {Promise<number>} Required P2O5 application in lbs/acre, rounded to nearest integer
 */
export async function getCropRequirementP205(
  combinedCropData: NMPFileCropData,
  soilTest: NMPFileSoilTestData | undefined,
  regionId: number,
): Promise<number> {
  const conversionFactors = await getConversionFactors();
  if (conversionFactors === null) throw new Error('Failed to get conversion factors.');
  const region = await getRegion(regionId);

  // Use default if soil test data is missing
  let STP = soilTest?.convertedKelownaP || defaultSoilTestData.convertedKelownaP;
  if (STP == '0' || STP == null) STP = String(conversionFactors.defaultsoiltestkelownaphosphorous);

  const cropSTPRegionCd = await getCropSoilTestRegions(
    combinedCropData.cropId,
    region?.soiltestphosphorousregioncd,
    'cropsoiltestphosphorousregions',
  );

  const phosphorousCropGroupRegionCd = cropSTPRegionCd[0].phosphorouscropgroupregioncode;

  const sTPKelownaRange = await getKelownaRangeByPpm(
    Number(STP),
    'soiltestphosphorouskelonwaranges',
  );

  const stpKelownaRangeId = sTPKelownaRange.id;
  if (phosphorousCropGroupRegionCd == null) {
    return 0;
  }
  const sTPRecommended = await getRecommendations(
    stpKelownaRangeId,
    region.soiltestphosphorousregioncd,
    phosphorousCropGroupRegionCd,
    'soiltestphosphorousrecommendation',
  );

  // Convert from kg/ha to lbs/acre
  return Math.round(
    Number(sTPRecommended.p2o5recommendationkilogramperhectare) *
      conversionFactors.kilogramperhectaretopoundperacreconversion,
  );
}
