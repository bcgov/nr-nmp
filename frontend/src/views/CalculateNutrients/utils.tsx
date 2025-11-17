import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';
import { GridColDef, GridRenderCellParams, GridRowId } from '@mui/x-data-grid';
import { GridApiCommunity } from '@mui/x-data-grid/internals';
import { css } from '@emotion/react';
import {
  type CropNutrients,
  type Fertilizer,
  type NMPFileField,
  type FertilizerUnit,
  type NMPFileFertigation,
  type CalculateNutrientsRow,
  Schedule,
} from '@/types';
import { tableActionButtonCss } from '../../common.styles';
import { NUTRIENT_MESSAGES } from './nutrientMessages';

const initialAgronomicBalance: CropNutrients = { N: 0, P2O5: 0, K2O: 0 };
const COLUMN_WIDTH: number = 90;
const COLUMN_STYLE = css({
  textAlign: 'center',
  width: `${COLUMN_WIDTH}px`,
});

export const calcFertBalance = (
  fert: Pick<Fertilizer, 'dryliquid' | 'nitrogen' | 'phosphorous' | 'potassium'>,
  applRate: number,
  applUnit: FertilizerUnit,
  conversionFactors: { kgToLb: number; lbPer1000ToAcre: number },
  density?: number,
  densityConvFactor?: number,
): CropNutrients => {
  let newFertBalance: CropNutrients = initialAgronomicBalance;
  let convertedApplRate = applRate;

  if (!fert) return newFertBalance;

  // Default unit for calc is lb/ac for dry ferts, imp. gall/ac for liquid
  // this will check for units and adjust accordingly
  // Liquid fertilizers also get multiplied by their density to convert to lb/ac
  if (fert.dryliquid.includes('liquid')) {
    if (!density || !densityConvFactor)
      throw new Error('Liquid fertilizer missing density or density units');
    convertedApplRate *= applUnit.conversiontoimperialgallonsperacre * density * densityConvFactor;
  }

  if (fert.dryliquid.includes('dry')) {
    switch (applUnit.name) {
      case 'kg/ha':
        convertedApplRate = applRate * conversionFactors.kgToLb;
        break;
      case 'lb/1000ft²':
        convertedApplRate = applRate * conversionFactors.lbPer1000ToAcre;
        break;
      default:
        convertedApplRate = applRate * 1;
    }
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
  tableHeader?: string,
  hideColumnHeaders?: boolean,
  showDeleteButton?: boolean,
): GridColDef[] => [
  {
    field: 'name',
    width: COLUMN_WIDTH * 2,
    minWidth: COLUMN_WIDTH * 2,
    maxWidth: COLUMN_WIDTH * 2.5,
    renderHeader: () => (tableHeader ? <div>{tableHeader}</div> : <div />),
    sortable: false,
  },
  {
    field: 'date',
    width: COLUMN_WIDTH,
    minWidth: COLUMN_WIDTH,
    maxWidth: 100,
    renderHeader: () => <div />,
    sortable: false,
  },
  {
    field: 'reqN',
    width: COLUMN_WIDTH,
    minWidth: COLUMN_WIDTH,
    maxWidth: 100,
    description: 'Nitrogen',
    renderHeader: () => (hideColumnHeaders ? <div /> : <span css={COLUMN_STYLE}>N</span>),
    renderCell,
    sortable: false,
  },
  {
    field: 'reqP2o5',
    width: COLUMN_WIDTH,
    minWidth: COLUMN_WIDTH,
    maxWidth: 100,
    description: 'Phosphorous',
    renderHeader: () => (hideColumnHeaders ? <div /> : <span css={COLUMN_STYLE}>P₂O₅</span>),
    renderCell,
    sortable: false,
  },
  {
    field: 'reqK2o',
    width: COLUMN_WIDTH,
    minWidth: COLUMN_WIDTH,
    maxWidth: 100,
    description: 'Potassium',
    renderHeader: () => (hideColumnHeaders ? <div /> : <span css={COLUMN_STYLE}>K₂O</span>),
    renderCell,
    sortable: false,
  },
  {
    field: 'remN',
    width: COLUMN_WIDTH,
    minWidth: COLUMN_WIDTH,
    maxWidth: 100,
    description: 'Nitrogen',
    renderHeader: () => (hideColumnHeaders ? <div /> : <span css={COLUMN_STYLE}>N</span>),
    renderCell,
    sortable: false,
  },
  {
    field: 'remP2o5',
    width: COLUMN_WIDTH,
    minWidth: COLUMN_WIDTH,
    maxWidth: 100,
    description: 'Phosphorous',
    renderHeader: () => (hideColumnHeaders ? <div /> : <span css={COLUMN_STYLE}>P₂O₅</span>),
    renderCell,
    sortable: false,
  },
  {
    field: 'remK2o',
    width: COLUMN_WIDTH,
    minWidth: COLUMN_WIDTH,
    maxWidth: 130,
    description: 'Potassium',
    renderHeader: () => (hideColumnHeaders ? <div /> : <span css={COLUMN_STYLE}>K₂O</span>),
    renderCell,
    sortable: false,
  },
  {
    field: 'action',
    width: 100,
    renderHeader: () => null,
    renderCell: (row: any) =>
      // If 'action' isn't defined or is 0 (indicating
      // that this is the first row) then show buttons
      // 'action' is only defined for fertigation rows
      !row.value ? (
        <>
          <FontAwesomeIcon
            css={tableActionButtonCss}
            onClick={(e) => {
              handleEditRow(row);
              e.stopPropagation();
            }}
            icon={faEdit}
          />
          {showDeleteButton !== false && (
            <FontAwesomeIcon
              css={tableActionButtonCss}
              onClick={(e) => {
                handleDeleteRow(row);
                e.stopPropagation();
              }}
              icon={faTrash}
            />
          )}
        </>
      ) : (
        <div />
      ),
    sortable: false,
    resizable: false,
  },
];

export function genHandleDeleteRow(
  activeField: number,
  editProp: keyof NMPFileField,
  setFieldList: (value: React.SetStateAction<NMPFileField[]>) => void,
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
    { style: { display: 'flex', alignItems: 'center', justifyContent: 'center' } },
    React.createElement('span', { style: {} }, value),
  );
}

