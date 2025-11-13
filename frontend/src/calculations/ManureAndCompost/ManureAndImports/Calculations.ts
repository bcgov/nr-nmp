/**
 * @fileoverview Manure and Compost Nutrient Calculation Module
 *
 * This module calculates available nutrients (N, P2O5, K2O) from manure applications
 * for both first-year and long-term availability. The calculations account for:
 * - Organic nitrogen mineralization rates by region
 * - Ammonia (NH4-N) retention losses
 * - Unit conversions and application rates
 * - Nutrient availability factors specific to crop uptake
 *
 */

import axios from 'axios';
import { env } from '@/env';
import { Manure, NMPFileNutrientAnalysis, Units } from '@/types';
import { getConversionFactors } from '@/calculations/FieldAndSoil/Crops/Calculations';

/**
 * Retrieves manure type information from the database
 *
 * @param {number} id - The unique identifier for the manure type
 * @returns {Promise<Manure>} Complete manure type data including cubic yard conversion factors
 * @throws {Error} If the API request fails or manure type is not found
 */
export async function getManure(id: number): Promise<Manure> {
  try {
    const response = await axios.get(`${env.VITE_BACKEND_URL}/api/manures/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch manure with id ${id}:`, error);
    throw error;
  }
}

/**
 * Retrieves nitrogen mineralization rates for organic matter decomposition
 *
 * @param {number} nMineralizationID - The mineralization profile identifier for the manure type
 * @param {number} region - The geographic region ID
 * @returns {Promise<{OrganicN_FirstYear: number, OrganicN_LongTerm: number}>}
 *          Mineralization rates as decimal fractions (e.g., 0.35 = 35% mineralized)
 *          - OrganicN_FirstYear: Fraction mineralized in the first year after application
 *          - OrganicN_LongTerm: Fraction mineralized in subsequent years (steady-state)
 */
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

