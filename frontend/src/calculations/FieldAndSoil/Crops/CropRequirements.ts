/* eslint-disable eqeqeq */
import axios from 'axios';
import { env } from '@/env';
import NMPFileFieldData from '@/types/NMPFileFieldData';
import NMPFileCropData from '@/types/NMPFileCropData';
import defaultSoilTestData from '@/constants/DefaultSoilTestData';

export async function getConversionFactors() {
  const response = await axios.get(`${env.VITE_BACKEND_URL}/api/cropsconversionfactors/`);
  return response.data[0];
}

export async function getRegion(regionId: number) {
  const response = await axios.get(`${env.VITE_BACKEND_URL}/api/regions/${regionId}/`);
  return response.data;
}

export async function getCropSoilTestRegions(
  cropId: number,
  soilTestPotassiumRegionCode: number,
  endpoint: string,
) {
  const response = await axios.get(
    `${env.VITE_BACKEND_URL}/api/${endpoint}/${cropId}/${soilTestPotassiumRegionCode}/`,
  );
  return response.data;
}

export async function getKelownaRangeByPpm(STP: number, endpoint: string) {
  const ranges = await axios.get(`${env.VITE_BACKEND_URL}/api/${endpoint}/`);
  const response = ranges.data.find(
    (range: any) => range.rangelow <= STP && range.rangehigh >= STP,
  );
  return response;
}

export async function getRecommendations(
  kelownaRangeId: number,
  soilTestRegionCd: number,
  cropGroupRegionCd: number,
  endpoint: string,
) {
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
}

export function checkExistingSoilTest(field: NMPFileFieldData, setFields: (fields: any[]) => void) {
  const updatedField = { ...field };
  if (field.SoilTest == null || Object.keys(field.SoilTest).length === 0) {
    updatedField.SoilTest.valNO3H = defaultSoilTestData.valNO3H;
    updatedField.SoilTest.valP = defaultSoilTestData.valP;
    updatedField.SoilTest.valK = defaultSoilTestData.valK;
    updatedField.SoilTest.valPH = defaultSoilTestData.valPH;
    updatedField.SoilTest.convertedKelownaK = defaultSoilTestData.convertedKelownaK;
    updatedField.SoilTest.convertedKelownaP = defaultSoilTestData.convertedKelownaP;
    setFields([updatedField]);
  }
}

export async function getCrop(cropId: number) {
  const response = await axios.get(`${env.VITE_BACKEND_URL}/api/crops/${cropId}/`);
  return response.data[0];
}

export async function getNCredit(cropId: number) {
  if (cropId == null || cropId === 0) {
    return 0;
  }
  const response = await axios.get(`${env.VITE_BACKEND_URL}/api/previouscroptypes/${cropId}/`);
  return response.data[0].nitrogencreditimperial;
}

export async function getCropYield(cropId: number, regionId: number) {
  const response = await axios.get(`${env.VITE_BACKEND_URL}/api/cropyields/${cropId}/${regionId}/`);
  return response.data[0];
}

export async function getCropRemovalK20(
  combinedCropData: NMPFileCropData,
  regionId: number,
): Promise<number> {
  const region = await getRegion(regionId);
  const crop = await getCrop(Number(combinedCropData.cropId));
  const cropYield = await getCropYield(Number(combinedCropData.cropId), region[0].locationid);

  if (crop.croptypeid === 4 && !combinedCropData.coverCropHarvested) {
    return 0;
  }

  let k2oRemoval: number = 0;

  if (crop.harvestbushelsperton && crop.harvestbushelsperton > 0) {
    k2oRemoval = (cropYield.amount / crop.harvestbushelsperton) * crop.cropremovalfactork2o;
  } else {
    k2oRemoval = cropYield.amount * crop.cropremovalfactork2o;
  }

  return Math.round(k2oRemoval) || 0;
}

