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

export async function getSTPKelownaRangeByPpm(STP: number, endpoint: string) {
  const ranges = await axios.get(`${env.VITE_BACKEND_URL}/api/${endpoint}/`);
  const response = ranges.data.find(
    (range: any) => range.rangelow <= STP && range.rangehigh >= STP,
  );
  return response;
}

export async function getSTPRecommend(
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
  if (
    field.SoilTest == undefined ||
    field.SoilTest == null ||
    Object.keys(field.SoilTest).length === 0
  ) {
    updatedField.SoilTest.valNO3H = defaultSoilTestData.valNO3H;
    updatedField.SoilTest.valP = defaultSoilTestData.valP;
    updatedField.SoilTest.valK = defaultSoilTestData.valK;
    updatedField.SoilTest.valPH = defaultSoilTestData.valPH;
    updatedField.SoilTest.convertedKelownaK = defaultSoilTestData.convertedKelownaK;
    updatedField.SoilTest.convertedKelownaP = defaultSoilTestData.convertedKelownaP;
    setFields([updatedField]);
  }
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

  // (SOIL TEST Potassium)
  let STK = field.SoilTest.convertedKelownaK;
  if (STK == '0' || STK == undefined) STK = conversionFactors.defaultsoiltestkelownapotassium;

  const cropSTKRegionCd = await getCropSoilTestRegions(
    Number(combinedCropData.cropId),
    region[0].soiltestpotassiumregioncd,
    'cropsoilpotassiumregions',
  );

  const potassiumCropGroupRegionCd = cropSTKRegionCd[0].potassiumcropgroupregioncode;

  const sTKKelownaRange = await getSTPKelownaRangeByPpm(
    Number(STK),
    'soiltestpotassiumkelonwaranges',
  );

  const stkKelownaRangeId = sTKKelownaRange.id;
  if (!potassiumCropGroupRegionCd == null) {
    return 0;
  }
  const sTKRecommend = await getSTPRecommend(
    stkKelownaRangeId,
    region[0].soiltestpotassiumregioncd,
    potassiumCropGroupRegionCd,
    'soiltestpotassiumrecommendation',
  );

  return Math.round(
    Number(sTKRecommend.k2orecommendationkilogramperhectare) *
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

  // (SOIL TEST Phosphrous)
  let STP = field.SoilTest.convertedKelownaP;
  if (STP == '0' || STP == undefined) STP = conversionFactors.defaultsoiltestkelownaphosphorous;

  const cropSTPRegionCd = await getCropSoilTestRegions(
    Number(combinedCropData.cropId),
    region[0].soiltestphosphorousregioncd,
    'cropsoiltestphosphorousregions',
  );

  const phosphorousCropGroupRegionCd = cropSTPRegionCd[0].phosphorouscropgroupregioncode;

  const sTPKelownaRange = await getSTPKelownaRangeByPpm(
    Number(STP),
    'soiltestphosphorouskelonwaranges',
  );

  const stpKelownaRangeId = sTPKelownaRange.id;
  if (!phosphorousCropGroupRegionCd == null) {
    return 0;
  }
  const sTPRecommend = await getSTPRecommend(
    stpKelownaRangeId,
    region[0].soiltestphosphorousregioncd,
    phosphorousCropGroupRegionCd,
    'soiltestphosphorousrecommendation',
  );
  return Math.round(
    Number(sTPRecommend.p2o5recommendationkilogramperhectare) *
      conversionFactors.kilogramperhectaretopoundperacreconversion,
  );
}
