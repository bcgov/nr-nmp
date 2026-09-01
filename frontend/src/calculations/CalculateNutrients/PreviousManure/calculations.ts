import { NMPFileField, PreviousYearManureApplication } from '@/types';

/**
 * Constant for no manure application frequency
 */
export const NO_MANURE_FREQUENCY = '0';

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
 * @param prevYearManureApplicationId - The frequency ID
 * @param manureApplicationHistory - The volume category (ManureApplicationHistory)
 * @param previousManureApplications - The database table of previous manure applications
 * @returns number Default nitrogen credit value
 */
function prevYearManureDefaultLookup(
  prevYearManureApplicationId: number,
  manureApplicationHistory: number,
  previousManureApplications: PreviousYearManureApplication[],
): number {
  const application = previousManureApplications.find(
    (app) => app.previousyearmanureaplicationfrequency === prevYearManureApplicationId,
  );
  if (!application) {
    throw new Error(`No previous year manure application with id ${prevYearManureApplicationId}`);
  }

  const creditsArray = parseNitrogenCreditArray(application.defaultnitrogencredit);
  return creditsArray[manureApplicationHistory];
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
  const id = field.previousYearManureApplicationId;
  if (!id || id === NO_MANURE_FREQUENCY) {
    return 0;
  }
  if (field.crops.length === 0) {
    return prevYearManureDefaultLookup(Number(id), 0, previousManureApplications);
  }

  const highestIndex = Math.max(
    ...field.crops.map((crop) => crop.manureApplicationHistory!),
  );
  return prevYearManureDefaultLookup(Number(id), highestIndex, previousManureApplications);
}
