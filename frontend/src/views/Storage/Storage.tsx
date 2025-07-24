/* eslint-disable eqeqeq */
import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import {
  Button,
  Button as ButtonGov,
  ButtonGroup as ButtonGovGroup,
  ButtonGroup,
} from '@bcgov/design-system-react-components';
import { DataGrid, GridColDef, GridRenderCellParams, GridRowId } from '@mui/x-data-grid';
import { GridApiCommunity } from '@mui/x-data-grid/internals';
import { StyledContent } from './storage.styles';
import { NUTRIENT_ANALYSIS, MANURE_IMPORTS } from '../../constants/routes';

import { AppTitle, PageTitle, ProgressStepper, TabsMaterial } from '../../components/common';
import { addRecordGroupStyle, customTableStyle, tableActionButtonCss } from '../../common.styles';
import StorageModal from './StorageModal';
import useAppState from '@/hooks/useAppState';
import { ManureInSystem } from '@/types';

export default function Storage() {
  const { state, dispatch } = useAppState();
  const navigate = useNavigate();
  const [rowEditIndex, setRowEditIndex] = useState<number | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const generatedManures = state.nmpFile.years[0].GeneratedManures;
  const importedManures = state.nmpFile.years[0].ImportedManures;
  const unassignedManures = useMemo(() => {
    const unassignedM: ManureInSystem[] = [];
    const assignedM: ManureInSystem[] = [];
    (generatedManures || []).forEach((manure) => {
      if (manure.AssignedToStoredSystem) {
        assignedM.push({ type: 'Generated', data: manure });
      } else {
        unassignedM.push({ type: 'Generated', data: manure });
      }
    });
    (importedManures || []).forEach((manure) => {
      if (manure.AssignedToStoredSystem) {
        assignedM.push({ type: 'Imported', data: manure });
      } else {
        unassignedM.push({ type: 'Imported', data: manure });
      }
    });
    return unassignedM;
  }, [generatedManures, importedManures]);

  const handlePrevious = () => {
    navigate(MANURE_IMPORTS);
  };

  const handleNext = () => {
    navigate(NUTRIENT_ANALYSIS);
  };

  const handleDialogClose = () => {
    setRowEditIndex(undefined);
    setIsDialogOpen(false);
  };

  const handleEditRow = (e: { id: GridRowId; api: GridApiCommunity }) => {
    setRowEditIndex(e.api.getRowIndexRelativeToVisibleRows(e.id));
    setIsDialogOpen(true);
  };

  const handleDeleteRow = useCallback(
    (e: { id: GridRowId; api: GridApiCommunity }) => {
      const index = e.api.getRowIndexRelativeToVisibleRows(e.id);
      const newList = [...state.nmpFile.years[0].ManureStorageSystems!];
      newList.splice(index, 1);
      dispatch({
        type: 'SAVE_MANURE_STORAGE_SYSTEMS',
        year: state.nmpFile.farmDetails.Year!,
        newManureStorageSystems: newList,
      });
    },
    [state.nmpFile, dispatch],
  );

  const columnsAnimalManure: GridColDef[] = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'System Name',
        width: 200,
        minWidth: 150,
        maxWidth: 300,
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 120,
        renderCell: (row: GridRenderCellParams) => (
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
        resizable: false,
      },
    ],
    [handleDeleteRow],
  );

  return (
    <StyledContent>
      <ProgressStepper />
      <AppTitle />
      <PageTitle title="Storage" />
      <>
        <div css={addRecordGroupStyle}>
          <ButtonGovGroup
            alignment="end"
            ariaLabel="A group of buttons"
            orientation="horizontal"
          >
            <ButtonGov
              size="medium"
              aria-label="Add Storage System"
              onPress={() => setIsDialogOpen(true)}
              variant="secondary"
            >
              Add Storage System
            </ButtonGov>
          </ButtonGovGroup>
        </div>
        {isDialogOpen && (
          <StorageModal
            initialModalData={
              rowEditIndex !== undefined
                ? state.nmpFile.years[0].ManureStorageSystems![rowEditIndex]
                : undefined
            }
            rowEditIndex={rowEditIndex}
            unassignedManures={unassignedManures}
            handleDialogClose={handleDialogClose}
            isOpen={isDialogOpen}
          />
        )}
        <TabsMaterial
          activeTab={2}
          tabLabel={['Add Animals', 'Manure & Imports', 'Storage', 'Nutrient Analysis']}
        />
      </>
      <DataGrid
        sx={{ ...customTableStyle, marginTop: '1.25rem' }}
        rows={state.nmpFile.years[0].ManureStorageSystems || []}
        columns={columnsAnimalManure}
        getRowId={() => crypto.randomUUID()}
        disableRowSelectionOnClick
        disableColumnMenu
        hideFooterPagination
        hideFooter
      />
      <div>
        <span>Materials Needing Storage</span>
        <br />
        {unassignedManures.map((m) => (
          <>
            <span key={m.data.ManagedManureName}>{m.data.ManagedManureName}</span>
            <br />
          </>
        ))}
      </div>
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
          Back
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
