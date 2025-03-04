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

export async function getCropSoilTestPhosphorousRegions(
  cropId: number,
  soilTestPotassiumRegionCode: number,
) {
  const response = await axios.get(
    `${env.VITE_BACKEND_URL}/api/cropsoiltestphosphorousregions/${cropId}/${soilTestPotassiumRegionCode}/`,
  );
  return response.data;
}

export async function getSTPKelownaRangeByPpm(STP: number) {
  const ranges = await axios.get(`${env.VITE_BACKEND_URL}/api/soiltestphosphorouskelonwaranges/`);
  const response = ranges.data.find(
    (range: any) => range.rangelow <= STP && range.rangehigh >= STP,
  );
  return response;
}

export async function getSTPRecommend(
  stpKelownaRangeId: number,
  soilTestPhosphorousRegionCd: number,
  phosphorousCropGroupRegionCd: number,
) {
  const response = await axios.get(
    `${env.VITE_BACKEND_URL}/api/soiltestphosphorousrecommendation/`,
  );

  const recommendations = response.data.find(
    (stp: any) =>
      stp.soiltestphosphorouskelownarangeid === stpKelownaRangeId &&
      stp.soiltestphosphorousregioncode === soilTestPhosphorousRegionCd &&
      stp.phosphorouscropgroupregioncode === phosphorousCropGroupRegionCd,
  );
  return recommendations;
}

export async function getCropRequirementP205(
  field: NMPFileFieldData,
  setFields: (fields: any[]) => void,
  combinedCropData: NMPFileCropData,
  regionId: number,
): Promise<number> {
  const conversionFactors = await getConversionFactors();
  const region = await getRegion(regionId);
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

  // (SOIL TEST Phosphrous)
  let STP = field.SoilTest.convertedKelownaP;
  if (STP == '0' || STP == undefined) STP = conversionFactors.defaultsoiltestkelownaphosphorous;

  // (SOIL TEST Potassium)
  let STK = field.SoilTest.convertedKelownaK;
  if (STK == '0' || STP == undefined) STK = conversionFactors.defaultsoiltestkelownapotassium;

  const cropSTPRegionCd = await getCropSoilTestPhosphorousRegions(
    Number(combinedCropData.cropId),
    region[0].soiltestphosphorousregioncd,
  );

  const phosphorousCropGroupRegionCd = cropSTPRegionCd[0].phosphorouscropgroupregioncode;

  const sTPKelownaRange = await getSTPKelownaRangeByPpm(Number(STP));

  const stpKelownaRangeId = sTPKelownaRange.id;
  if (!phosphorousCropGroupRegionCd == null) {
    return 0;
  }
  const sTPRecommend = await getSTPRecommend(
    stpKelownaRangeId,
    region[0].soiltestphosphorousregioncd,
    phosphorousCropGroupRegionCd,
  );
  return (
    Number(sTPRecommend.p2o5recommendationkilogramperhectare) *
    conversionFactors.kilogramperhectaretopoundperacreconversion
  );
}
