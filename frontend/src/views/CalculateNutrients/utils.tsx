import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';
import { GridColDef, GridRowId } from '@mui/x-data-grid';
import { GridApiCommunity } from '@mui/x-data-grid/internals';
import type {
  CropNutrients,
  Fertilizer,
  NMPFileFieldData,
  NMPFileYear,
  FertilizerUnit,
} from '@/types';
import { tableActionButtonCss } from '../../common.styles';
import { NUTRIENT_MESSAGES } from './nutrientMessages';

const initialAgronomicBalance: CropNutrients = { N: 0, P2O5: 0, K2O: 0 };

export const calcFertBalance = (
  fert: Fertilizer,
  applRate: number,
  applUnit: FertilizerUnit,
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

/*
function propToHeader(prop: keyof NMPFileFieldData | keyof NMPFileYear): string {
  switch (prop) {
    case 'Crops':
      return 'Crop';
    case 'Fertilizers':
      return 'Fertilizer';
    case 'OtherNutrients':
      return 'Nutrient Source';
    default:
      throw new Error('Unexpected string');
  }
}
*/

function renderNutrientCell({ value }: any) {
  return React.createElement(
    'div',
    { style: { display: 'flex', alignItems: 'center' } },
    React.createElement('span', { style: { marginLeft: '1.5em' } }, -value),
  );
}

export const generateColumns = (
  handleEditRow: (e: any) => void,
  handleDeleteRow: (e: any) => void,
): GridColDef[] => [
  { field: 'name', width: 230, minWidth: 200, maxWidth: 300 },
  {
    field: 'reqN',
    width: 80,
    minWidth: 80,
    maxWidth: 100,
    description: 'Nitrogen',
    renderCell: renderNutrientCell,
  },
  {
    field: 'reqP2o5',
    width: 80,
    minWidth: 80,
    maxWidth: 100,
    description: 'Phosphorous',
    renderCell: renderNutrientCell,
  },
  {
    field: 'reqK2o',
    width: 120,
    minWidth: 120,
    maxWidth: 100,
    description: 'Potassium',
    renderCell: renderNutrientCell,
  },
  {
    field: 'remN',
    width: 80,
    minWidth: 80,
    maxWidth: 100,
    description: 'Nitrogen',
    renderCell: renderNutrientCell,
  },
  {
    field: 'remP2o5',
    width: 80,
    minWidth: 80,
    maxWidth: 100,
    description: 'Phosphorous',
    renderCell: renderNutrientCell,
  },
  {
    field: 'remK2o',
    width: 130,
    minWidth: 60,
    maxWidth: 130,
    description: 'Potassium',
    renderCell: renderNutrientCell,
  },
  {
    field: '',
    width: 100,
    renderCell: (row: any) => {
      // If balance row don't show actions
      const isBalanceRow = row.row.name === 'Balance';
      return !isBalanceRow ? (
        <>
          <FontAwesomeIcon
            css={tableActionButtonCss}
            onClick={() => handleEditRow(row)}
            icon={faEdit}
          />
          <FontAwesomeIcon
            css={tableActionButtonCss}
            onClick={() => handleDeleteRow(row)}
            icon={faTrash}
          />
        </>
      ) : null;
    },
    sortable: false,
    resizable: false,
  },
];

export function genHandleDeleteRow(
  activeField: number,
  editProp: keyof NMPFileFieldData,
  setFieldList: (value: React.SetStateAction<NMPFileFieldData[]>) => void,
) {
  const handleDeleteRow = (e: { id: GridRowId; api: GridApiCommunity }) => {
    setFieldList((prev) => {
      const index = e.api.getRowIndexRelativeToVisibleRows(e.id);
      const nextPropArray = prev[activeField][editProp] as any[];
      nextPropArray.splice(index, 1);
      return {
        ...prev,
        [editProp]: nextPropArray,
      };
    });
  };
  return handleDeleteRow;
}

export const findBalanceMessage = (balanceType: string, balanceValue: number) =>
  NUTRIENT_MESSAGES.find((msg) => {
    if (msg.BalanceType !== balanceType) return false;

    // either compares balance value to req (agronomic) or rem (crop removal) high low range
    const isReq = balanceType.startsWith('req');
    const low = isReq ? msg.ReqBalanceLow : msg.RemBalanceLow;
    const high = isReq ? msg.ReqBalanceHigh : msg.RemBalanceHigh;

    return balanceValue >= low && balanceValue <= high;
  });

export function renderBalanceCell({ value }: any) {
  return React.createElement(
    'div',
    { style: { display: 'flex', alignItems: 'center' } },
    React.createElement('span', { style: { marginLeft: '1.5em' } }, -value),
  );
}

/*
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
*/
