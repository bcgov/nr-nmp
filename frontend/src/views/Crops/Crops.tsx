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
import { DataGrid, GridColDef, GridRowId } from '@mui/x-data-grid';
import { GridApiCommunity } from '@mui/x-data-grid/internals';
import useAppState from '@/hooks/useAppState';
import { AppTitle, PageTitle, ProgressStepper, TabsMaterial } from '../../components/common';
import { StyledContent } from './crops.styles';
import { NMPFileFieldData } from '@/types';
import {
  CALCULATE_NUTRIENTS,
  SOIL_TESTS,
  FARM_INFORMATION,
  MANURE_IMPORTS,
} from '@/constants/routes';
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
  const [editingFieldIndex, setEditingFieldIndex] = useState<number>(0);
  const [editingCropIndex, setEditingCropIndex] = useState<number | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const handleEditCrop = (e: { id: GridRowId; api: GridApiCommunity }, cropIndex: number) => {
    setEditingFieldIndex(e.api.getRowIndexRelativeToVisibleRows(e.id));
    setEditingCropIndex(cropIndex);
    setIsDialogOpen(true);
  };

  const handleDeleteCrop = (e: { id: GridRowId; api: GridApiCommunity }, cropIndex: number) => {
    setFields((prev) => {
      const fieldIndex = e.api.getRowIndexRelativeToVisibleRows(e.id);
      const newFieldsList = [...prev];
      newFieldsList[fieldIndex].Crops.splice(cropIndex, 1);
      return newFieldsList;
    });
  };

  const handleNextPage = () => {
    if (!state.nmpFile.farmDetails.Year) {
      // We should show an error popup, but for now force-navigate back to Farm Information
      navigate(FARM_INFORMATION);
    }
    dispatch({ type: 'SAVE_FIELDS', year: state.nmpFile.farmDetails.Year!, newFields: fields });
    if (!state.showAnimalsStep) {
      navigate(MANURE_IMPORTS);
    } else {
      navigate(CALCULATE_NUTRIENTS);
    }
  };

  const handlePreviousPage = () => {
    dispatch({ type: 'SAVE_FIELDS', year: state.nmpFile.farmDetails.Year!, newFields: fields });
    navigate(SOIL_TESTS);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingCropIndex(0);
  };

  // each field can have up to 2 crops, render another add crop button after first crop inputted
  const fieldColumns: GridColDef[] = [
    { field: 'FieldName', headerName: 'Field Name', width: 150, minWidth: 150, maxWidth: 400 },
    {
      field: 'Crops1',
      headerName: 'Crop 1',
      valueGetter: (_value, row) => row?.Crops?.[0]?.name || '',
      width: 170,
      minWidth: 100,
      maxWidth: 300,
    },
    {
      field: 'ActionsCrop1',
      headerName: 'Actions',
      width: 150,
      renderCell: (e) => {
        const fieldIndex = e.api.getRowIndexRelativeToVisibleRows(e.id);
        const crop = fields[fieldIndex]?.Crops?.[0];

        return (
          <div>
            {crop ? (
              <>
                <FontAwesomeIcon
                  css={tableActionButtonCss}
                  onClick={() => handleEditCrop(e, 0)}
                  icon={faEdit}
                />
                <FontAwesomeIcon
                  css={tableActionButtonCss}
                  onClick={() => handleDeleteCrop(e, 0)}
                  icon={faTrash}
                />
              </>
            ) : (
              <Button
                variant="primary"
                size="small"
                onClick={() => {
                  setEditingFieldIndex(fieldIndex);
                  // Set editing index to undefined because this is a new crop
                  setEditingCropIndex(undefined);
                  setIsDialogOpen(true);
                }}
              >
                Add Crop
              </Button>
            )}
          </div>
        );
      },
      sortable: false,
      resizable: false,
    },
    {
      field: 'Crops2',
      headerName: 'Crop 2',
      valueGetter: (_value, row) => row?.Crops?.[1]?.name || '',
      width: 170,
      minWidth: 100,
      maxWidth: 300,
      sortable: false,
    },
    {
      field: 'ActionsCrop2',
      headerName: 'Actions',
      width: 200,
      renderCell: (e) => {
        const fieldIndex = e.api.getRowIndexRelativeToVisibleRows(e.id);
        const rowHasCrop = !!fields[fieldIndex]?.Crops?.[0];
        const crop = fields[fieldIndex]?.Crops[1];

        if (!rowHasCrop) return null;

        return (
          <div>
            {crop ? (
              <>
                <FontAwesomeIcon
                  css={tableActionButtonCss}
                  onClick={() => handleEditCrop(e, 1)}
                  icon={faEdit}
                />
                <FontAwesomeIcon
                  css={tableActionButtonCss}
                  onClick={() => handleDeleteCrop(e, 1)}
                  icon={faTrash}
                />
              </>
            ) : (
              <Button
                variant="primary"
                size="small"
                onClick={() => {
                  setEditingFieldIndex(fieldIndex);
                  // Set editing index to undefined because this is a new crop
                  setEditingCropIndex(undefined);
                  setIsDialogOpen(true);
                }}
              >
                Add Another Crop
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
      <ProgressStepper />
      <AppTitle />
      <PageTitle title="Field Information" />
      <TabsMaterial
        activeTab={2}
        tabLabel={['Field List', 'Soil Tests', 'Crops']}
      />
      {editingFieldIndex !== null && isDialogOpen && (
        // affter editing in modal changes not showing on reopen
        <CropsModal
          farmRegion={farmRegion}
          field={fields[editingFieldIndex]}
          fieldIndex={editingFieldIndex}
          cropIndex={editingCropIndex}
          setFields={setFields}
          initialModalData={
            editingCropIndex !== undefined
              ? fields[editingFieldIndex].Crops[editingCropIndex]
              : undefined
          }
          onClose={handleDialogClose}
          isOpen={isDialogOpen}
        />
      )}
      <DataGrid
        sx={{ ...customTableStyle, marginTop: '1.25rem' }}
        rows={fields}
        columns={fieldColumns}
        getRowId={() => crypto.randomUUID()}
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
          variant="secondary"
          onClick={handlePreviousPage}
        >
          Back
        </Button>
        <Button
          size="medium"
          variant="primary"
          onClick={handleNextPage}
          type="submit"
        >
          Next
        </Button>
      </ButtonGroup>
    </StyledContent>
  );
}

export default Crops;
