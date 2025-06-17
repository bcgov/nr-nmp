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

// use in CalculateNutrients.tsx to show icon in balance row only
// and makes crop nutrients display as a negative value
export const renderNutrientCell = (
  balanceType: string,
  findBalanceMessage: (type: string, value: number) => { Icon?: string } | undefined,
) =>
  function renderNutrientCellInner({ value, row }: any) {
    const isBalanceRow = row.index === 'balance';
    const message = isBalanceRow ? findBalanceMessage(balanceType, value) : null;

    return React.createElement(
      'div',
      { style: { display: 'flex', alignItems: 'center' } },
      message?.Icon
        ? [
            React.createElement('img', {
              key: 'icon',
              src: message.Icon,
              alt: 'Balance icon',
              style: { width: '1em', height: '1em', marginRight: '0.5em' },
            }),
            React.createElement('span', { key: 'value' }, -value),
          ]
        : React.createElement('span', { style: { marginLeft: '1.5em' } }, -value),
    );
  };
