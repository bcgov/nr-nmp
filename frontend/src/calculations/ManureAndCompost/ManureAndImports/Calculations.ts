import {
  CropsConversionFactors,
  Manure,
  NitrogenMineralization,
  NMPFileNutrientAnalysis,
  Units,
} from '@/types';

/**
 * NITROGEN CALCULATION:
 * First Year Available N = (NH4-N × Retention%) + (Organic-N × FirstYearMineralization%) + Baseline
 * Long Term Available N = (NH4-N × Retention%) + (Organic-N × LongTermMineralization%)
 *
 * PHOSPHORUS & POTASSIUM CALCULATION:
 * Available P2O5 or K2O = Application Rate × Nutrient Content × Conversion Factors × Availability Factor
 *
 * UNIT CONVERSIONS:
 * - All calculations work in lbs/acre as the standard unit
 * - Application rates are converted from tons, cubic yards, or gallons as appropriate
 * - Final values are rounded to whole numbers for practical field application
 *
 * @param {NMPFileNutrientAnalysis} manureWithNutrients - Lab or book values for manure composition
 *        including N, P, K, NH4-N, moisture content, and solid/liquid designation
 * @param {number | undefined} regionId - Geographic region affecting mineralization rates
 * @param {number} applicationRate - Amount of manure to apply (value only)
 * @param {Units} applicationRateUnit - Unit definition with conversion factors
 * @param {number} ammoniaNRetentionPct - Percentage of NH4-N retained after application (0-100)
 * @param {number} organicNAvailable - User override for first-year organic N mineralization (0-100)
 *        Allows adjustment from default regional values based on field conditions
 * @returns {N_FirstYear, P2O5_FirstYear, K2O_FirstYear, N_LongTerm, P2O5_LongTerm, K2O_LongTerm}
 *          All values in lbs/acre, rounded to nearest whole number
 */
export default function getNutrientInputs(
  manure: Manure,
  manureWithNutrients: NMPFileNutrientAnalysis,
  nMineralization: NitrogenMineralization | undefined,
  applicationRate: number,
  applicationRateUnit: Units,
  conversionFactors: CropsConversionFactors,
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

  // ==================================================================================
  // STEP 1: Extract conversion factors
  // ==================================================================================

  // Potassium conversions:
  // - K to K2O
  // - Availability factors account for how much is plant-accessible first year vs long term
  const potassiumAvailabilityFirstYear = conversionFactors.potassiumavailabilityfirstyear;
  const potassiumAvailabilityLongTerm = conversionFactors.potassiumavailabilitylongterm;
  const potassiumKtoK2OConversion = conversionFactors.potassiumktok2oconversion;

  // Phosphorus conversions:
  // - P to P2O5
  // - Availability factors are typically lower than K because P binds to soil particles
  const phosphorousAvailabilityFirstYear = conversionFactors.phosphorousavailabilityfirstyear;
  const phosphorousAvailabilityLongTerm = conversionFactors.phosphorousavailabilitylongterm;
  const phosphorousPtoP2O5Conversion = conversionFactors.phosphorousptop2o5conversion;

  // Standard conversion constant: 2000 lbs per ton
  const lbPerTonConversion = conversionFactors.poundpertonconversion;

  // Manure nutrient contents are expressed per 10,000 units (percentage basis)
  const tenThousand = 10000;

  // ==================================================================================
  // STEP 2: Apply unit conversions to get application rate in standard units
  // ==================================================================================

  // Get the unit conversion factor (typically converts to lbs/ton or equivalent)
  const unitConversionFactor = applicationRateUnit.conversionlbton
    ? applicationRateUnit.conversionlbton
    : 1;

  let adjustedApplicationRate = applicationRate;

  // Special handling for solid manure measured in cubic yards:
  // Cubic yards must be converted to weight using manure-specific bulk density
  if (
    applicationRateUnit.id === 6 &&
    manureWithNutrients.solidLiquid &&
    manureWithNutrients.solidLiquid.toUpperCase() === 'SOLID'
  ) {
    // Multiply by cubic yard conversion factor to get weight in tons
    adjustedApplicationRate = applicationRate * manure.cubicyardconversion;
  }

  // ==================================================================================
  // STEP 3: Calculate Potassium (K2O) - First Year and Long Term
  // ==================================================================================
  // Formula: App Rate × K Content × lb/ton × K-to-K2O × Availability × Unit Conversion

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

  // ==================================================================================
  // STEP 4: Calculate Phosphorus (P2O5) - First Year and Long Term
  // ==================================================================================
  // Formula: App Rate × P Content × lb/ton × P-to-P2O5 × Availability × Unit Conversion

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

  // ==================================================================================
  // STEP 5: Calculate Nitrogen
  // ==================================================================================

  // STEP 5A: Calculate Organic Nitrogen Content
  // Formula: Organic-N = Total N - (NH4-N / 10000)
  const organicNitrogenContent = manureWithNutrients.N - manureWithNutrients.NH4N / tenThousand;

  // STEP 5B: Get Mineralization Rates from Database
  let organicNMineralizationRates = { OrganicN_FirstYear: 0, OrganicN_LongTerm: 0 };
  if (nMineralization !== undefined) {
    organicNMineralizationRates = {
      OrganicN_FirstYear: nMineralization.firstyearvalue,
      OrganicN_LongTerm: nMineralization.longtermvalue,
    };
  }

  // STEP 5C: Apply User Override for First Year Organic N Availability
  organicNMineralizationRates.OrganicN_FirstYear = organicNAvailable / 100;

  // STEP 5D: Calculate Ammonia Retention
  const ammoniaRetentionFactor = ammoniaNRetentionPct / 100;

  // STEP 5E: Calculate Available Ammonium Nitrogen
  // Formula: (NH4-N / 10000) × Retention Factor
  const availableAmmoniumNitrogen =
    (manureWithNutrients.NH4N / tenThousand) * ammoniaRetentionFactor;

  // ==================================================================================
  // STEP 6: First Year Nitrogen Calculation
  // ==================================================================================
  // Total First Year N = Retained NH4-N + Mineralized Organic-N + Baseline Total N

  // Calculate mineralized organic nitrogen for first year
  const mineralizedOrganicNFirstYear =
    organicNitrogenContent * organicNMineralizationRates.OrganicN_FirstYear;

  // Sum all nitrogen sources for first year availability
  const totalAvailableNFirstYear =
    availableAmmoniumNitrogen + mineralizedOrganicNFirstYear + manureWithNutrients.N / tenThousand;

  // Convert to lbs/acre and apply to field area
  const nitrogenPerTonFirstYear = totalAvailableNFirstYear * lbPerTonConversion;
  nutrientInputs.N_FirstYear = Math.round(
    adjustedApplicationRate * nitrogenPerTonFirstYear * unitConversionFactor,
  );

  // ==================================================================================
  // STEP 7: Long Term Nitrogen Calculation
  // ==================================================================================
  // Formula: Long Term N = Retained NH4-N + Mineralized Organic-N (long-term rate)

  const mineralizedOrganicNLongTerm =
    organicNitrogenContent * organicNMineralizationRates.OrganicN_LongTerm;

  // Total available nitrogen = ammonium + mineralized organic
  const totalAvailableNLongTerm = availableAmmoniumNitrogen + mineralizedOrganicNLongTerm;

  // Convert to lbs/acre
  const nitrogenPerTonLongTerm = totalAvailableNLongTerm * lbPerTonConversion;
  nutrientInputs.N_LongTerm = Math.round(
    adjustedApplicationRate * nitrogenPerTonLongTerm * unitConversionFactor,
  );

  return nutrientInputs;
}