/**
 * Calculates plant-available nutrients from manure/compost applications
 *
 * NITROGEN CALCULATION:
 * First Year Available N = (NH4-N × Retention%) + (Organic-N × FirstYearMineralization%) + Baseline
 * Long Term Available N = (NH4-N × Retention%) + (Organic-N × LongTermMineralization%)
 *
 * Where:
 * - NH4-N Retention accounts for ammonia volatilization losses (affected by application method)
 * - Mineralization rates vary by manure type, climate, and time since application
 * - Baseline N accounts for additional N in the total manure composition
 *
 * PHOSPHORUS & POTASSIUM CALCULATION:
 * Available P2O5 or K2O = Application Rate × Nutrient Content × Conversion Factors × Availability Factor
 *
 * Where:
 * - Nutrient content comes from lab or book values (% of dry matter)
 * - Conversion factors account for chemical form differences (e.g., P to P2O5, K to K2O)
 * - Availability factors reflect how much becomes plant-available in first year vs long term
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
 * @returns {Promise<{N_FirstYear, P2O5_FirstYear, K2O_FirstYear, N_LongTerm, P2O5_LongTerm, K2O_LongTerm}>}
 *          All values in lbs/acre, rounded to nearest whole number
 */
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

    // ==================================================================================
    // STEP 1: Extract conversion factors with descriptive names
    // ==================================================================================
    // These factors convert between chemical forms and account for nutrient availability

    // Potassium conversions:
    // - K (elemental potassium) to K2O (potassium oxide) - the standard reporting form
    // - Availability factors account for how much is plant-accessible first year vs long term
    const potassiumAvailabilityFirstYear = conversionFactors.potassiumavailabilityfirstyear;
    const potassiumAvailabilityLongTerm = conversionFactors.potassiumavailabilitylongterm;
    const potassiumKtoK2OConversion = conversionFactors.potassiumktok2oconversion;

    // Phosphorus conversions:
    // - P (elemental phosphorus) to P2O5 (phosphorus pentoxide) - the standard reporting form
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
      const manureTypeForVolumeConversion = await getManure(manureWithNutrients.manureId);
      // Multiply by cubic yard conversion factor to get weight in tons
      adjustedApplicationRate = applicationRate * manureTypeForVolumeConversion.cubicyardconversion;
    }

    // ==================================================================================
    // STEP 3: Calculate Potassium (K2O) - First Year and Long Term
    // ==================================================================================
    // Potassium is relatively mobile and becomes available quickly
    // Formula: App Rate × K Content × lb/ton × K-to-K2O × Availability × Unit Conversion

    nutrientInputs.K2O_FirstYear = Math.round(
      adjustedApplicationRate *
        manureWithNutrients.K * // K content (as fraction, e.g., 0.02 = 2%)
        lbPerTonConversion * // Convert tons to pounds
        potassiumKtoK2OConversion * // Convert K to K2O (multiply by ~1.2)
        potassiumAvailabilityFirstYear * // First year availability (typically 100% = 1.0)
        unitConversionFactor, // Convert application rate units to tons/acre
    );

    nutrientInputs.K2O_LongTerm = Math.round(
      adjustedApplicationRate *
        manureWithNutrients.K *
        lbPerTonConversion *
        potassiumKtoK2OConversion *
        potassiumAvailabilityLongTerm * // Long term availability (typically 100% = 1.0)
        unitConversionFactor,
    );

    // ==================================================================================
    // STEP 4: Calculate Phosphorus (P2O5) - First Year and Long Term
    // ==================================================================================
    // Phosphorus availability is typically lower than K due to soil fixation
    // Formula: App Rate × P Content × lb/ton × P-to-P2O5 × Availability × Unit Conversion

    nutrientInputs.P2O5_FirstYear = Math.round(
      adjustedApplicationRate *
        manureWithNutrients.P * // P content (as fraction)
        lbPerTonConversion *
        phosphorousPtoP2O5Conversion * // Convert P to P2O5 (multiply by ~2.29)
        phosphorousAvailabilityFirstYear * // First year availability (typically 50-70%)
        unitConversionFactor,
    );

    nutrientInputs.P2O5_LongTerm = Math.round(
      adjustedApplicationRate *
        manureWithNutrients.P *
        lbPerTonConversion *
        phosphorousPtoP2O5Conversion *
        phosphorousAvailabilityLongTerm * // Long term availability (typically 100%)
        unitConversionFactor,
    );

    // ==================================================================================
    // STEP 5: Calculate Nitrogen - Most Complex Due to Multiple Forms
    // ==================================================================================

    // STEP 5A: Calculate Organic Nitrogen Content
    // Total N in manure consists of two forms:
    // 1. Ammonium-N (NH4-N): immediately available, measured separately
    // 2. Organic-N: bound in organic matter, must be mineralized
    // Formula: Organic-N = Total N - (NH4-N / 10000)
    const organicNitrogenContent = manureWithNutrients.N - manureWithNutrients.NH4N / tenThousand;

    // STEP 5B: Get Mineralization Rates from Database
    // These rates indicate what fraction of organic-N becomes plant-available
    // Rates depend on manure type, climate zone, and time since application
    let organicNMineralizationRates = { OrganicN_FirstYear: 0, OrganicN_LongTerm: 0 };
    if (regionId !== undefined) {
      organicNMineralizationRates = await getNMineralizations(
        manureWithNutrients.nMineralizationId || 0,
        regionId,
      );
    }

    // STEP 5C: Apply User Override for First Year Organic N Availability
    // Users can adjust based on specific field conditions (e.g., temperature, moisture)
    organicNMineralizationRates.OrganicN_FirstYear = organicNAvailable / 100;

    // STEP 5D: Calculate Ammonia Retention
    // When manure is applied, some NH4-N volatilizes as ammonia gas and is lost
    // Retention % depends on application method:
    // - Injection or incorporation: 80-100% retention
    // - Surface broadcast: 20-50% retention
    const ammoniaRetentionFactor = ammoniaNRetentionPct / 100;

    // STEP 5E: Calculate Available Ammonium Nitrogen
    // Only the retained portion contributes to plant nutrition
    // Formula: (NH4-N / 10000) × Retention Factor
    const availableAmmoniumNitrogen =
      (manureWithNutrients.NH4N / tenThousand) * ammoniaRetentionFactor;

    // ==================================================================================
    // STEP 6: First Year Nitrogen Calculation
    // ==================================================================================
    // Total First Year N = Retained NH4-N + Mineralized Organic-N + Baseline Total N
    // The baseline total N accounts for additional N forms not captured in NH4 or organic

    // Calculate mineralized organic nitrogen for first year
    // This is the portion of organic-N that microbes will convert to plant-available forms
    const mineralizedOrganicNFirstYear =
      organicNitrogenContent * organicNMineralizationRates.OrganicN_FirstYear;

    // Sum all nitrogen sources for first year availability
    const totalAvailableNFirstYear =
      availableAmmoniumNitrogen + // Immediately available NH4-N (minus losses)
      mineralizedOrganicNFirstYear + // Organic-N mineralized in year 1
      manureWithNutrients.N / tenThousand; // Baseline total N

    // Convert to lbs/acre and apply to field area
    const nitrogenPerTonFirstYear = totalAvailableNFirstYear * lbPerTonConversion;
    nutrientInputs.N_FirstYear = Math.round(
      adjustedApplicationRate * nitrogenPerTonFirstYear * unitConversionFactor,
    );

    // ==================================================================================
    // STEP 7: Long Term Nitrogen Calculation
    // ==================================================================================
    // After year 1, no new NH4-N is released (it's all been used or lost)
    // Long term N comes from continued mineralization of remaining organic matter
    // Formula: Long Term N = Retained NH4-N + Mineralized Organic-N (long-term rate)

    // Calculate mineralized organic nitrogen for long term
    // Long-term rates are typically lower, representing steady-state decomposition
    const mineralizedOrganicNLongTerm =
      organicNitrogenContent * organicNMineralizationRates.OrganicN_LongTerm;

    // Total available nitrogen = ammonium + mineralized organic (no baseline added for long term)
    const totalAvailableNLongTerm = availableAmmoniumNitrogen + mineralizedOrganicNLongTerm;

    // Convert to lbs/acre
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