export async function getCropRemovalP205(
  combinedCropData: NMPFileCropData,
  regionId: number,
): Promise<number> {
  const region = await getRegion(regionId);
  const crop = await getCrop(Number(combinedCropData.cropId));
  const cropYield = await getCropYield(Number(combinedCropData.cropId), region[0].locationid);

  if (crop.croptypeid === 4 && !combinedCropData.coverCropHarvested) {
    return 0;
  }

  let p2o5Removal: number = 0;

  if (crop.harvestbushelsperton && crop.harvestbushelsperton > 0) {
    p2o5Removal = (cropYield.amount / crop.harvestbushelsperton) * crop.cropremovalfactorp2o5;
  } else {
    p2o5Removal = cropYield.amount * crop.cropremovalfactorp2o5;
  }

  return Math.round(p2o5Removal) || 0;
}

export async function getCropRemovalN(
  combinedCropData: NMPFileCropData,
  regionId: number,
): Promise<number> {
  let nRemoval: number = 0;
  const region = await getRegion(regionId);
  const crop = await getCrop(Number(combinedCropData.cropId));
  const cropYield = await getCropYield(Number(combinedCropData.cropId), region[0].locationid);

  const cropTypeResponse = await axios.get(
    `${env.VITE_BACKEND_URL}/api/croptypes/${crop.croptypeid}/`,
  );
  const cropType = cropTypeResponse.data[0];
  const isForageCrop = cropType.crudeproteinrequired === true;

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

export async function getCropRequirementN(
  field: NMPFileFieldData,
  setFields: (fields: any[]) => void,
  combinedCropData: NMPFileCropData,
  regionId: number,
): Promise<number> {
  const region = await getRegion(regionId);
  const crop = await getCrop(Number(combinedCropData.cropId));
  const ncredit = await getNCredit(Number(combinedCropData.prevCropId));
  const cropYield = await getCropYield(Number(combinedCropData.cropId), region[0].locationid);
  checkExistingSoilTest(field, setFields);

  let nRequirement;
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
  nRequirement -= ncredit;
  nRequirement = nRequirement < 0 ? 0 : nRequirement;

  return Math.round(nRequirement);
}

export async function getCropRequirementK2O(
  field: NMPFileFieldData,
  setFields: (fields: any[]) => void,
  combinedCropData: NMPFileCropData,
  regionId: number,
): Promise<number> {
  const conversionFactors = await getConversionFactors();
  const region = await getRegion(regionId);
  checkExistingSoilTest(field, setFields);

  let STK = field.SoilTest.convertedKelownaK;
  if (STK == '0' || STK == null) STK = conversionFactors.defaultsoiltestkelownapotassium;

  const cropSTKRegionCd = await getCropSoilTestRegions(
    Number(combinedCropData.cropId),
    region[0]?.soiltestpotassiumregioncd,
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
    region[0].soiltestpotassiumregioncd,
    potassiumCropGroupRegionCd,
    'soiltestpotassiumrecommendation',
  );

  return Math.round(
    Number(sTKRecommended.k2orecommendationkilogramperhectare) *
      conversionFactors.kilogramperhectaretopoundperacreconversion,
  );
}

export async function getCropRequirementP205(
  field: NMPFileFieldData,
  setFields: (fields: any[]) => void,
  combinedCropData: NMPFileCropData,
  regionId: number,
): Promise<number> {
  const conversionFactors = await getConversionFactors();
  const region = await getRegion(regionId);

  checkExistingSoilTest(field, setFields);

  let STP = field.SoilTest.convertedKelownaP;
  if (STP == '0' || STP == null) STP = conversionFactors.defaultsoiltestkelownaphosphorous;

  const cropSTPRegionCd = await getCropSoilTestRegions(
    Number(combinedCropData.cropId),
    region[0]?.soiltestphosphorousregioncd,
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
    region[0].soiltestphosphorousregioncd,
    phosphorousCropGroupRegionCd,
    'soiltestphosphorousrecommendation',
  );
  return Math.round(
    Number(sTPRecommended.p2o5recommendationkilogramperhectare) *
      conversionFactors.kilogramperhectaretopoundperacreconversion,
  );
}
