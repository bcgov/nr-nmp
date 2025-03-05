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

export async function getCrop(cropId: number) {
  const response = await axios.get(`${env.VITE_BACKEND_URL}/api/crops/${cropId}/`);
  return response.data[0];
}

export async function getNCredit(cropId: number) {
  if (cropId == null || cropId == undefined || cropId == 0) {
    return 0;
  }
  const response = await axios.get(`${env.VITE_BACKEND_URL}/api/previouscroptypes/${cropId}/`);
  return response.data[0].nitrogencreditimperial;
}

export async function getCropYield(cropId: number, regionId: number) {
  const response = await axios.get(`${env.VITE_BACKEND_URL}/api/cropyields/${cropId}/${regionId}/`);
  return response.data[0];
}

export async function getCropRemovalN(
  combinedCropData: NMPFileCropData,
  regionId: number,
): Promise<number> {
  const conversionFactors = await getConversionFactors();
  let nRemoval: number = 0;
  const crop = await getCrop(Number(combinedCropData.cropId));
  const cropYield = await getCropYield(Number(combinedCropData.cropId), regionId);

  if (
    !combinedCropData.crudeProtien ||
    (combinedCropData.crudeProtien && combinedCropData.crudeProtien == 0)
  ) {
    if (cropYield.cropremovalfactornitrogen) {
      nRemoval = crop.cropremovalfactornitrogen * cropYield.amount;
    } else {
      nRemoval = 0;
    }
  } else {
    nRemoval =
      (combinedCropData.crudeProtien /
        (conversionFactors.nitrogenproteinconversion * conversionFactors.unitconversion)) *
      cropYield;
  }
  // if (!crudeProtien.HasValue || crudeProtien.HasValue && crudeProtien.Value == 0)
  //   {
  //       decimal tmpDec;
  //       if (decimal.TryParse(crop.CropRemovalFactorNitrogen.ToString(), out tmpDec))
  //           n_removal = tmpDec * yield;
  //       else
  //           n_removal = 0;
  //   }
  //   else
  //       n_removal = decimal.Divide(Convert.ToDecimal(crudeProtien), _cf.NitrogenProteinConversion * _cf.UnitConversion) * yield;

  //   crr.P2O5_Removal = Convert.ToInt32(crop.CropRemovalFactorP2O5 * yield);
  //   crr.K2O_Removal = Convert.ToInt32(crop.CropRemovalFactorK2O * yield);
  //   crr.N_Removal = Convert.ToInt32(n_removal);

  //   if (coverCropHarvested.HasValue && coverCropHarvested.Value == false)
  //   {
  //       crr.P2O5_Removal = 0;
  //       crr.K2O_Removal = 0;
  //       crr.N_Removal = 0;
  //   }
  return nRemoval || 0;
}

export async function getCropRequirementN(
  field: NMPFileFieldData,
  setFields: (fields: any[]) => void,
  combinedCropData: NMPFileCropData,
  regionId: number,
): Promise<number> {
  // const conversionFactors = await getConversionFactors();
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
    // Finish this case
    case 3:
      if (crop.nitrogenrecommendationpoundperacre == null) {
        nRequirement = 0;
        break;
      }
      // HERE
      nRequirement = crop.nitrogenrecommendationpoundperacre;
      break;
    case 4: {
      if (cropYield?.amount != null && cropYield?.amount != 0) {
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

  // switch (crop.NitrogenRecommendationId)
  // {

  //     case 3:
  //         crr.N_Requirement = crr.N_Removal;
  //         break;
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
    region[0]?.soiltestpotassiumregioncd,
    'cropsoilpotassiumregions',
  );

  const potassiumCropGroupRegionCd = cropSTKRegionCd[0].potassiumcropgroupregioncode;

  const sTKKelownaRange = await getKelownaRangeByPpm(Number(STK), 'soiltestpotassiumkelonwaranges');

  const stkKelownaRangeId = sTKKelownaRange.id;
  if (!potassiumCropGroupRegionCd == null) {
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

  // (SOIL TEST Phosphrous)
  let STP = field.SoilTest.convertedKelownaP;
  if (STP == '0' || STP == undefined) STP = conversionFactors.defaultsoiltestkelownaphosphorous;

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
  if (!phosphorousCropGroupRegionCd == null) {
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
