import React from 'react';

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
