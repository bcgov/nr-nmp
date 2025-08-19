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

// Conversion functions for dry fertigation
function convertDissolveToLbs(amount: number, fromUnit: number): number {
  switch (fromUnit) {
    case 1: // lbs
      return amount;
    case 2: // kgs
      return amount * 2.20462;
    case 3: // grams
      return amount * 0.00220462;
    default:
      console.error(`Unrecognized dissolve unit: ${fromUnit}`);
      return amount;
  }
}

function convertTankVolumeToImpGallons(volume: number, fromUnit: number): number {
  switch (fromUnit) {
    case 1: // Imperial Gallons
      return volume;
    case 2: // US Gallons
      return volume / 1.20095;
    case 3: // Litres
      return volume / 4.54609;
    default:
      console.error(`Unrecognized tank volume unit: ${fromUnit}`);
      return volume;
  }
}

function convertSolubilityToGramsPerLiter(solubility: number, fromUnit: number): number {
  switch (fromUnit) {
    case 1: // g/L
      return solubility;
    case 2: // kg/L
      return solubility * 1000;
    case 3: // lb/imp. gallon
      return solubility / 9.01;
    default:
      console.error(`Unrecognized solubility unit: ${fromUnit}`);
      return solubility;
  }
}

function convertInjectionRateToImpGallonsPerMin(
  injectionRate: number,
  injectionUnitId: number,
): number {
  switch (injectionUnitId) {
    case 1: // US gallon/min to Imperial Gallon/min
      return injectionRate / 1.20095;
    case 2: // L/min to Imperial Gallon/min
      return injectionRate / 4.54609;
    case 3: // Imperial Gallon/min
      return injectionRate;
    default:
      console.error(`Unrecognized injection rate unit: ${injectionUnitId}`);
      return injectionRate;
  }
}

export interface SolidFertigationResult {
  fertigationTime: number;
  dryAction: 'Soluble' | 'Reduce the amount to dissolve';
  nutrientConcentrationN: number;
  nutrientConcentrationP2O5: number;
  nutrientConcentrationK2O: number;
  kglNutrientConcentrationN: number;
  kglNutrientConcentrationP2O5: number;
  kglNutrientConcentrationK2O: number;
  calcN: number;
  calcP2O5: number;
  calcK2O: number;
  totN: number;
  totP2O5: number;
  totK2O: number;
}

/**
 * Calculates dry/solid fertigation values based on the C# implementation
 */
export function calculateSolidFertigation(
  amountToDissolve: number,
  amountToDissolveUnits: number,
  tankVolume: number,
  tankVolumeUnits: number,
  solInWater: number,
  solInWaterUnits: number,
  injectionRate: number,
  injectionRateUnits: number,
  fieldArea: number,
  eventsPerSeason: number,
  valN: number,
  valP2O5: number,
  valK2O: number,
): SolidFertigationResult {
  // Convert units to standard units for calculations
  const amountToDissolveInLbs = convertDissolveToLbs(amountToDissolve, amountToDissolveUnits);
  const tankVolumeInImpGal = convertTankVolumeToImpGallons(tankVolume, tankVolumeUnits);
  const solInWaterInGramsPerL = convertSolubilityToGramsPerLiter(solInWater, solInWaterUnits);
  const convertedInjectionRate = convertInjectionRateToImpGallonsPerMin(
    injectionRate,
    injectionRateUnits,
  );

  const fertigationTime = Math.round(tankVolumeInImpGal / convertedInjectionRate);

  // Check if the amount to dissolve is soluble
  // Convert amountToDissolve from lbs to kgs and tankVolume from imp gal to litres
  const amountToDissolveInKgs = amountToDissolveInLbs * 0.45359237;
  const tankVolumeInLitres = tankVolumeInImpGal * 4.54609;
  const maxSolubility = (tankVolumeInLitres * solInWaterInGramsPerL) / 1000; // Convert g to kg

  let nutrientConcentrationN = 0;
  let nutrientConcentrationP2O5 = 0;
  let nutrientConcentrationK2O = 0;
  let kglNutrientConcentrationN = 0;
  let kglNutrientConcentrationP2O5 = 0;
  let kglNutrientConcentrationK2O = 0;
  let dryAction: 'Soluble' | 'Reduce the amount to dissolve';

  if (amountToDissolveInKgs <= maxSolubility) {
    dryAction = 'Soluble';

    // Need in lb/us gallon - convert from imperial gallons to US gallons
    const tankVolumeInUSGal = tankVolumeInImpGal * 1.20095;

    nutrientConcentrationN =
      Math.round(((amountToDissolveInLbs * valN) / 100 / tankVolumeInUSGal) * 100) / 100;
    nutrientConcentrationP2O5 =
      Math.round(((amountToDissolveInLbs * valP2O5) / 100 / tankVolumeInUSGal) * 100) / 100;
    nutrientConcentrationK2O =
      Math.round(((amountToDissolveInLbs * valK2O) / 100 / tankVolumeInUSGal) * 100) / 100;

    // kg/L concentrations
    kglNutrientConcentrationN = Math.round((nutrientConcentrationN / 8.3454043) * 100) / 100;
    kglNutrientConcentrationP2O5 = Math.round(nutrientConcentrationP2O5 * 0.119826 * 100) / 100;
    kglNutrientConcentrationK2O = Math.round(nutrientConcentrationK2O * 0.119826 * 100) / 100;
  } else {
    dryAction = 'Reduce the amount to dissolve';
  }

  // Calculate applied nutrients per application
  const calcN =
    Math.round(((nutrientConcentrationN * amountToDissolveInLbs) / fieldArea) * 100) / 100;
  const calcP2O5 =
    Math.round(((nutrientConcentrationP2O5 * amountToDissolveInLbs) / fieldArea) * 100) / 100;
  const calcK2O =
    Math.round(((nutrientConcentrationK2O * amountToDissolveInLbs) / fieldArea) * 100) / 100;

  // Calculate total applied nutrients
  const totN = Math.round(calcN * eventsPerSeason * 100) / 100;
  const totP2O5 = Math.round(calcP2O5 * eventsPerSeason * 100) / 100;
  const totK2O = Math.round(calcK2O * eventsPerSeason * 100) / 100;

  return {
    fertigationTime,
    dryAction,
    nutrientConcentrationN,
    nutrientConcentrationP2O5,
    nutrientConcentrationK2O,
    kglNutrientConcentrationN,
    kglNutrientConcentrationP2O5,
    kglNutrientConcentrationK2O,
    calcN,
    calcP2O5,
    calcK2O,
    totN,
    totP2O5,
    totK2O,
  };
}
