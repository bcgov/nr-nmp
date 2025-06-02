/**
 * @summary This is the Add Animal list Tab
 */
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Button, ButtonGroup } from '@bcgov/design-system-react-components';
import { customTableStyle, tableActionButtonCss, addRecordGroupStyle } from '../../common.styles';
import useAppService from '@/services/app/useAppService';
import { AppTitle, PageTitle, TabsMaterial } from '@/components/common';
import { AnimalData } from './types';
import { FARM_INFORMATION, MANURE_IMPORTS } from '@/constants/RouteConstants';
import ProgressStepper from '@/components/common/ProgressStepper/ProgressStepper';
import { initAnimals, saveAnimalsToFile } from './utils';
import { ErrorText, StyledContent } from './addAnimals.styles';
import AddAnimalsModal from './AddAnimalsModal';
import { liquidSolidManureDisplay } from '@/utils/utils';

export default function AddAnimals() {
  const { state, setNMPFile, setShowAnimalsStep } = useAppService();
  const [rowEditIndex, setRowEditIndex] = useState<number | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [showViewError, setShowViewError] = useState<string>('');

  const navigate = useNavigate();

  // Load NMP animals into view, add index for UI tracking purposes
  const [animalList, setAnimalList] = useState<Array<AnimalData>>(
    initAnimals(state).map((animalElement: AnimalData, index: number) => ({
      ...animalElement,
      index,
    })),
  );

  useEffect(() => {
    setShowAnimalsStep(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEditRow = React.useCallback((e: { row: AnimalData }) => {
    setRowEditIndex(e.row.index);
    setIsDialogOpen(true);
  }, []);

  const handleDeleteRow = (e: { row: AnimalData }) => {
    setAnimalList((prev) => {
      const deleteSpot = prev.findIndex((elem) => elem.index === e.row.index);
      const newList = [...prev];
      newList.splice(deleteSpot, 1);
      return newList;
    });
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setRowEditIndex(undefined);
  };

  const handleNextPage = () => {
    if (animalList.length) {
      saveAnimalsToFile(
        // Delete the index key in each field to prevent saving into NMPfile
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        animalList.map(({ index, ...remainingAnimals }) => remainingAnimals),
        state.nmpFile,
        setNMPFile,
      );
      navigate(MANURE_IMPORTS);
    } else {
      setShowViewError('You must add at least one animal before continuing.');
    }
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
      <ProgressStepper step={FARM_INFORMATION} />
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
            initialModalData={
              rowEditIndex !== undefined
                ? animalList.find((v) => v.index === rowEditIndex)
                : undefined
            }
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
        tabLabel={['Add Animals', 'Manure & Imports', 'Nutrient Analysis']}
      />
      <DataGrid
        sx={{ ...customTableStyle, marginTop: '1.25rem' }}
        rows={animalList}
        columns={columns}
        getRowId={(row: any) => row.index}
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
          onPress={() => navigate(FARM_INFORMATION)}
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
