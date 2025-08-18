import { DensityUnit, FertilizerUnit, InjectionUnit } from '@/types';

function getFertilizerUnitImpGallonConversion(unit: FertilizerUnit) {
  switch (unit.id) {
    // Litres per imperial gallon
    case 3:
    case 6:
      return 4.546;
    // US gallons per imperial gallon
    case 5:
      return 1.201;
    case 4: // imperial gallons
      return 1;
    default:
      console.error(`Unrecognized liquid fertilizer unit: ${unit.id}`);
      return 0;
  }
}

/**
 * Product Volume = Application Rate * Field Area
 * @returns Product volume in imperial gallons
 */
function getProductVolumeInImpGallons(
  applicationRate: number,
  applicationUnit: FertilizerUnit,
  areaInAcres: number,
) {
  const appRateInImpGalPerAcre =
    applicationRate * applicationUnit.conversiontoimperialgallonsperacre;
  return appRateInImpGalPerAcre * areaInAcres;
}

/**
 * Product Volume = Application Rate * Field Area
 * @returns Product volume in the liquid unit specified by applicationUnit
 */
export function getProductVolumePerApplication(
  applicationRate: number,
  applicationUnit: FertilizerUnit,
  areaInAcres: number,
) {
  return (
    getProductVolumeInImpGallons(applicationRate, applicationUnit, areaInAcres) *
    getFertilizerUnitImpGallonConversion(applicationUnit)
  );
}

/**
 * Seasonal Product Volume = Product Volume * Applications Per Season
 * @returns Product volume per season in the same unit as productVolume
 */
export function getProductVolumePerSeason(productVolume: number, applicationsPerSeason: number) {
  return productVolume * applicationsPerSeason;
}

/**
 * Application Time = (Application Rate * Field Area) / Injection Rate
 * @returns Time per application in minutes
 */
export function getTimePerApplication(
  applicationRate: number,
  applicationUnit: FertilizerUnit,
  areaInAcres: number,
  injectionRate: number,
  injectionUnit: InjectionUnit,
) {
  const productVolInImpGal = getProductVolumeInImpGallons(
    applicationRate,
    applicationUnit,
    areaInAcres,
  );
  const injectionRateInImpGalPerMin = injectionRate * injectionUnit.conversionToImpGallonsPerMinute;
  return productVolInImpGal / injectionRateInImpGalPerMin;
}

/**
 * Product Weight = Product Volume * Density
 * @returns Product weight in pounds
 */
export function getProductWeightInPounds(
  applicationRate: number,
  applicationUnit: FertilizerUnit,
  areaInAcres: number,
  density: number,
  densityUnit: DensityUnit,
) {
  const productVolInImpGal = getProductVolumeInImpGallons(
    applicationRate,
    applicationUnit,
    areaInAcres,
  );
  const densityInPoundsPerImpGal = density * densityUnit.convfactor;
  return productVolInImpGal * densityInPoundsPerImpGal;
}

/**
 * Applied Nutrient Per Application = (Product Volume * Density) * (Nutrient Percent / 100) / Field Area
 * @returns Applied nutrient per application in pounds per acre (lb/ac)
 */
export function getAppliedNutrientPerApplication(
  weightInPounds: number,
  areaInAcres: number,
  nutrientPercent: number,
) {
  return (weightInPounds * (nutrientPercent / 100)) / areaInAcres;
}

/**
 * Total Applied Nutrient = Applied Nutrient Per Application * Applications Per Season
 * @returns Total applied nutrient in the same unit as appliedNutrient
 */
export function getAppliedNutrientPerSeason(
  appliedNutrient: number,
  applicationsPerSeason: number,
) {
  return appliedNutrient * applicationsPerSeason;
}
