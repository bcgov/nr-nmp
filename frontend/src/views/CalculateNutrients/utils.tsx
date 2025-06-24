import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';
import { GridColDef, GridRenderCellParams, GridRowId } from '@mui/x-data-grid';
import { GridApiCommunity } from '@mui/x-data-grid/internals';
import type { CropNutrients, Fertilizer, NMPFileFieldData, FertilizerUnit } from '@/types';
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

export const generateColumns = (
  handleEditRow: (e: any) => void,
  handleDeleteRow: (e: any) => void,
  renderCell: (params: GridRenderCellParams<any, any, any>) => React.ReactNode,
): GridColDef[] => [
  { field: 'name', width: 230, minWidth: 200, maxWidth: 300 },
  {
    field: 'reqN',
    width: 80,
    minWidth: 80,
    maxWidth: 100,
    description: 'Nitrogen',
    renderCell,
  },
  {
    field: 'reqP2o5',
    width: 80,
    minWidth: 80,
    maxWidth: 100,
    description: 'Phosphorous',
    renderCell,
  },
  {
    field: 'reqK2o',
    width: 120,
    minWidth: 120,
    maxWidth: 100,
    description: 'Potassium',
    renderCell,
  },
  {
    field: 'remN',
    width: 80,
    minWidth: 80,
    maxWidth: 100,
    description: 'Nitrogen',
    renderCell,
  },
  {
    field: 'remP2o5',
    width: 80,
    minWidth: 80,
    maxWidth: 100,
    description: 'Phosphorous',
    renderCell,
  },
  {
    field: 'remK2o',
    width: 130,
    minWidth: 60,
    maxWidth: 130,
    description: 'Potassium',
    renderCell,
  },
  {
    field: '',
    width: 100,
    renderCell: (row: any) => (
      <>
        <FontAwesomeIcon
          css={tableActionButtonCss}
          onClick={(e) => {
            handleEditRow(row);
            e.stopPropagation();
          }}
          icon={faEdit}
        />
        <FontAwesomeIcon
          css={tableActionButtonCss}
          onClick={(e) => {
            handleDeleteRow(row);
            e.stopPropagation();
          }}
          icon={faTrash}
        />
      </>
    ),
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
      const propArray = [...(prev[activeField][editProp] as any[])]; // typecast antics
      propArray.splice(index, 1);
      const nextFieldArray = [...prev];
      nextFieldArray[activeField][editProp] = propArray as never; // typecast antics pt 2
      return nextFieldArray;
    });
  };
  return handleDeleteRow;
}

export function renderNutrientCell({ value }: any) {
  return React.createElement(
    'div',
    { style: { display: 'flex', alignItems: 'center' } },
    React.createElement('span', { style: { marginLeft: '1.5em' } }, value),
  );
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

const renderBalanceCell = (balanceType: string) =>
  function renderBalanceCellInner({ value }: any) {
    const message = findBalanceMessage(balanceType, value);

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
        : React.createElement('span', { style: { marginLeft: '1.5em' } }, value),
    );
  };

export const BALANCE_COLUMNS = [
  { field: 'name', width: 230, minWidth: 200, maxWidth: 300 },
  {
    field: 'reqN',
    width: 80,
    minWidth: 80,
    maxWidth: 100,
    description: 'Nitrogen',
    renderCell: renderBalanceCell('reqN'),
  },
  {
    field: 'reqP2o5',
    width: 80,
    minWidth: 80,
    maxWidth: 100,
    description: 'Phosphorous',
    renderCell: renderBalanceCell('reqP2o5'),
  },
  {
    field: 'reqK2o',
    width: 120,
    minWidth: 120,
    maxWidth: 100,
    description: 'Potassium',
    renderCell: renderBalanceCell('reqK2o'),
  },
  {
    field: 'remN',
    width: 80,
    minWidth: 80,
    maxWidth: 100,
    description: 'Nitrogen',
    renderCell: renderBalanceCell('remN'),
  },
  {
    field: 'remP2o5',
    width: 80,
    minWidth: 80,
    maxWidth: 100,
    description: 'Phosphorous',
    renderCell: renderBalanceCell('remP2o5'),
  },
  {
    field: 'remK2o',
    width: 130,
    minWidth: 60,
    maxWidth: 130,
    description: 'Potassium',
    renderCell: renderBalanceCell('remK2o'),
  },
  {
    field: '',
    width: 100,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    renderCell: (_row: any) => null,
    sortable: false,
    resizable: false,
  },
];
