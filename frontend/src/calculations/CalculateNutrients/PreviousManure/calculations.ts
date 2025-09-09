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
 * Calculates default previous year manure application nitrogen credit
 * @param field - Field object with manure application history
 * @returns Promise<number> Default nitrogen credit value
 */
export async function calcPrevYearManureApplDefault(field: NMPFileFieldData): Promise<number> {
  try {
    if (
      !field.PreviousYearManureApplicationFrequency ||
      field.PreviousYearManureApplicationFrequency === '0'
    ) {
      return 0;
    }

    const applications = await getPreviousYearManureApplications();

    // Find the application that matches the field's frequency
    const matchingApplication = applications.find(
      (app) =>
        app.previousyearmanureaplicationfrequency.toString() ===
        field.PreviousYearManureApplicationFrequency,
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

    // Return the first value in the array as the default credit
    return creditArray[0] || 0;
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
