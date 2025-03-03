/* eslint-disable eqeqeq */
import axios from 'axios';
import { env } from '@/env';
import NMPFileFieldData from '@/types/NMPFileFieldData';
import NMPFileCropData from '@/types/NMPFileCropData';

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

export async function getCropRequirementP205(
  field: NMPFileFieldData,
  combinedCropData: NMPFileCropData,
  regionId: number,
): Promise<number> {
  const response = await axios.get(`${env.VITE_BACKEND_URL}/api/cropsconversionfactors/`);
  const conversionFactors = response.data[0];
  const region = await getRegion(regionId);
  console.log('region: ', region[0]);

  //   NEED TO ADD DEFAULT IF NO SOIL TEST
  console.log('combinedCropData: ', combinedCropData);
  // (SOIL TEST Phosphrous)
  let STP = field.SoilTest.ConvertedKelownaP;
  if (STP == '0') STP = conversionFactors.DefaultSoilTestKelownaPhosphorous;

  // (SOIL TEST Potassium)
  let STK = field.SoilTest.ConvertedKelownaK;
  if (STK == '0') STK = conversionFactors.DefaultSoilTestKelownaPotassium;
  console.log('field: ', field);
  const cropSTPRegionCd = await getCropSoilTestPhosphorousRegions(
    combinedCropData.cropId ? Number(combinedCropData.cropId) : 0,
    region[0].soiltestphosphorousregioncd,
  );

  const phosphorousCropGroupRegionCd = cropSTPRegionCd.PhosphorousCropGroupRegionCode;

  console.log('HERE: ', phosphorousCropGroupRegionCd);
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
  return 0;
}
