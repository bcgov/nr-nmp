/**
 * Service for handling previous year manure calculations and data
 */
import axios from 'axios';
import { env } from '@/env';
import { NMPFileFieldData } from '@/types';

export interface PreviousYearManureData {
  fieldName: string;
  display: boolean;
  nitrogen: number | null;
  url: string;
  urlText: string;
}

export const previousYearManureService = {
  /**
   * Checks if manure was added in the previous year based on frequency
   * @param previousYearManureApplicationFrequency - The frequency ID to check
   * @returns Promise<boolean> True if manure was applied in previous year
   */
  async wasManureAddedInPreviousYear(
    previousYearManureApplicationFrequency: string,
  ): Promise<boolean> {
    try {
      // Return false if frequency is empty or 0
      if (
        !previousYearManureApplicationFrequency ||
        previousYearManureApplicationFrequency === '0'
      ) {
        return false;
      }

      const response = await axios.get(
        `${env.VITE_BACKEND_URL}/api/previousyearmanureapplications/`,
      );

      const applications = response.data;

      // Check if the frequency ID exists in the applications data
      const frequencyExists = applications.some(
        (app: any) =>
          app.previousyearmanureaplicationfrequency.toString() ===
          previousYearManureApplicationFrequency,
      );

      return frequencyExists;
    } catch (error) {
      console.error('Error checking if manure was added in previous year:', error);
      return false;
    }
  },

  /**
   * Calculates default previous year manure application nitrogen credit
   * @param field - Field object with manure application history
   * @returns Promise<number> Default nitrogen credit value
   */
  async calcPrevYearManureApplDefault(field: NMPFileFieldData): Promise<number> {
    try {
      if (
        !field.PreviousYearManureApplicationFrequency ||
        field.PreviousYearManureApplicationFrequency === '0'
      ) {
        return 0;
      }

      const response = await axios.get(
        `${env.VITE_BACKEND_URL}/api/previousyearmanureapplications/`,
      );

      const applications = response.data;

      // Find the application that matches the field's frequency
      const matchingApplication = applications.find(
        (app: any) =>
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
      // In the C# code, this might depend on specific conditions
      return creditArray[0] || 0;
    } catch (error) {
      console.error('Error calculating default previous year manure nitrogen credit:', error);
      return 0;
    }
  },

  /**
   * Calculates previous year manure data for a field
   * @param field - Field data
   * @returns Promise<PreviousYearManureData> Previous year manure data
   */
  async calculatePrevYearManure(field: NMPFileFieldData): Promise<PreviousYearManureData> {
    const result: PreviousYearManureData = {
      fieldName: field.FieldName,
      display: false,
      nitrogen: null,
      url: '',
      urlText: '',
    };

    try {
      // Check if field has crops
      if (!field.Crops || field.Crops.length === 0) {
        return result;
      }

      // Check if manure was added in previous year
      const manureWasAdded = await this.wasManureAddedInPreviousYear(
        field.PreviousYearManureApplicationFrequency,
      );

      if (manureWasAdded) {
        result.display = true;

        // Use existing nitrogen credit if available, otherwise calculate default
        if (field.PreviousYearManureApplicationNitrogenCredit != null) {
          result.nitrogen = field.PreviousYearManureApplicationNitrogenCredit;
        } else {
          result.nitrogen = await this.calcPrevYearManureApplDefault(field);
        }
      }

      return result;
    } catch (error) {
      console.error('Error calculating previous year manure:', error);
      return result;
    }
  },
};
