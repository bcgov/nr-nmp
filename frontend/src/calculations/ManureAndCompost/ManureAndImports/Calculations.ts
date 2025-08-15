import { evaluate } from 'mathjs';
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

export function getDensity(moistureWholePercent: number): number {
  const moisturePercentDecimal = moistureWholePercent / 100;
  if (moistureWholePercent < 40) {
    return 0.27;
  }
  if (moistureWholePercent >= 40 && moistureWholePercent <= 82) {
    const result =
      7.9386 * moisturePercentDecimal ** 3 -
      16.43 * moisturePercentDecimal ** 2 +
      11.993 * moisturePercentDecimal -
      2.3975;
    return result;
  }
  return 0.837;
}

export function getDensityFactoredConversion(density: number, conversionFactor: string): number {
  const parsedExpression = conversionFactor.replace(/density/gi, density.toString());
  const conversion = evaluate(parsedExpression);
  return conversion;
}

export function getDensityFactoredConversionUsingMoisture(
  moistureWholePercent: number,
  conversionFactor: string,
): number {
  const density = getDensity(moistureWholePercent);
  return getDensityFactoredConversion(density, conversionFactor);
}

export async function GetNMineralizations(nMineralizationID: number, region: number) {
  if (!nMineralizationID || !region) {
    return {
      OrganicN_FirstYear: 0,
      OrganicN_LongTerm: 0,
    };
  }

  try {
    const response = await axios.get(
      `${env.VITE_BACKEND_URL}/api/nmineralization/${nMineralizationID}/${region}/`,
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
  region: number | undefined,
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

    // Extract conversion factors with descriptive names
    const potassiumAvailabilityFirstYear = conversionFactors?.potassiumavailabilityfirstyear ?? 0;
    const potassiumAvailabilityLongTerm = conversionFactors?.potassiumavailabilitylongterm ?? 0;
    const potassiumKtoK2OConversion = conversionFactors?.potassiumktok2oconversion ?? 0;
    const phosphorousAvailabilityFirstYear =
      conversionFactors?.phosphorousavailabilityfirstyear ?? 0;
    const phosphorousAvailabilityLongTerm = conversionFactors?.phosphorousavailabilitylongterm ?? 0;
    const phosphorousPtoP2O5Conversion = conversionFactors?.phosphorousptop2o5conversion ?? 0;
    const lbPerTonConversion = conversionFactors?.poundpertonconversion ?? 1;
    const tenThousand = 10000;

    // Get application rate unit conversion factor
    const unitConversionFactor = applicationRateUnit.conversionlbton
      ? applicationRateUnit.conversionlbton
      : 1;

    let adjustedApplicationRate = applicationRate;

    // Adjust application rate for solid manure in cubic yards
    if (
      applicationRateUnit.id === 6 &&
      manureWithNutrients.SolidLiquid &&
      manureWithNutrients.SolidLiquid.toUpperCase() === 'SOLID'
    ) {
      const manureTypeForVolumeConversion = await getManure(manureWithNutrients.ManureId);
      adjustedApplicationRate = applicationRate * manureTypeForVolumeConversion.cubicyardconversion;
    }

    // Calculate potassium first year and long term
    if (manureWithNutrients.K2O !== undefined) {
      nutrientInputs.K2O_FirstYear = Math.round(
        adjustedApplicationRate *
          manureWithNutrients.K2O *
          lbPerTonConversion *
          potassiumKtoK2OConversion *
          potassiumAvailabilityFirstYear *
          unitConversionFactor,
      );
      nutrientInputs.K2O_LongTerm = Math.round(
        adjustedApplicationRate *
          manureWithNutrients.K2O *
          lbPerTonConversion *
          potassiumKtoK2OConversion *
          potassiumAvailabilityLongTerm *
          unitConversionFactor,
      );
    }

    // Calculate phosphorous first year and long term
    if (manureWithNutrients.P2O5 !== undefined) {
      nutrientInputs.P2O5_FirstYear = Math.round(
        adjustedApplicationRate *
          manureWithNutrients.P2O5 *
          lbPerTonConversion *
          phosphorousPtoP2O5Conversion *
          phosphorousAvailabilityFirstYear *
          unitConversionFactor,
      );
      nutrientInputs.P2O5_LongTerm = Math.round(
        adjustedApplicationRate *
          manureWithNutrients.P2O5 *
          lbPerTonConversion *
          phosphorousPtoP2O5Conversion *
          phosphorousAvailabilityLongTerm *
          unitConversionFactor,
      );
    }

    // Calculate nitrogen first year and long term availability
    // Calculate organic nitrogen content (total nitrogen minus ammonium nitrogen)
    const organicNitrogenContent = manureWithNutrients.N - manureWithNutrients.NH4N / tenThousand;

    let organicNMineralizationRates = { OrganicN_FirstYear: 0, OrganicN_LongTerm: 0 };
    if (region !== undefined) {
      organicNMineralizationRates = await GetNMineralizations(
        manureWithNutrients.nMineralizationId || 0,
        region,
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
      applicationRate * nitrogenPerTonFirstYear * unitConversionFactor,
    );

    // Long term nitrogen calculations
    // Calculate mineralized organic nitrogen for long term
    const mineralizedOrganicNLongTerm =
      organicNitrogenContent * organicNMineralizationRates.OrganicN_LongTerm;
    // Total available nitrogen = ammonium + mineralized organic + total nitrogen baseline
    const totalAvailableNLongTerm =
      availableAmmoniumNitrogen + mineralizedOrganicNLongTerm + manureWithNutrients.N / tenThousand;
    const nitrogenPerTonLongTerm = totalAvailableNLongTerm * lbPerTonConversion;
    nutrientInputs.N_LongTerm = Math.round(
      applicationRate * nitrogenPerTonLongTerm * unitConversionFactor,
    );

    return nutrientInputs;
  } catch (error) {
    console.error('Failed to calculate nutrient inputs:', error);
    return nutrientInputs;
  }
}
