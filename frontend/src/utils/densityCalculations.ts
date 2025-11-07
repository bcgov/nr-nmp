/**
 * @summary Density calculation utilities
 */
import { evaluate } from 'mathjs';

/**
 * Calculate density factor based on moisture percentage
 *
 * @param moisturePercentage - Moisture percentage (0-100)
 * @returns Density factor
 */
export function getDensityFactor(moisturePercentage: number): number {
  if (moisturePercentage < 40) {
    return 0.27;
  }
  if (moisturePercentage > 82) {
    return 0.837;
  }

  const moistureDecimal = moisturePercentage / 100;
  return (
    7.9386 * moistureDecimal ** 3 - 16.43 * moistureDecimal ** 2 + 11.993 * moistureDecimal - 2.3975
  );
}

/**
 * Evaluate a conversion formula by replacing 'density' with the actual density value
 *
 * @param formula - Formula string containing 'density' variable (e.g., "1*density", "1/density")
 * @param density - Density value to substitute
 * @returns Evaluated conversion factor
 */
export function evaluateConversionFormula(formula: string, density: number): number {
  try {
    // Replace 'density' in the formula with the actual density value (case-insensitive)
    const formulaWithDensity = formula.replace(/density/gi, density.toString());
    return evaluate(formulaWithDensity);
  } catch (error) {
    console.error('Error evaluating conversion formula:', formula, error);
    return 1.0; // Fallback to no conversion
  }
}

/**
 * Calculate density-factored conversion using moisture percentage
 *
 * @param moisturePercentage - Moisture percentage (0-100)
 * @param conversionFormula - Formula string for conversion calculation
 * @returns Calculated conversion factor
 */
export function getDensityFactoredConversionUsingMoisture(
  moisturePercentage: number,
  conversionFormula: string,
): number {
  const density = getDensityFactor(moisturePercentage);
  return evaluateConversionFormula(conversionFormula, density);
}

/**
 *
 * @param manureAmount Total manure in US gallons
 * @param percentSeparation Percent of solid/liquid separation as a whole number
 * @returns A tuple containing the separated liquids in US gallons followed by the separated solids in US tons
 */
export function calculateSeparatedSolidAndLiquid(
  manureAmount: number,
  percentSeparation: number | undefined,
): [number, number] {
  if (percentSeparation === undefined) return [0, 0];

  const solidsSeparatedGallons = manureAmount * (percentSeparation / 100);
  const separatedLiquidsUSGallons = manureAmount - solidsSeparatedGallons;
  const separatedSolidsCubicMeters = solidsSeparatedGallons / 264.172;

  // Converting from cubic meters to tons requires a density calculation
  // For some reason, this is hard-coded
  const moisturePercentage = 70;
  const density = getDensityFactor(moisturePercentage);
  const separatedSolidsTons = 1.30795 * density * separatedSolidsCubicMeters;
  return [separatedLiquidsUSGallons, separatedSolidsTons];
}
