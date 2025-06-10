import React from 'react';
import defaultNMPFileYear from '@/constants/DefaultNMPFileYear';
import defaultNMPFile from '@/constants/DefaultNMPFile';
import { NMPFile, NMPFileFarmManureData, NMPFileFieldData } from '@/types';

export const initRegion = (state: any) => {
  if (state.nmpFile) {
    const parsedData: NMPFile = JSON.parse(state.nmpFile);
    return parsedData.farmDetails.FarmRegion;
  }
  return undefined;
};

export const initFields = (state: any) => {
  if (state.nmpFile) {
    const parsedData = JSON.parse(state.nmpFile);
    return parsedData.years[0].Fields;
  }
  return [];
};

export const saveFieldsToFile = (
  fields: NMPFileFieldData[],
  prevNMPFile: string,
  setNMPFile: (nmpFile: string | ArrayBuffer) => Promise<void>,
) => {
  let nmpFile: NMPFile;
  if (prevNMPFile) nmpFile = JSON.parse(prevNMPFile);
  else {
    nmpFile = { ...defaultNMPFile };
    nmpFile.years.push({ ...defaultNMPFileYear });
  }
  if (nmpFile.years.length > 0) {
    nmpFile.years[0].Fields = fields;
  }
  setNMPFile(JSON.stringify(nmpFile));
};

export const saveFarmManuresToFile = (
  manures: NMPFileFarmManureData[],
  prevNMPFile: string,
  setNMPFile: (nmpFile: string | ArrayBuffer) => Promise<void>,
) => {
  let nmpFile: NMPFile | null = null;
  if (prevNMPFile) nmpFile = JSON.parse(prevNMPFile);
  if (nmpFile && nmpFile.years && nmpFile.years.length > 0 && manures.length > 0) {
    nmpFile.years[0].FarmManures = manures.map((manure) => ({
      ...manure,
    }));
  }
  setNMPFile(JSON.stringify(nmpFile));
};

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

// use in CalculateNutrients.tsx to show icon in balance row only
// and makes crop nutrients display as a negative value
export const renderNutrientCell = (
  balanceType: string,
  findBalanceMessage: (type: string, value: number) => { Icon?: string } | undefined,
) =>
  function renderNutrientCellInner({ value, row }: any) {
    const isBalanceRow = row.id === 'balance';
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
            React.createElement('span', { key: 'value' }, value),
          ]
        : React.createElement('span', { style: { marginLeft: '1.5em' } }, -value),
    );
  };
