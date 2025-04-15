/* eslint-disable default-param-last */
import { defaultNMPFile, defaultNMPFileYear } from '@/constants';
import { AnimalData, PER_DAY_PER_ANIMAL_UNIT, WashWaterUnit } from './types';
import { NMPFile } from '@/types';
import { BeefCattleData, DairyCattleData } from './types';

/**
 * Calculates the solid manure generated by a type of animal in a year, in US tons.
 * @param poundsPerAnimal The coefficient of solid manure per pound per animal per day
 * @param animalsPerFarm The average number of animals on the farm
 * @param daysCollected The number of days manure is collected
 * @param coefficient Optional spot for another coefficient to be multiplied in the calculation
 */
export function calculateAnnualSolidManure(
  poundsPerAnimal: number,
  animalsPerFarm: number,
  daysCollected: number = 365,
  coefficient?: number,
) {
  if (daysCollected > 365 || daysCollected < 0) {
    throw new Error(
      `Invalid number of collection days: can only be 0-365 but received ${daysCollected}`,
    );
  }
  return (poundsPerAnimal * animalsPerFarm * daysCollected * (coefficient || 1)) / 2000; // 1 US ton = 2000 pounds
}

export function getSolidManureDisplay(amount: number) {
  const roundedAmount = Math.round(amount);
  return `${roundedAmount} ton${roundedAmount === 1 ? '' : 's'}`;
}

/**
 * Calculates the liquid manure generated by a type of animal in a year, in US gallons.
 * @param galsPerAnimal The coefficient of liquid manure per gallon per animal per day
 * @param animalsPerFarm The average number of animals on the farm
 * @param daysCollected The number of days manure is collected
 * @param coefficient Optional spot for another coefficient to be multiplied in the calculation
 */
export function calculateAnnualLiquidManure(
  galsPerAnimal: number,
  animalsPerFarm: number,
  daysCollected: number = 365,
  coefficient?: number,
) {
  if (daysCollected > 365 || daysCollected < 0) {
    throw new Error(
      `Invalid number of collection days: can only be 0-365 but received ${daysCollected}`,
    );
  }
  return galsPerAnimal * animalsPerFarm * daysCollected * (coefficient || 1);
}

export function getLiquidManureDisplay(amount: number) {
  const roundedAmount = Math.round(amount);
  return `${roundedAmount} U.S. gallon${roundedAmount === 1 ? '' : 's'}`;
}

/**
 * Calculates the annual wash water (which is treated as a manure) in US gallons.
 * @param washWater The number for wash water entered by the user
 * @param washWaterUnit The unit of the wash water
 * @param animalsPerFarm The average number of animals on the farm
 */
export function calculateAnnualWashWater(
  washWater: number,
  washWaterUnit: WashWaterUnit,
  animalsPerFarm: number,
) {
  return washWater * 365 * (washWaterUnit === PER_DAY_PER_ANIMAL_UNIT ? animalsPerFarm : 1);
}

export const initAnimals = (state: any) => {
  if (state.nmpFile) {
    const parsedData = JSON.parse(state.nmpFile);
    console.log('parsedData from nmp file', parsedData.years[0].FarmAnimals);
    return parsedData.years[0].FarmAnimals;
  }

  const data: Partial<BeefCattleData | DairyCattleData> = {};
  if (data.id === '1') {
    return { id: '1', ...data } as BeefCattleData;
  }
  if (data.id === '2') {
    return { id: '2', breed: '1', grazingDaysPerYear: 0, ...data } as DairyCattleData;
  }

  return [];
};

export const saveAnimalsToFile = (
  FarmAnimals: AnimalData[],
  prevNMPFile: string,
  setNMPFile: (nmpFile: string | ArrayBuffer) => Promise<void>,
) => {
  let nmpFile: NMPFile;
  if (prevNMPFile) nmpFile = JSON.parse(prevNMPFile);
  else {
    nmpFile = { ...defaultNMPFile };
    nmpFile.years.push({ ...defaultNMPFileYear });
  }
  if (nmpFile.years.length > 0 && FarmAnimals.length > 0 && FarmAnimals[0].id !== '0') {
    // Save based on animal type
    switch (FarmAnimals[0].id) {
      // Beef Cattle
      case '1':
        nmpFile.years[0].FarmAnimals = FarmAnimals.map((animal) => {
          if (animal.id === '1') {
            return {
              id: '1',
              subtype: animal.subtype,
              animalsPerFarm: animal.animalsPerFarm,
              daysCollected: animal.daysCollected,
              manureData: animal.manureData,
              date: animal.date,
            };
          }
          return animal;
        });
        break;

      // Dairy Cattle
      case '2':
        nmpFile.years[0].FarmAnimals = FarmAnimals.map((animal) => {
          if (animal.id === '2') {
            // Narrowing the type to DairyCattleData
            return {
              ...animal,
              subtype: animal.subtype, // Safe to access
              breed: animal.breed,
              manureType: animal.manureType,
              grazingDaysPerYear: animal.grazingDaysPerYear,
              animalsPerFarm: animal.animalsPerFarm,
              milkProduction: animal.milkProduction,
              washWater: animal.washWater,
              washWaterUnit: animal.washWaterUnit,
              manureData: animal.manureData,
              date: animal.date,
            };
          }
          return animal;
        });
        break;

      default:
        break;
    }
  }
  setNMPFile(JSON.stringify(nmpFile));
};
