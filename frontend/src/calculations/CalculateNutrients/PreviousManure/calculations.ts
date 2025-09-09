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
  url: string;
  urlText: string;
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
    // Return false if frequency is empty or 0
    if (!previousYearManureApplicationFrequency || previousYearManureApplicationFrequency === '0') {
      return false;
    }

    const applications = await getPreviousYearManureApplications();

    // Check if the frequency ID exists in the applications data
    const frequencyExists = applications.some(
      (app) =>
        app.previousyearmanureaplicationfrequency.toString() ===
        previousYearManureApplicationFrequency,
    );

    return frequencyExists;
  } catch (error) {
    console.error('Error checking if manure was added in previous year:', error);
    return false;
  }
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

    // Find the application that matches the field's frequency
    const matchingApplication = applications.find(
      (app) =>
        app.previousyearmanureaplicationfrequency.toString() === prevYearManureApplicationFrequency,
    );

    if (!matchingApplication) {
      return 0;
    }

    // Parse the nitrogen credit array from the string format "{22,30,45}"
    const creditString = matchingApplication.defaultnitrogencredit;
    const creditArray = creditString
      .replace(/[{}]/g, '')
      .split(',')
      .map((val: string) => parseInt(val.trim(), 10));

    // Use the manureApplicationHistory as index into the credit array
    // Ensure the index is within bounds
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
    if (!field) {
      return 0;
    }

    const prevYearManureApplicationFrequency = field.PreviousYearManureApplicationFrequency;

    if (!prevYearManureApplicationFrequency || prevYearManureApplicationFrequency === '0') {
      return 0;
    }

    let largestPrevYearManureVolumeCategory = 0;

    // Check if field has crops
    if (field.Crops && field.Crops.length > 0) {
      // Find the largest manureApplicationHistory among all crops using reduce
      largestPrevYearManureVolumeCategory = field.Crops.reduce((largest, crop) => {
        const volCatCd = crop.manureApplicationHistory || 0;
        return volCatCd > largest ? volCatCd : largest;
      }, 0);

      return await prevYearManureDefaultLookup(
        prevYearManureApplicationFrequency,
        largestPrevYearManureVolumeCategory,
      );
    }

    // No nitrogen credit as there are no crops
    return 0;
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
    const wasAdded = await wasManureAddedInPreviousYear(
      field.PreviousYearManureApplicationFrequency || '0',
    );

    const defaultCredit = await calcPrevYearManureApplDefault(field);

    // Use field's existing nitrogen credit if available, otherwise use calculated default
    const nitrogenCredit = field.PreviousYearManureApplicationNitrogenCredit ?? defaultCredit;

    return {
      fieldName: field.FieldName || 'Unnamed Field',
      display: wasAdded,
      nitrogen: nitrogenCredit,
      url: '/fertilizer-options', // TODO: Update with correct URL when available
      urlText: 'Edit Previous Year Manure',
    };
  } catch (error) {
    console.error('Error calculating previous year manure:', error);
    throw error;
  }
}
