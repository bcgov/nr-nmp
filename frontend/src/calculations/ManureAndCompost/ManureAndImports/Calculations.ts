import { evaluate } from 'mathjs';
import axios from 'axios';
import { env } from '@/env';
import { NMPFileFarmManureData, Region } from '@/types';
import { getConversionFactors } from '@/calculations/FieldAndSoil/Crops/Calculations';

export function getManure(id: number): Promise<any> {
  return axios.get(`${env.VITE_BACKEND_URL}/api/manures/${id}`).then((response) => response.data);
}

export function getUnits(): Promise<any> {
  return axios.get(`${env.VITE_BACKEND_URL}/api/units/`).then((response) => response.data);
}

export async function getUnitByName(unitName: string | undefined): Promise<any> {
  const units = await getUnits();
  return units.find((unit: any) => unit.name === unitName);
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

export async function getNutrientInputs(
  farmManure: NMPFileFarmManureData | undefined,
  region: Region | undefined,
  applicationRate: number,
  applicationRateUnit: string | undefined,
  ammoniaNRetentionPct: number | undefined,
  organicNAvailable: number | undefined,
) {
  const nutrientInputs = {
    N_FirstYear: 0,
    P2O5_FirstYear: 0,
    K2O_FirstYear: 0,
    N_LongTerm: 0,
    P2O5_LongTerm: 0,
    K2O_LongTerm: 0,
  };

  const conversionFactors = await getConversionFactors();

  const potassiumAvailabilityFirstYear = conversionFactors.potassiumavailabilityfirstyear;
  const potassiumAvailabilityLongTerm = conversionFactors.potassiumavailabilitylongterm;
  const potassiumKtoK2Oconversion = conversionFactors.potassiumktok2oconversion;
  const phosphorousAvailabilityFirstYear = conversionFactors.phosphorousavailabilityfirstyear;
  const phosphorousAvailabilityLongTerm = conversionFactors.phosphorousavailabilitylongterm;
  const phosphorousPtoP2O5Kconversion = conversionFactors.phosphorousptop2o5conversion;
  const lbPerTonConversion = conversionFactors.poundpertonconversion;
  const tenThousand = 10000;
  const unit = await getUnitByName(applicationRateUnit);
  const conversion = unit && unit.ConversionlbTon ? unit.ConversionlbTon : 1; // Default to 1 if conversion is not defined

  let adjustedApplicationRate = applicationRate;

  if (
    unit.Id === 6 &&
    farmManure &&
    farmManure.Nutrients.SolidLiquid &&
    farmManure.Nutrients.SolidLiquid.toUpperCase() === 'SOLID'
  ) {
    const manure = await getManure(farmManure.Nutrients.ManureId);
    adjustedApplicationRate = applicationRate * manure.CubicYardConversion;
  }

  // get potassium first year
  if (farmManure && farmManure.Nutrients.K2O !== undefined) {
    nutrientInputs.K2O_FirstYear = Math.floor(
      adjustedApplicationRate *
        farmManure.Nutrients.K2O *
        lbPerTonConversion *
        potassiumKtoK2Oconversion *
        potassiumAvailabilityFirstYear *
        conversion,
    );
  }

  // get potassium long term
  if (farmManure && farmManure.Nutrients.K2O !== undefined) {
    nutrientInputs.K2O_LongTerm = Math.floor(
      adjustedApplicationRate *
        farmManure.Nutrients.K2O *
        lbPerTonConversion *
        potassiumKtoK2Oconversion *
        potassiumAvailabilityLongTerm *
        conversion,
    );
  }

  // get phosphorous first year
  if (farmManure && farmManure.Nutrients.P2O5 !== undefined) {
    nutrientInputs.P2O5_FirstYear = Math.floor(
      adjustedApplicationRate *
        farmManure.Nutrients.P2O5 *
        lbPerTonConversion *
        phosphorousPtoP2O5Kconversion *
        phosphorousAvailabilityFirstYear *
        conversion,
    );
  }

  // get phosphorous long term
  if (farmManure && farmManure.Nutrients.P2O5 !== undefined) {
    nutrientInputs.P2O5_LongTerm = Math.floor(
      adjustedApplicationRate *
        farmManure.Nutrients.P2O5 *
        lbPerTonConversion *
        phosphorousPtoP2O5Kconversion *
        phosphorousAvailabilityLongTerm *
        conversion,
    );
  }

  // get nitrogen first year
  const organicN =
    Number(farmManure?.Nutrients.N || 0) - Number(farmManure?.Nutrients.NH4N || 0) / tenThousand;

  return nutrientInputs;
}
