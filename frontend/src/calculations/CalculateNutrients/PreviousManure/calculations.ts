import { NMPFileField, PreviousYearManureApplication } from '@/types';

export interface PreviousYearManureData {
  fieldName: string;
  display: boolean;
  nitrogen?: number;
}

/**
 * Constant for no manure application frequency
 */
const NO_MANURE_FREQUENCY = 0;

/**
 * Checks if manure was added in the previous year based on frequency
 * @param previousYearManureApplicationId - The frequency ID to check
 * @returns boolean True if manure was applied in previous year
 */
export function wasManureAddedInPreviousYear(previousYearManureApplicationId: number): boolean {
  return previousYearManureApplicationId > NO_MANURE_FREQUENCY;
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
 * @param previousManureApplications - The database table of previous manure applications
 * @returns number Default nitrogen credit value
 */
function prevYearManureDefaultLookup(
  prevYearManureApplicationFrequency: number,
  manureApplicationHistory: number,
  previousManureApplications: PreviousYearManureApplication[],
): number {
  try {
    const matchingApplication = previousManureApplications.find(
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
 * @param previousManureApplications - The database table of previous manure applications
 * @returns number Default nitrogen credit value
 */
export function calcPrevYearManureApplDefault(
  field: NMPFileField,
  previousManureApplications: PreviousYearManureApplication[],
): number {
  try {
    if (
      !field.previousYearManureApplicationId ||
      field.previousYearManureApplicationId === NO_MANURE_FREQUENCY
    ) {
      return 0;
    }

    const largestManureHistory = Math.max(
      0,
      ...field.crops.map((crop) => crop.manureApplicationHistory || 0),
    );

    return prevYearManureDefaultLookup(
      field.previousYearManureApplicationId,
      largestManureHistory,
      previousManureApplications,
    );
  } catch (error) {
    console.error('Error calculating previous year manure application default:', error);
    return 0;
  }
}

/**
 * Calculates previous year manure data for a field
 * @param field - Field data object
 * @param previousManureApplications - The database table of previous manure applications
 * @returns PreviousYearManureData Complete previous year manure data
 */
export function calculatePrevYearManure(
  field: NMPFileField,
  previousManureApplications: PreviousYearManureApplication[],
): PreviousYearManureData {
  const frequency = field.previousYearManureApplicationId;
  const wasAdded = wasManureAddedInPreviousYear(frequency);
  const defaultCredit = calcPrevYearManureApplDefault(field, previousManureApplications);
  const nitrogenCredit = field.previousYearManureApplicationNCredit ?? defaultCredit;

  return {
    fieldName: field.fieldName,
    display: wasAdded,
    nitrogen: nitrogenCredit,
  };
}
