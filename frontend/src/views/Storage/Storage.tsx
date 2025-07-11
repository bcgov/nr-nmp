/* eslint-disable eqeqeq */
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import {
  Button,
  Button as ButtonGov,
  ButtonGroup as ButtonGovGroup,
  ButtonGroup,
} from '@bcgov/design-system-react-components';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { StyledContent } from './storage.styles';
import { NUTRIENT_ANALYSIS, MANURE_IMPORTS } from '../../constants/routes';

import { AppTitle, PageTitle, ProgressStepper, TabsMaterial } from '../../components/common';
import { addRecordGroupStyle, customTableStyle, tableActionButtonCss } from '../../common.styles';
import StorageModal from './StorageModal';
import useAppState from '@/hooks/useAppState';
import { NMPFileManureStorageSystemsData } from '@/types';
import DefaultNMPFileManureStorageSystemsData from '@/constants/DefaultNMPFileManureStorage';

export default function Storage() {
  const { state, dispatch } = useAppState();
  const navigate = useNavigate();
  const [rowEditIndex, setRowEditIndex] = useState<number | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [storageList, setStorageList] = useState<NMPFileManureStorageSystemsData[]>(
    state.nmpFile.years[0]?.ManureStorageSystems || [],
  );
  const [storageFormData, setStorageFormData] = useState<NMPFileManureStorageSystemsData>(
    DefaultNMPFileManureStorageSystemsData,
  );

  const handlePrevious = () => {
    navigate(MANURE_IMPORTS);
  };

  // save to NMPFileManureStorageSystemsData
  // either imported or generated manure do we save IsMaterialStored and AssignedToStoredSystem booleans
  const handleNext = () => {
    dispatch({
      type: 'SAVE_MANURE_STORAGE_SYSTEMS',
      year: state.nmpFile.farmDetails.Year!,
      newManureStorageSystems: storageList,
    });
    navigate(NUTRIENT_ANALYSIS);
  };

  const handleDialogClose = () => {
    setRowEditIndex(undefined);
    setStorageFormData(DefaultNMPFileManureStorageSystemsData);
    setIsDialogOpen(false);
  };

  // on edit text fields dont show up
  const handleEditRow = (e: GridRenderCellParams) => {
    setRowEditIndex(e.row);
    setStorageFormData(e.row);
    setIsDialogOpen(true);
  };

  const handleDeleteRow = (e: GridRenderCellParams) => {
    setStorageList((prev) => prev.filter((ele) => ele.Name !== e.row.Name));
  };

  const handleSubmit = (formData: NMPFileManureStorageSystemsData) => {
    setStorageList([...storageList, storageFormData]);
    if (rowEditIndex !== undefined) {
      // If editing, find and replace field instead of adding new field
      setStorageList((prev) => {
        const newList = [...prev];
        newList[rowEditIndex] = { ...formData };
        return newList;
      });
    } else {
      setStorageList((prev) => [...prev, { ...formData }]);
    }
    handleDialogClose();
  };

  const columnsAnimalManure: GridColDef[] = useMemo(
    () => [
      {
        field: 'Name',
        headerName: 'System Name',
        width: 200,
        minWidth: 150,
        maxWidth: 300,
      },
      {
        field: 'ManureStorageStructures[0].Name',
        headerName: 'Storage Name',
        width: 325,
        minWidth: 150,
        maxWidth: 500,
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
    [],
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
        <StorageModal
          key={isDialogOpen.toString()}
          initialModalData={storageFormData}
          storageList={storageList}
          handleDialogClose={handleDialogClose}
          handleSubmit={handleSubmit}
          isOpen={isDialogOpen}
          onOpenChange={handleDialogClose}
          isDismissable
        />
        <TabsMaterial
          activeTab={2}
          tabLabel={['Add Animals', 'Manure & Imports', 'Storage', 'Nutrient Analysis']}
        />
      </>
      <DataGrid
        sx={{ ...customTableStyle, marginTop: '1.25rem' }}
        rows={storageList}
        columns={columnsAnimalManure}
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
