import axios from 'axios';
import { env } from '@/env';
import { NMPFileFieldData } from '@/types';

export interface PreviousYearManureApplication {
  id: number;
  fieldmanureapplicationhistory: number;
  defaultnitrogencredit: string;
  previousyearmanureaplicationfrequency: number;
}

export interface PreviousYearManureData {
  fieldName: string;
  display: boolean;
  nitrogen: number | null;
}

/**
 * Constant for no manure application frequency
 */
const NO_MANURE_FREQUENCY = 0;

/**
 * Fetches previous year manure applications from the API
 * @returns Promise<PreviousYearManureApplication[]> Array of manure applications
 */
export async function getPreviousYearManureApplications(): Promise<
  PreviousYearManureApplication[]
> {
  try {
    const response = await axios.get(`${env.VITE_BACKEND_URL}/api/previousyearmanureapplications/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching previous year manure applications:', error);
    throw error;
  }
}

/**
 * Checks if manure was added in the previous year based on frequency
 * @param previousYearManureApplicationFrequency - The frequency ID to check
 * @returns boolean True if manure was applied in previous year
 */
export function wasManureAddedInPreviousYear(
  previousYearManureApplicationFrequency: number,
): boolean {
  return previousYearManureApplicationFrequency > NO_MANURE_FREQUENCY;
}

/**
 * Parses nitrogen credit array from string format "{22,30,45}"
 * @param creditString - The credit string in format "{22,30,45}" to parse
 * @returns number[] Array of parsed nitrogen credit numbers
 */
function parseNitrogenCreditArray(creditString: string): number[] {
  return creditString
    .replace(/[{}]/g, '')
    .split(',')
    .map((val) => parseInt(val.trim(), 10));
}

/**
 * Helper function to get the default nitrogen credit based on frequency and volume category
 * @param prevYearManureApplicationFrequency - The frequency ID
 * @param manureApplicationHistory - The volume category (ManureApplicationHistory)
 * @returns Promise<number> Default nitrogen credit value
 */
async function prevYearManureDefaultLookup(
  prevYearManureApplicationFrequency: number,
  manureApplicationHistory: number,
): Promise<number> {
  try {
    const applications = await getPreviousYearManureApplications();
    const matchingApplication = applications.find(
      (app) => app.previousyearmanureaplicationfrequency === prevYearManureApplicationFrequency,
    );

    if (!matchingApplication) {
      return 0;
    }

    const creditArray = parseNitrogenCreditArray(matchingApplication.defaultnitrogencredit);
    const index = Math.min(manureApplicationHistory, creditArray.length - 1);

    return creditArray[index] || 0;
  } catch (error) {
    console.error('Error in prevYearManureDefaultLookup:', error);
    return 0;
  }
}

/**
 * Calculates default previous year manure application nitrogen credit
 * @param field - Field object with manure application history
 * @returns Promise<number> Default nitrogen credit value
 */
export async function calcPrevYearManureApplDefault(field: NMPFileFieldData): Promise<number> {
  try {
    if (
      !field.PreviousYearManureApplicationFrequency ||
      field.PreviousYearManureApplicationFrequency === NO_MANURE_FREQUENCY
    ) {
      return 0;
    }

    const largestManureHistory = Math.max(
      0,
      ...field.Crops.map((crop) => crop.manureApplicationHistory || 0),
    );

    return await prevYearManureDefaultLookup(
      field.PreviousYearManureApplicationFrequency,
      largestManureHistory,
    );
  } catch (error) {
    console.error('Error calculating previous year manure application default:', error);
    return 0;
  }
}

/**
 * Calculates previous year manure data for a field
 * @param field - Field data object
 * @returns Promise<PreviousYearManureData> Complete previous year manure data
 */
export async function calculatePrevYearManure(
  field: NMPFileFieldData,
): Promise<PreviousYearManureData> {
  try {
    const frequency = field.PreviousYearManureApplicationFrequency;
    const wasAdded = wasManureAddedInPreviousYear(frequency);
    const defaultCredit = await calcPrevYearManureApplDefault(field);
    const nitrogenCredit = field.PreviousYearManureApplicationNitrogenCredit ?? defaultCredit;

    return {
      fieldName: field.FieldName,
      display: wasAdded,
      nitrogen: nitrogenCredit,
    };
  } catch (error) {
    console.error('Error calculating previous year manure:', error);
    throw error;
  }
}
