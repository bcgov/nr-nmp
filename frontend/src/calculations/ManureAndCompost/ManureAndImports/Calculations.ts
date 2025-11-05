import axios from 'axios';
import { env } from '@/env';
import { Manure, NMPFileNutrientAnalysis, Units } from '@/types';
import { getConversionFactors } from '@/calculations/FieldAndSoil/Crops/Calculations';

export async function getManure(id: number): Promise<Manure> {
  try {
    const response = await axios.get(`${env.VITE_BACKEND_URL}/api/manures/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch manure with id ${id}:`, error);
    throw error;
  }
}

export async function getNMineralizations(nMineralizationID: number, region: number) {
  if (!nMineralizationID || !region) {
    return {
      OrganicN_FirstYear: 0,
      OrganicN_LongTerm: 0,
    };
  }

  try {
    const location = await axios.get(`${env.VITE_BACKEND_URL}/api/regions/${region}`);
    const locationId = location.data[0].locationid;
    const response = await axios.get(
      `${env.VITE_BACKEND_URL}/api/nmineralizations/${nMineralizationID}/${locationId}/`,
    );
    if (!response.data || response.data.length === 0) {
      return {
        OrganicN_FirstYear: 0,
        OrganicN_LongTerm: 0,
      };
    }
    const nMineralization = response.data[0];
    return {
      OrganicN_FirstYear: nMineralization.firstyearvalue,
      OrganicN_LongTerm: nMineralization.longtermvalue,
    };
  } catch (error) {
    console.error(
      `Failed to fetch N mineralizations for ID ${nMineralizationID} and region ${region}:`,
      error,
    );
    return {
      OrganicN_FirstYear: 0,
      OrganicN_LongTerm: 0,
    };
  }
}

export async function getNutrientInputs(
  manureWithNutrients: NMPFileNutrientAnalysis,
  regionId: number | undefined,
  applicationRate: number,
  applicationRateUnit: Units,
  ammoniaNRetentionPct: number = 0,
  organicNAvailable: number = 0,
) {
  // Initialize nutrient input results structure
  const nutrientInputs = {
    N_FirstYear: 0,
    P2O5_FirstYear: 0,
    K2O_FirstYear: 0,
    N_LongTerm: 0,
    P2O5_LongTerm: 0,
    K2O_LongTerm: 0,
  };

  try {
    const conversionFactors = await getConversionFactors();
    if (conversionFactors === null) throw new Error('No conversion factors received.');

    // Extract conversion factors with descriptive names
    const potassiumAvailabilityFirstYear = conversionFactors.potassiumavailabilityfirstyear;
    const potassiumAvailabilityLongTerm = conversionFactors.potassiumavailabilitylongterm;
    const potassiumKtoK2OConversion = conversionFactors.potassiumktok2oconversion;
    const phosphorousAvailabilityFirstYear = conversionFactors.phosphorousavailabilityfirstyear;
    const phosphorousAvailabilityLongTerm = conversionFactors.phosphorousavailabilitylongterm;
    const phosphorousPtoP2O5Conversion = conversionFactors.phosphorousptop2o5conversion;
    const lbPerTonConversion = conversionFactors.poundpertonconversion;
    const tenThousand = 10000;

    // Get application rate unit conversion factor
    const unitConversionFactor = applicationRateUnit.conversionlbton
      ? applicationRateUnit.conversionlbton
      : 1;

    let adjustedApplicationRate = applicationRate;

    // Adjust application rate for solid manure in cubic yards
    if (
      applicationRateUnit.id === 6 &&
      manureWithNutrients.solidLiquid &&
      manureWithNutrients.solidLiquid.toUpperCase() === 'SOLID'
    ) {
      const manureTypeForVolumeConversion = await getManure(manureWithNutrients.manureId);
      adjustedApplicationRate = applicationRate * manureTypeForVolumeConversion.cubicyardconversion;
    }

    // Calculate potassium first year and long term
    nutrientInputs.K2O_FirstYear = Math.round(
      adjustedApplicationRate *
        manureWithNutrients.K *
        lbPerTonConversion *
        potassiumKtoK2OConversion *
        potassiumAvailabilityFirstYear *
        unitConversionFactor,
    );
    nutrientInputs.K2O_LongTerm = Math.round(
      adjustedApplicationRate *
        manureWithNutrients.K *
        lbPerTonConversion *
        potassiumKtoK2OConversion *
        potassiumAvailabilityLongTerm *
        unitConversionFactor,
    );

    // Calculate phosphorous first year and long term
    nutrientInputs.P2O5_FirstYear = Math.round(
      adjustedApplicationRate *
        manureWithNutrients.P *
        lbPerTonConversion *
        phosphorousPtoP2O5Conversion *
        phosphorousAvailabilityFirstYear *
        unitConversionFactor,
    );
    nutrientInputs.P2O5_LongTerm = Math.round(
      adjustedApplicationRate *
        manureWithNutrients.P *
        lbPerTonConversion *
        phosphorousPtoP2O5Conversion *
        phosphorousAvailabilityLongTerm *
        unitConversionFactor,
    );

    // Calculate nitrogen first year and long term availability
    // Calculate organic nitrogen content (total nitrogen minus ammonium nitrogen)
    const organicNitrogenContent = manureWithNutrients.N - manureWithNutrients.NH4N / tenThousand;

    let organicNMineralizationRates = { OrganicN_FirstYear: 0, OrganicN_LongTerm: 0 };
    if (regionId !== undefined) {
      organicNMineralizationRates = await getNMineralizations(
        manureWithNutrients.nMineralizationId || 0,
        regionId,
      );
    }
    // Override first year organic N availability with user-provided value
    organicNMineralizationRates.OrganicN_FirstYear = organicNAvailable / 100;

    // Convert ammonia retention percentage to decimal
    const ammoniaRetentionFactor = ammoniaNRetentionPct / 100;

    // Calculate available ammonium nitrogen after accounting for retention losses
    const availableAmmoniumNitrogen =
      (manureWithNutrients.NH4N / tenThousand) * ammoniaRetentionFactor;

    // First year nitrogen calculations
    // Calculate mineralized organic nitrogen for first year
    const mineralizedOrganicNFirstYear =
      organicNitrogenContent * organicNMineralizationRates.OrganicN_FirstYear;
    // Total available nitrogen = ammonium + mineralized organic + total nitrogen baseline
    const totalAvailableNFirstYear =
      availableAmmoniumNitrogen +
      mineralizedOrganicNFirstYear +
      manureWithNutrients.N / tenThousand;
    const nitrogenPerTonFirstYear = totalAvailableNFirstYear * lbPerTonConversion;
    nutrientInputs.N_FirstYear = Math.round(
      adjustedApplicationRate * nitrogenPerTonFirstYear * unitConversionFactor,
    );

    // Long term nitrogen calculations
    // Calculate mineralized organic nitrogen for long term
    const mineralizedOrganicNLongTerm =
      organicNitrogenContent * organicNMineralizationRates.OrganicN_LongTerm;
    // Total available nitrogen = ammonium + mineralized organic + total nitrogen baseline
    const totalAvailableNLongTerm = availableAmmoniumNitrogen + mineralizedOrganicNLongTerm;
    const nitrogenPerTonLongTerm = totalAvailableNLongTerm * lbPerTonConversion;
    nutrientInputs.N_LongTerm = Math.round(
      adjustedApplicationRate * nitrogenPerTonLongTerm * unitConversionFactor,
    );

    return nutrientInputs;
  } catch (error) {
    console.error('Failed to calculate nutrient inputs:', error);
    return nutrientInputs;
  }
}
