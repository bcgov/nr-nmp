import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { CalculateNutrientsColumn } from '@/types';
import { PreviousYearManureData } from '@/services/previousYearManureService';
import { generateColumns, renderNutrientCell } from '../utils';

interface PreviousYearManureRowProps {
  data: PreviousYearManureData;
  customTableStyle: any;
  customCalcTableStyle: any;
  onEdit: () => void;
}

function PreviousYearManureRow({
  data,
  customTableStyle,
  customCalcTableStyle,
  onEdit,
}: PreviousYearManureRowProps) {
  if (!data.display) {
    return null;
  }

  // Create a row that matches the CalculateNutrientsColumn structure
  const previousYearManureRow: CalculateNutrientsColumn = {
    name: "Previous Year's Manure",
    reqN: data.nitrogen || 0,
    reqP2o5: 0,
    reqK2o: 0,
    remN: 0,
    remP2o5: 0,
    remK2o: 0,
  };

  // Create columns with edit functionality
  const handleEditRow = () => {
    onEdit();
  };

  const previousYearManureColumns: GridColDef[] = generateColumns(
    handleEditRow,
    () => {}, // No delete functionality for previous year manure
    renderNutrientCell,
    "Previous Year's Manure",
    false, // No delete button
  );

  return (
    <DataGrid
      sx={{ ...customTableStyle, ...customCalcTableStyle }}
      rows={[previousYearManureRow]}
      columns={previousYearManureColumns}
      getRowId={() => crypto.randomUUID()}
      disableRowSelectionOnClick
      disableColumnMenu
      columnHeaderHeight={16}
      hideFooterPagination
      hideFooter
    />
  );
}

export default PreviousYearManureRow;
