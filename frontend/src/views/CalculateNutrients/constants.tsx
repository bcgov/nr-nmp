import { GridColDef } from '@mui/x-data-grid';
import { renderBalanceCell } from './utils';

export type NutrientRow = {
  reqN: number;
  reqP2o5: number;
  reqK2o: number;
};

export const MODAL_BALANCE_COLUMNS: GridColDef[] = [
  {
    field: 'reqN',
    headerName: 'N',
    renderCell: renderBalanceCell('reqN', true),
    flex: 1,
    sortable: false,
    resizable: false,
  },
  {
    field: 'reqP2o5',
    renderHeader: () => (
      <strong>
        <span>P₂O₅</span>
      </strong>
    ),
    renderCell: renderBalanceCell('reqP2o5', true),
    flex: 1,
    sortable: false,
    resizable: false,
  },
  {
    field: 'reqK2o',
    renderHeader: () => (
      <strong>
        <span>K₂O</span>
      </strong>
    ),
    renderCell: renderBalanceCell('reqK2o', true),
    flex: 1,
    sortable: false,
    resizable: false,
  },
];
