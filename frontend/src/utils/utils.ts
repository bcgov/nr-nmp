import { Fertilizer, NMPFileCropData } from '@/types';

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

export function getSolidManureDisplay(amount: number) {
  const roundedAmount = Math.round(amount);
  return `${roundedAmount} ton${roundedAmount === 1 ? '' : 's'}`;
}

export function getLiquidManureDisplay(amount: number) {
  const roundedAmount = Math.round(amount);
  return `${roundedAmount} U.S. gallon${roundedAmount === 1 ? '' : 's'}`;
}

export const calculateFieldBalances = (
  crops: NMPFileCropData[] | undefined,
  fertilizer: Fertilizer,
) => {
  let fertN = 0;
  let fertP = 0;
  let fertK = 0;
  // calculate available nutrients (agronomic balance + fertilizer)
  crops?.forEach((crop) => {
    fertN += crop.reqN ?? 0;
    fertP += crop.reqP2o5 ?? 0;
    fertK += crop.reqK2o ?? 0;
  });
  if (fertilizer) {
    fertN += fertilizer.nitrogen;
    fertP += fertilizer.phosphorous;
    fertK += fertilizer.potassium;
  }
  const availableNutrients = {
    N: fertN,
    P: fertP,
    K: fertK,
  };
  // Calculate crop removal values
  const cropRemoval =
    crops?.map((crop) => ({
      N: crop?.remN ?? 0,
      P: crop?.remP2o5 ?? 0,
      K: crop?.remK2o ?? 0,
    })) ?? [];
  // Nutrients still required (if negative, set to 0)
  const nutrientsStillRequired = {
    N: Math.max(cropRemoval.reduce((sum, crop) => sum + crop.N, 0) - availableNutrients.N, 0),
    P: Math.max(cropRemoval.reduce((sum, crop) => sum + crop.P, 0) - availableNutrients.P, 0),
    K: Math.max(cropRemoval.reduce((sum, crop) => sum + crop.K, 0) - availableNutrients.K, 0),
  };
  return { availableNutrients, nutrientsStillRequired };
};