export const findBalanceMessage = (balanceType: string, balanceValue: number) =>
  NUTRIENT_MESSAGES.find((msg) => {
    if (msg.balanceType !== balanceType) return false;

    // either compares balance value to req (agronomic) or rem (crop removal) high low range
    const isReq = balanceType.startsWith('req');
    const low = isReq ? msg.reqBalanceLow : msg.remBalanceLow;
    const high = isReq ? msg.reqBalanceHigh : msg.remBalanceHigh;

    return balanceValue >= low && balanceValue <= high;
  });

export const renderBalanceCell = (balanceType: string, showAsAbs?: boolean) =>
  function renderBalanceCellInner({ value }: any) {
    const message = findBalanceMessage(balanceType, value);

    return React.createElement(
      'div',
      { style: { display: 'flex', alignItems: 'baseline', justifyContent: 'center' } },
      message?.icon
        ? [
            React.createElement('span', { style: { marginLeft: '-1.5em' } }),
            React.createElement('img', {
              key: 'icon',
              src: message.icon,
              alt: 'Balance icon',
              style: { width: '1em', height: '1em', marginRight: '0.5em' },
            }),
            React.createElement(
              'span',
              { key: 'value' },
              showAsAbs ? Math.abs(value as number) : value,
            ),
          ]
        : React.createElement('span', { style: {} }, value),
    );
  };

