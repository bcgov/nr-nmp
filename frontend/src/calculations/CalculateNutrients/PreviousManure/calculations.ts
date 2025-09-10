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
 * Checks if frequency indicates no manure application
 * @param frequency - The frequency value to check
 * @returns boolean True if frequency indicates no manure application
 */
function isNoManureFrequency(frequency: string | undefined): boolean {
  return !frequency || frequency === '0';
}

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
 * @returns Promise<boolean> True if manure was applied in previous year
 */
export async function wasManureAddedInPreviousYear(
  previousYearManureApplicationFrequency: string,
): Promise<boolean> {
  try {
    if (isNoManureFrequency(previousYearManureApplicationFrequency)) {
      return false;
    }

    const applications = await getPreviousYearManureApplications();
    return applications.some(
      (app) =>
        app.previousyearmanureaplicationfrequency.toString() ===
        previousYearManureApplicationFrequency,
    );
  } catch (error) {
    console.error('Error checking if manure was added in previous year:', error);
    return false;
  }
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
    .map((val: string) => parseInt(val.trim(), 10));
}

/**
 * Helper function to get the default nitrogen credit based on frequency and volume category
 * @param prevYearManureApplicationFrequency - The frequency ID
 * @param manureApplicationHistory - The volume category (ManureApplicationHistory)
 * @returns Promise<number> Default nitrogen credit value
 */
async function prevYearManureDefaultLookup(
  prevYearManureApplicationFrequency: string,
  manureApplicationHistory: number,
): Promise<number> {
  try {
    const applications = await getPreviousYearManureApplications();
    const matchingApplication = applications.find(
      (app) =>
        app.previousyearmanureaplicationfrequency.toString() === prevYearManureApplicationFrequency,
    );

    if (!matchingApplication) {
      return 0;
    }

    const creditArray = parseNitrogenCreditArray(matchingApplication.defaultnitrogencredit);
    const index = Math.max(0, Math.min(manureApplicationHistory, creditArray.length - 1));
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
    if (isNoManureFrequency(field.PreviousYearManureApplicationFrequency)) {
      return 0;
    }

    const largestManureHistory = field.Crops.reduce((largest, crop) => {
      const history = crop.manureApplicationHistory || 0;
      return history > largest ? history : largest;
    }, 0);

    return await prevYearManureDefaultLookup(
      field.PreviousYearManureApplicationFrequency!,
      largestManureHistory,
    );
  } catch (error) {
    console.error('Error calculating previous year manure application default:', error);
    return 0;
  }
}

/**
 * Calculates comprehensive previous year manure data for a field
 * @param field - Field data object
 * @returns Promise<PreviousYearManureData> Complete previous year manure data
 */
export async function calculatePrevYearManure(
  field: NMPFileFieldData,
): Promise<PreviousYearManureData> {
  try {
    const frequency = field.PreviousYearManureApplicationFrequency;
    const wasAdded = await wasManureAddedInPreviousYear(frequency);
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
