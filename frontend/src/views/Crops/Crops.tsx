/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eqeqeq */
/**
 * @summary This is the Crops Tab component for managing crop data for fields
 * @description Allows users to view, add, edit and delete crops associated with fields
 * Provides functionality to calculate nutrient requirements and removals
 */
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Button, ButtonGroup } from '@bcgov/design-system-react-components';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import useAppState from '@/hooks/useAppState';
import { AppTitle, PageTitle, ProgressStepper, TabsMaterial } from '../../components/common';
import { StyledContent } from './crops.styles';
import { NMPFileFieldData } from '@/types';
import { CALCULATE_NUTRIENTS, FARM_INFORMATION, SOIL_TESTS } from '@/constants/routes';
import { customTableStyle, tableActionButtonCss } from '../../common.styles';
import CropsModal from './CropsModal';

function Crops() {
  const { state, dispatch } = useAppState();
  const navigate = useNavigate();
  const [fields, setFields] = useState<NMPFileFieldData[]>(state.nmpFile.years[0].Fields || []);
  const farmRegion = useMemo(() => {
    // The region should be set before reaching this page and cannot be changed on this page
    const region = state.nmpFile.farmDetails.FarmRegion;
    if (region === undefined) throw new Error('Region is not set in NMP file.');
    return region;
  }, []);
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  // TODO: Make this handle two crops
  const handleEditCrop = (fieldIndex: number) => {
    setEditingFieldIndex(fieldIndex);
    setIsDialogOpen(true);
  };

  // TODO: Make this handle two crops
  const handleDeleteCrop = (fieldIndex: number) => {
    setFields((prev) => {
      const newFieldsList = [...prev];
      newFieldsList[fieldIndex].Crops = [];
      return newFieldsList;
    });
  };

  const handleNext = () => {
    if (!state.nmpFile.farmDetails.Year) {
      // We should show an error popup, but for now force-navigate back to Farm Information
      navigate(FARM_INFORMATION);
    }
    dispatch({ type: 'SAVE_FIELDS', year: state.nmpFile.farmDetails.Year!, newFields: fields });
    navigate(CALCULATE_NUTRIENTS);
  };

  const handlePrevious = () => {
    navigate(SOIL_TESTS);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  /**
   * Define column headings for Field list table
   * Contains logic for editing/deleting crops for each row
   */
  const fieldColumns: GridColDef[] = [
    { field: 'FieldName', headerName: 'Field Name', width: 150, minWidth: 150, maxWidth: 400 },
    {
      field: 'cropTypeName',
      headerName: 'Crop Type',
      valueGetter: (_value, row) => row?.Crops[0]?.cropTypeName,
      width: 120,
      minWidth: 100,
      maxWidth: 300,
    },
    {
      field: 'Crops',
      headerName: 'Crops',
      valueGetter: (_value, row) => row?.Crops[0]?.cropName,
      width: 150,
      minWidth: 150,
      maxWidth: 300,
      sortable: false,
    },
    {
      field: '',
      headerName: 'Actions',
      width: 150,
      renderCell: (cell: any) => {
        const rowHasCrop = Object.keys(fields[cell?.row?.index]?.Crops)?.length;

        const handleEditRowBtnClick = () => {
          handleEditCrop(parseInt(cell?.row?.index, 10));
          setIsDialogOpen(true);
        };
        const handleDeleteRowBtnClick = () => {
          handleDeleteCrop(parseInt(cell?.row?.index, 10));
        };
        return (
          <div>
            {rowHasCrop ? (
              <div>
                <FontAwesomeIcon
                  css={tableActionButtonCss}
                  onClick={handleEditRowBtnClick}
                  icon={faEdit}
                />
                <FontAwesomeIcon
                  css={tableActionButtonCss}
                  onClick={handleDeleteRowBtnClick}
                  icon={faTrash}
                />
              </div>
            ) : (
              <Button
                variant="primary"
                size="small"
                onPress={handleEditRowBtnClick}
              >
                Add crop
              </Button>
            )}
          </div>
        );
      },
      sortable: false,
      resizable: false,
    },
  ];

  return (
    <StyledContent>
      <ProgressStepper step={SOIL_TESTS} />
      <AppTitle />
      <PageTitle title="Field Information" />
      <TabsMaterial
        activeTab={2}
        tabLabel={['Field List', 'Soil Tests', 'Crops']}
      />
      {editingFieldIndex !== null && isDialogOpen && (
        <CropsModal
          farmRegion={farmRegion}
          field={fields[editingFieldIndex]}
          fieldIndex={editingFieldIndex}
          setFields={setFields}
          initialModalData={fields[editingFieldIndex].Crops?.[0] || undefined}
          onClose={handleDialogClose}
          isOpen={isDialogOpen}
        />
      )}
      <DataGrid
        sx={{ ...customTableStyle, marginTop: '1.25rem' }}
        rows={fields}
        columns={fieldColumns}
        getRowId={(row: any) => row.index}
        disableRowSelectionOnClick
        disableColumnMenu
        hideFooterPagination
        hideFooter
      />

      <ButtonGroup
        alignment="start"
        ariaLabel="A group of buttons"
        orientation="horizontal"
      >
        <Button
          size="medium"
          aria-label="Back"
          variant="secondary"
          onPress={handlePrevious}
        >
          BACK
        </Button>
        <Button
          size="medium"
          aria-label="Next"
          variant="primary"
          onPress={handleNext}
          type="submit"
        >
          Next
        </Button>
      </ButtonGroup>
    </StyledContent>
  );
}

export default Crops;
