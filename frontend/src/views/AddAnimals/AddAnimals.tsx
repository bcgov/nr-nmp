/**
 * @summary This is the Add Animal list Tab
 */
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { DataGrid, GridColDef, GridRowId } from '@mui/x-data-grid';
import { GridApiCommunity } from '@mui/x-data-grid/internals';
import { Button, ButtonGroup } from '@bcgov/design-system-react-components';
import { customTableStyle, tableActionButtonCss, addRecordGroupStyle } from '../../common.styles';
import useAppState from '@/hooks/useAppState';
import { AppTitle, PageTitle, TabsMaterial } from '@/components/common';
import { AnimalData } from '@/types';
import { FARM_INFORMATION, MANURE_IMPORTS } from '@/constants/routes';
import ProgressStepper from '@/components/common/ProgressStepper/ProgressStepper';
import { ErrorText, StyledContent } from './addAnimals.styles';
import AddAnimalsModal from './AddAnimalsModal';
import { liquidSolidManureDisplay } from '@/utils/utils';

export default function AddAnimals() {
  const { state, dispatch } = useAppState();
  const [rowEditIndex, setRowEditIndex] = useState<number | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [showViewError, setShowViewError] = useState<string>('');

  const navigate = useNavigate();

  const [animalList, setAnimalList] = useState<Array<AnimalData>>(
    state.nmpFile.years[0].FarmAnimals || [],
  );

  const hasDairyCattle = useMemo(
    () =>
      state.nmpFile.years[0]?.FarmAnimals?.some((animal: AnimalData) => animal.animalId === '2'),
    [state.nmpFile.years],
  );
  const tabs = useMemo(
    () =>
      hasDairyCattle
        ? ['Add Animals', 'Manure & Imports', 'Storage', 'Nutrient Analysis']
        : ['Add Animals', 'Manure & Imports', 'Nutrient Analysis'],
    [hasDairyCattle],
  );

  const handleEditRow = React.useCallback((e: { id: GridRowId; api: GridApiCommunity }) => {
    setRowEditIndex(e.api.getRowIndexRelativeToVisibleRows(e.id));
    setIsDialogOpen(true);
  }, []);

  const handleDeleteRow = (e: { id: GridRowId; api: GridApiCommunity }) => {
    setAnimalList((prev) => {
      const index = e.api.getRowIndexRelativeToVisibleRows(e.id);
      const newList = [...prev];
      newList.splice(index, 1);
      return newList;
    });
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setRowEditIndex(undefined);
  };

  const handleNextPage = () => {
    if (!state.nmpFile.farmDetails.Year) {
      // We should show an error popup, but for now force-navigate back to Farm Information
      navigate(FARM_INFORMATION);
    }
    if (animalList.length) {
      dispatch({
        type: 'SAVE_ANIMALS',
        year: state.nmpFile.farmDetails.Year!,
        newAnimals: animalList,
      });
      navigate(MANURE_IMPORTS);
    } else {
      setShowViewError('You must add at least one animal before continuing.');
    }
  };

  const handlePreviousPage = () => {
    navigate(FARM_INFORMATION);
  };

  // Same columns are in ManureAndImports.tsx
  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'animalId',
        headerName: 'Animal Type',
        width: 200,
        minWidth: 150,
        maxWidth: 300,
        valueGetter: (params: any) => (params === '1' ? 'Beef Cattle' : 'Dairy Cattle'),
      },
      {
        field: 'manureData',
        headerName: 'Annual Manure',
        width: 200,
        minWidth: 155,
        maxWidth: 300,
        valueGetter: (params: any) => liquidSolidManureDisplay(params),
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 120,
        renderCell: (row: any) => (
          <>
            <FontAwesomeIcon
              css={tableActionButtonCss}
              onClick={() => handleEditRow(row)}
              icon={faEdit}
              aria-label="Edit"
            />
            <FontAwesomeIcon
              css={tableActionButtonCss}
              onClick={() => handleDeleteRow(row)}
              icon={faTrash}
              aria-label="Delete"
            />
          </>
        ),
        sortable: false,
      },
    ],
    [handleEditRow],
  );

  return (
    <StyledContent>
      <ProgressStepper />
      <AppTitle />
      <PageTitle title="Livestock Information" />
      <>
        <div css={addRecordGroupStyle}>
          <ButtonGroup
            alignment="end"
            ariaLabel="A group of buttons"
            orientation="horizontal"
          >
            <Button
              size="medium"
              aria-label="Add Animal"
              onPress={() => setIsDialogOpen(true)}
              variant="secondary"
            >
              Add Animal
            </Button>
          </ButtonGroup>
        </div>
        {isDialogOpen && (
          <AddAnimalsModal
            initialModalData={rowEditIndex !== undefined ? animalList[rowEditIndex] : undefined}
            rowEditIndex={rowEditIndex}
            setAnimalList={setAnimalList}
            isOpen={isDialogOpen}
            onClose={handleDialogClose}
            modalStyle={{ width: '700px' }}
          />
        )}
      </>
      <TabsMaterial
        activeTab={0}
        tabLabel={tabs}
      />
      <DataGrid
        sx={{ ...customTableStyle, marginTop: '1.25rem' }}
        rows={animalList}
        columns={columns}
        getRowId={() => crypto.randomUUID()}
        disableRowSelectionOnClick
        disableColumnMenu
        hideFooterPagination
        hideFooter
      />
      <ErrorText>{showViewError}</ErrorText>
      <ButtonGroup
        alignment="start"
        ariaLabel="A group of buttons"
        orientation="horizontal"
      >
        <Button
          size="medium"
          aria-label="Back"
          variant="secondary"
          onPress={handlePreviousPage}
        >
          BACK
        </Button>
        <Button
          size="medium"
          aria-label="Next"
          variant="primary"
          onPress={handleNextPage}
          type="submit"
          // imo this button should be disabled instead of showing error text on click
          // isDisabled={animalList.length === 0}
        >
          Next
        </Button>
      </ButtonGroup>
    </StyledContent>
  );
}
