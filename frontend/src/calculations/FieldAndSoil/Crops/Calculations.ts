/* eslint-disable eqeqeq */
import axios from 'axios';
import { env } from '@/env';
import { NMPFileFieldData, NMPFileCropData } from '@/types';
import defaultSoilTestData from '@/constants/DefaultSoilTestData';

/**
 * Fetches crop conversion factors from the API
 *
 * @returns {Promise<any>} Conversion factors for calculations
 */
export async function getConversionFactors() {
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

/*
export function checkExistingSoilTest(
  field: NMPFileFieldData,
  setFields: React.Dispatch<React.SetStateAction<NMPFileFieldData[]>>,
) {
  const updatedField = { ...field };
  if (field.SoilTest == null || Object.keys(field.SoilTest).length === 0) {
    updatedField.SoilTest.valNO3H = defaultSoilTestData.valNO3H;
    updatedField.SoilTest.valP = defaultSoilTestData.valP;
    updatedField.SoilTest.valK = defaultSoilTestData.valK;
    updatedField.SoilTest.valPH = defaultSoilTestData.valPH;
    updatedField.SoilTest.convertedKelownaK = defaultSoilTestData.convertedKelownaK;
    updatedField.SoilTest.convertedKelownaP = defaultSoilTestData.convertedKelownaP;
  }
  setFields((prev: NMPFileFieldData[]) => {
    const newFieldList: Array<NMPFileFieldData> = prev.map((fieldEle: NMPFileFieldData) => {
      if (fieldEle.FieldName === updatedField.FieldName) {
        return updatedField;
      }
      return fieldEle;
    });
    return newFieldList;
  });
}
*/

/**
 * Fetches crop data by crop ID
 *
 * @param {number} cropId - ID of the crop to fetch
 * @returns {Promise<any>} Crop data
 */
export async function getCrop(cropId: number) {
  try {
    const response = await axios.get(`${env.VITE_BACKEND_URL}/api/crops/${cropId}/`);
    return response.data[0];
  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
 * Gets nitrogen credit for a previous crop
 *
 * @param {number} cropId - ID of the previous crop
 * @returns {Promise<number>} Nitrogen credit amount in imperial units (0 if no crop ID)
 */
export async function getNCredit(cropId: number) {
  try {
    if (cropId == null || cropId === 0) {
      return 0;
    }
    const response = await axios.get(`${env.VITE_BACKEND_URL}/api/previouscroptypes/${cropId}/`);
    return response.data[0].nitrogencreditimperial;
  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
 * Fetches yield data for a specific crop in a specific region
 *
 * @param {number} cropId - ID of the crop
 * @param {number} regionId - ID of the region
 * @returns {Promise<any>} Crop yield data
 */
export async function getCropYield(cropId: number, regionId: number) {
  try {
    const response = await axios.get(
      `${env.VITE_BACKEND_URL}/api/cropyields/${cropId}/${regionId}/`,
    );
    return response.data[0];
  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
 * Calculates potassium (K2O) removal for a crop
 *
 * @param {NMPFileCropData} combinedCropData - Crop data including yields and specifications
 * @param {number} regionId - ID of the region
 * @returns {Promise<number>} Amount of K2O removed in lbs/acre, rounded to nearest integer
 */
export async function getCropRemovalK20(
  combinedCropData: NMPFileCropData,
  regionId: number,
): Promise<number> {
  const region = await getRegion(regionId);
  const crop = await getCrop(Number(combinedCropData.cropId));
  const cropYield = await getCropYield(Number(combinedCropData.cropId), region.locationid);

  // For cover crops not harvested, there's no removal
  if (crop.croptypeid === 4 && !combinedCropData.coverCropHarvested) {
    return 0;
  }

  let k2oRemoval: number = 0;

  // Calculate removal differently based on crop harvesting method
  if (crop.harvestbushelsperton && crop.harvestbushelsperton > 0) {
    k2oRemoval = (cropYield.amount / crop.harvestbushelsperton) * crop.cropremovalfactork2o;
  } else {
    k2oRemoval = cropYield.amount * crop.cropremovalfactork2o;
  }

  return Math.round(k2oRemoval) || 0;
}

/**
 * Calculates phosphorus (P2O5) removal for a crop
 *
 * @param {NMPFileCropData} combinedCropData - Crop data including yields and specifications
 * @param {number} regionId - ID of the region
 * @returns {Promise<number>} Amount of P2O5 removed in lbs/acre, rounded to nearest integer
 */
export async function getCropRemovalP205(
  combinedCropData: NMPFileCropData,
  regionId: number,
): Promise<number> {
  const region = await getRegion(regionId);
  const crop = await getCrop(Number(combinedCropData.cropId));
  const cropYield = await getCropYield(Number(combinedCropData.cropId), region.locationid);

  // For cover crops not harvested, there's no removal
  if (crop.croptypeid === 4 && !combinedCropData.coverCropHarvested) {
    return 0;
  }

  let p2o5Removal: number = 0;

  // Calculate removal differently based on crop harvesting method
  if (crop.harvestbushelsperton && crop.harvestbushelsperton > 0) {
    p2o5Removal = (cropYield.amount / crop.harvestbushelsperton) * crop.cropremovalfactorp2o5;
  } else {
    p2o5Removal = cropYield.amount * crop.cropremovalfactorp2o5;
  }

  return Math.round(p2o5Removal) || 0;
}

/**
 * Calculates nitrogen removal for a crop
 *
 * @param {NMPFileCropData} combinedCropData - Crop data including yields and specifications
 * @param {number} regionId - ID of the region
 * @returns {Promise<number>} Amount of N removed in lbs/acre, rounded to nearest integer
 */
export async function getCropRemovalN(
  combinedCropData: NMPFileCropData,
  regionId: number,
): Promise<number> {
  let nRemoval: number = 0;
  const region = await getRegion(regionId);
  const crop = await getCrop(Number(combinedCropData.cropId));
  const cropYield = await getCropYield(Number(combinedCropData.cropId), region.locationid);
  const cropType = await getCropType(crop.croptypeid);
  const isForageCrop = cropType.crudeproteinrequired === true;

  // Special calculation for forage crops with crude protein data
  if (isForageCrop) {
    if (!combinedCropData.crudeProtien || combinedCropData.crudeProtien == 0) {
      nRemoval = crop.cropremovalfactornitrogen * cropYield.amount;
    } else {
      const nToProteinConversionFactor = 0.625;
      const unitConversionFactor = 0.5;

      const newCropRemovalFactorNitrogen =
        combinedCropData.crudeProtien / (nToProteinConversionFactor * unitConversionFactor);
      nRemoval = newCropRemovalFactorNitrogen * cropYield.amount;
    }
  } else if (crop.harvestbushelsperton && crop.harvestbushelsperton > 0) {
    nRemoval = (cropYield.amount / crop.harvestbushelsperton) * crop.cropremovalfactornitrogen;
  } else {
    nRemoval = cropYield.amount * crop.cropremovalfactornitrogen;
  }

  return Math.round(nRemoval) || 0;
}

/**
 * Calculates nitrogen requirement for a crop, accounting for previous crop credit
 *
 * @param {NMPFileFieldData} field - Field data including soil test information
 * @param {Function} setFields - Function to update field data
 * @param {NMPFileCropData} combinedCropData - Crop data including yields and specifications
 * @param {number} regionId - ID of the region
 * @returns {Promise<number>} Required N application in lbs/acre, rounded to nearest integer
 */
export async function getCropRequirementN(
  combinedCropData: NMPFileCropData,
  regionId: number,
): Promise<number> {
  const region = await getRegion(regionId);
  const crop = await getCrop(Number(combinedCropData.cropId));
  const ncredit = await getNCredit(Number(combinedCropData.prevCropId));
  const cropYield = await getCropYield(Number(combinedCropData.cropId), region.locationid);

  let nRequirement;
  // Different calculation methods based on nitrogen recommendation ID
  switch (crop.nitrogenrecommendationid) {
    case 1:
      if (crop.nitrogenrecommendationpoundperacre == null) {
        nRequirement = 0;
        break;
      }
      nRequirement = crop.nitrogenrecommendationpoundperacre;
      break;
    case 2:
      if (crop.nitrogenrecommendationpoundperacre == null) {
        nRequirement = 0;
        break;
      }
      nRequirement = crop.nitrogenrecommendationpoundperacre;
      break;
    case 3:
      nRequirement = await getCropRemovalN(combinedCropData, regionId);
      break;
    case 4: {
      if (cropYield?.amount != null && cropYield?.amount !== 0) {
        nRequirement = Math.round(
          (cropYield.amount / cropYield.amount) * crop.nitrogenrecommendationpoundperacre,
        );
      } else {
        nRequirement = 0;
      }
      break;
    }
    default:
      break;
  }
  // Subtract N credit from previous crop and ensure value isn't negative
  nRequirement -= ncredit;
  nRequirement = nRequirement < 0 ? 0 : nRequirement;

  return Math.round(nRequirement);
}

/**
 * Calculates potassium (K2O) requirement based on soil test and crop needs
 *
 * @param {NMPFileFieldData} field - Field data including soil test information
 * @param {Function} setFields - Function to update field data
 * @param {NMPFileCropData} combinedCropData - Crop data including yields and specifications
 * @param {number} regionId - ID of the region
 * @returns {Promise<number>} Required K2O application in lbs/acre, rounded to nearest integer
 */
export async function getCropRequirementK2O(
  field: NMPFileFieldData,
  combinedCropData: NMPFileCropData,
  regionId: number,
): Promise<number> {
  const conversionFactors = await getConversionFactors();
  const region = await getRegion(regionId);

  // Use default if soil test data is missing
  let STK = field.SoilTest?.convertedKelownaK || defaultSoilTestData.convertedKelownaK;
  if (STK == '0' || STK == null) STK = conversionFactors.defaultsoiltestkelownapotassium;

  const cropSTKRegionCd = await getCropSoilTestRegions(
    Number(combinedCropData.cropId),
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
 * @param {NMPFileFieldData} field - Field data including soil test information
 * @param {Function} setFields - Function to update field data
 * @param {NMPFileCropData} combinedCropData - Crop data including yields and specifications
 * @param {number} regionId - ID of the region
 * @returns {Promise<number>} Required P2O5 application in lbs/acre, rounded to nearest integer
 */
export async function getCropRequirementP205(
  field: NMPFileFieldData,
  combinedCropData: NMPFileCropData,
  regionId: number,
): Promise<number> {
  const conversionFactors = await getConversionFactors();
  const region = await getRegion(regionId);

  // Use default if soil test data is missing
  let STP = field.SoilTest?.convertedKelownaP || defaultSoilTestData.convertedKelownaP;
  if (STP == '0' || STP == null) STP = conversionFactors.defaultsoiltestkelownaphosphorous;

  const cropSTPRegionCd = await getCropSoilTestRegions(
    Number(combinedCropData.cropId),
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
