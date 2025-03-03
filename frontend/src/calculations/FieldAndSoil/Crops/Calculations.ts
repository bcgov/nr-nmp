/* eslint-disable eqeqeq */
import axios from 'axios';
import { env } from '@/env';
import NMPFileFieldData from '@/types/NMPFileFieldData';
import NMPFileCropData from '@/types/NMPFileCropData';
import defaultSoilTestData from '@/constants/DefaultSoilTestData';

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
  console.log('HERE: ', response);
  return response;
}

export async function getSTPRecommend(
  stpKelownaRangeId: number,
  soilTestPhosphorousRegionCd: number,
  phosphorousCropGroupRegionCd: number,
) {
  const response = await axios.get(
    `${env.VITE_BACKEND_URL}/api/soiltestphosphorousrecommendations/`,
  );

  const recommendations = response.data.find(
    (stp: any) =>
      stp.SoilTestPhosphorousKelownaRangeId === stpKelownaRangeId &&
      stp.SoilTestPhosphorousRegionCode === soilTestPhosphorousRegionCd &&
      stp.PhosphorousCropGroupRegionCode === phosphorousCropGroupRegionCd,
  );
  return recommendations;
}

export async function getCropRequirementP205(
  field: NMPFileFieldData,
  setFields: (fields: any[]) => void,
  combinedCropData: NMPFileCropData,
  regionId: number,
): Promise<number> {
  const response = await axios.get(`${env.VITE_BACKEND_URL}/api/cropsconversionfactors/`);
  const conversionFactors = response.data[0];
  const region = await getRegion(regionId);

  const updatedField = { ...field };
  if (
    field.SoilTest == undefined ||
    field.SoilTest == null ||
    Object.keys(field.SoilTest).length === 0
  ) {
    updatedField.SoilTest.valNO3H = defaultSoilTestData.valNO3H;
    updatedField.SoilTest.ValP = defaultSoilTestData.ValP;
    updatedField.SoilTest.valK = defaultSoilTestData.valK;
    updatedField.SoilTest.valPH = defaultSoilTestData.valPH;
    updatedField.SoilTest.ConvertedKelownaK = defaultSoilTestData.ConvertedKelownaK;
    updatedField.SoilTest.ConvertedKelownaP = defaultSoilTestData.ConvertedKelownaP;
    setFields([updatedField]);
  }

  // (SOIL TEST Phosphrous)
  let STP = field.SoilTest.ConvertedKelownaP;
  if (STP == '0' || STP == undefined) STP = conversionFactors.defaultsoiltestkelownaphosphorous;

  // (SOIL TEST Potassium)
  let STK = field.SoilTest.ConvertedKelownaK;
  if (STK == '0' || STP == undefined) STK = conversionFactors.defaultsoiltestkelownapotassium;

  const cropSTPRegionCd = await getCropSoilTestPhosphorousRegions(
    combinedCropData.cropId ? Number(combinedCropData.cropId) : 0,
    region[0].soiltestphosphorousregioncd,
  );

  const phosphorousCropGroupRegionCd = cropSTPRegionCd[0].phosphorouscropgroupregioncode;

  const sTPKelownaRange = await getSTPKelownaRangeByPpm(Number(STP));

  const stpKelownaRangeId = sTPKelownaRange.id;

  console.log('HERE: ', stpKelownaRangeId);

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

  // SoilTestPhosphorousRecommendation sTPRecommend = _sd.GetSTPRecommend(stp_kelowna_range_id, region.SoilTestPhosphorousRegionCd, Convert.ToInt16(phosphorous_crop_group_region_cd));
  // crr.P2O5_Requirement = Convert.ToInt32(Convert.ToDecimal(sTPRecommend.P2O5RecommendationKilogramPerHectare) * _cf.KilogramPerHectareToPoundPerAcreConversion);

  // p2o5 recommend calculations
  //   CropSoilTestPhosphorousRegion cropSTPRegionCd = _sd.GetCropSTPRegionCd(cropid, region.SoilTestPhosphorousRegionCd);
  //   int? phosphorous_crop_group_region_cd = cropSTPRegionCd.PhosphorousCropGroupRegionCode;
  //   SoilTestPhosphorousKelownaRange sTPKelownaRange = _sd.GetSTPKelownaRangeByPpm(_STP);
  //   int stp_kelowna_range_id = sTPKelownaRange.Id;

  //   if (phosphorous_crop_group_region_cd == null)
  //       crr.P2O5_Requirement = 0;
  //   else
  //   {
  //       SoilTestPhosphorousRecommendation sTPRecommend = _sd.GetSTPRecommend(stp_kelowna_range_id, region.SoilTestPhosphorousRegionCd, Convert.ToInt16(phosphorous_crop_group_region_cd));
  //       crr.P2O5_Requirement = Convert.ToInt32(Convert.ToDecimal(sTPRecommend.P2O5RecommendationKilogramPerHectare) * _cf.KilogramPerHectareToPoundPerAcreConversion);
  //   }

  //   console.log(conversionFactors);
  //   console.log(region);
  //   console.log(field.SoilTest);
}
