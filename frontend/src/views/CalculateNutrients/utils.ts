import type { CropNutrients } from '@/types';
import type { FertilizerObject, FertilizerUnitObject } from '@/types/Fertilizers';

const initialAgronomicBalance: CropNutrients = { N: 0, P2O5: 0, K2O: 0 };

const calcFertBalance = (
  fert: FertilizerObject,
  applRate: number,
  applUnit: FertilizerUnitObject,
): CropNutrients => {
  let newFertBalance: CropNutrients = initialAgronomicBalance;
  let convertedApplRate = applRate;

  if (!fert) return newFertBalance;

  // Default unit for calc is lb/ac for dry ferts, imp. gall/ac for liquid
  // this will check for units and adjust accordingly
  if (fert.dryliquid.includes('liquid')) {
    convertedApplRate *= applUnit.conversiontoimperialgallonsperacre;
  }

  if (fert.dryliquid.includes('dry')) {
    convertedApplRate *= applUnit.farmrequirednutrientsstdunitsareaconversion;
  }

  newFertBalance = {
    // Fert NPK are percentages, make it so before multiplication
    N: Math.round((fert.nitrogen / 100) * convertedApplRate),
    P2O5: Math.round((fert.phosphorous / 100) * convertedApplRate),
    K2O: Math.round((fert.potassium / 100) * convertedApplRate),
  };

  return newFertBalance;
};

export default calcFertBalance;
