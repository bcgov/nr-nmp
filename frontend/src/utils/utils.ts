import { DAIRY_COW_ID, MILKING_COW_ID } from '@/constants';
import {
  ManureType,
  NMPFileGeneratedManure,
  NMPFileImportedManure,
  NMPFileManureStorageSystem,
} from '@/types';

export const booleanChecker = (value: any): boolean => {
  if (!value) {
    // value was empty string, false, 0, null, undefined
    return false;
  }
  if (typeof value === 'string' && value.toLowerCase() === 'false') {
    return false;
  }

  return true;
};

// Used in AddAnimals.tsx and ManureAndImports.tsx
export const liquidSolidManureDisplay = (manureObj: { [key: string]: number | string }) => {
  const solid = manureObj?.annualSolidManure ?? 0;
  const liquid = manureObj?.annualLiquidManure ?? 0;
  // for displaying solid and or liquid
  if (solid && liquid) {
    return `${solid} tons/ ${liquid} gal`;
  }
  if (solid) {
    return `${solid} tons`;
  }
  if (liquid) {
    return `${liquid} gal`;
  }
  return '0';
};

/**
 * @param num Number to format
 * @param digits Decimal places to round to (defaults to 0)
 * @returns Formatted number string
 */
export function printNum(num: number, digits: number = 0): string {
  const factor = 10 * digits;
  if (factor > 0) {
    return (Math.round(num * factor) / factor).toLocaleString();
  }
  return Math.round(num).toLocaleString();
}

export function getSolidManureDisplay(amount: number) {
  const rounded = printNum(amount);
  return `${rounded} ton${rounded === '1' ? '' : 's'}`;
}

export function getLiquidManureDisplay(amount: number) {
  const rounded = printNum(amount);
  return `${rounded} U.S. gallon${rounded === '1' ? '' : 's'}`;
}

export const isDairyAndMilkingCattle = (animalId: string, subType: string) =>
  animalId === DAIRY_COW_ID && subType === MILKING_COW_ID;

export const mathSymbolConverter = (input: string) => {
  let newStr = '';
  for (let i = 0; i < input.length; i += 1) {
    const current = input.charAt(i);
    if (current === '≥') newStr = `${newStr}>=`;
    else if (current === '≤') newStr = `${newStr}<=`;
    else newStr = `${newStr + current}`;
  }
  return newStr;
};

/**
 * Calculates the annual amount of manure produced from a given source.
 * @param manureSource The source of a manure, before nutrient analysis
 * @returns The annual amount of manure produced, in tons for solid/dry manure and US gallons for liquid manure
 */
export function getStandardizedAnnualManureAmount(
  manureSource: NMPFileGeneratedManure | NMPFileImportedManure | NMPFileManureStorageSystem,
) {
  if (!manureSource.manureType) {
    throw new Error('getStandardizedAnnualManureAmount called without manureType');
  }

  let total = 0;
  const amountKey =
    manureSource.manureType === ManureType.Liquid
      ? 'annualAmountUSGallonsVolume'
      : 'annualAmountTonsWeight';

  if ('manuresInSystem' in manureSource) {
    if (manureSource.manureType === ManureType.Liquid) {
      // For liquid storage systems
      if (manureSource.hasSeperation) {
        // If there's separation, use separated liquids
        if (manureSource.separatedLiquidsUSGallons > 0) {
          total = manureSource.separatedLiquidsUSGallons + (manureSource.annualPrecipitation || 0);
        } else {
          total = 0;
        }
      } else {
        // No separation - sum all manures in system
        manureSource.manuresInSystem.forEach((manure) => {
          total += manure.data[amountKey]!;
        });
        if (total > 0) {
          total += manureSource.annualPrecipitation || 0;
        }
      }
    } else {
      // For solid storage systems
      manureSource.manuresInSystem.forEach((manure) => {
        total += manure.data[amountKey]!;
      });
      if (total > 0) {
        total += manureSource.annualPrecipitation || 0;
      }
    }
  } else {
    // This is a single manure
    total = manureSource[amountKey]!;
  }
  return total;
}

/**
 * Sums a numerical property in an arbitrary object array
 * @param arr The object array
 * @param prop Property within ALL objects in array
 * @returns Sum of the property's value in array
 */
export function sumPropertyInObjectArr(arr: any[], prop: string) {
  return (
    Math.round(
      arr.reduce((sum, obj) => {
        if (!(prop in obj)) {
          throw new Error(`Property ${prop} not in object: ${JSON.stringify(obj)}`);
        }
        return sum + obj[prop];
      }, 0) * 10,
    ) / 10
  );
}