export const BALANCE_COLUMNS = [
  {
    field: 'name',
    width: 230,
    minWidth: 200,
    maxWidth: 300,
    renderHeader: () => null,
    renderCell: () => <div style={{ fontWeight: 'bold' }}>Balance</div>,
    sortable: false,
  },
  {
    field: 'date',
    width: COLUMN_WIDTH / 2,
    minWidth: COLUMN_WIDTH / 2,
    maxWidth: 100,
    renderHeader: () => <div />,
    sortable: false,
  },
  {
    field: 'reqN',
    width: COLUMN_WIDTH,
    minWidth: COLUMN_WIDTH,
    maxWidth: 100,
    description: 'Nitrogen',
    renderCell: renderBalanceCell('reqN'),
    renderHeader: () => <span css={COLUMN_STYLE}>N</span>,
    sortable: false,
  },
  {
    field: 'reqP2o5',
    width: COLUMN_WIDTH,
    minWidth: COLUMN_WIDTH,
    maxWidth: 100,
    description: 'Phosphorous',
    renderCell: renderBalanceCell('reqP2o5'),
    renderHeader: () => <span css={COLUMN_STYLE}>P₂O₅</span>,
    sortable: false,
  },
  {
    field: 'reqK2o',
    width: COLUMN_WIDTH,
    minWidth: COLUMN_WIDTH,
    maxWidth: 100,
    description: 'Potassium',
    renderCell: renderBalanceCell('reqK2o'),
    sortable: false,
  },
  {
    field: 'remN',
    width: COLUMN_WIDTH,
    minWidth: COLUMN_WIDTH,
    maxWidth: 100,
    description: 'Nitrogen',
    renderCell: renderBalanceCell('remN'),
    sortable: false,
  },
  {
    field: 'remP2o5',
    width: COLUMN_WIDTH,
    minWidth: COLUMN_WIDTH,
    maxWidth: 100,
    description: 'Phosphorous',
    renderCell: renderBalanceCell('remP2o5'),
    sortable: false,
  },
  {
    field: 'remK2o',
    width: COLUMN_WIDTH,
    minWidth: COLUMN_WIDTH,
    maxWidth: 130,
    description: 'Potassium',
    renderCell: renderBalanceCell('remK2o'),
    sortable: false,
  },
  {
    field: '',
    width: 100,
    renderCell: () => null,
    sortable: false,
    resizable: false,
  },
];

export function fertigationToFertigationRows(fertigations: NMPFileFertigation[]) {
  // Instead of making one row per fertigation, there is one row per application
  // An index attr is added to track its spot in the array
  return fertigations.reduce((accRows, fertigation, index) => {
    const nutrientColumns: CalculateNutrientsRow = {
      name: fertigation.name,
      reqN: fertigation.reqN,
      reqP2o5: fertigation.remP2o5,
      reqK2o: fertigation.reqK2o,
      remN: fertigation.remN,
      remP2o5: fertigation.remP2o5,
      remK2o: fertigation.remK2o,
    };

    // Undefined means to jump by a month
    let dayJump;
    switch (fertigation.schedule) {
      case Schedule.Daily:
        dayJump = 1;
        break;
      case Schedule.Weekly:
        dayJump = 7;
        break;
      case Schedule.Biweekly:
        dayJump = 14;
        break;
      default:
        dayJump = undefined;
    }
    const date = new Date(fertigation.startDate!);
    // Javascript Date quirk, need to add a day here
    date.setDate(date.getDate() + 1);
    for (let i = 0; i < fertigation.eventsPerSeason; i += 1) {
      const splitDateStr = date.toDateString().split(' ');
      // Format is like 01 Jan
      accRows.push({
        date: `${splitDateStr[2]} ${splitDateStr[1]}`,
        action: i,
        index,
        ...nutrientColumns,
      });
      if (dayJump) {
        date.setDate(date.getDate() + dayJump);
      } else {
        date.setMonth(date.getMonth() + 1);
      }
    }
    return accRows;
  }, [] as any[]);
}
