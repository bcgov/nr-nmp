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
<<<<<<< HEAD
import { StyledContent } from './storage.styles';
=======
import { NMPFileFarmManureData } from '../../types';
import { DEFAULT_NMPFILE_YEAR, DefaultManureFormData } from '../../constants';
import { StyledContent } from './storage.styles';
import useAppState from '../../hooks/useAppState';
>>>>>>> 76c95c3 (feat(NMP-290): Storage Page and Modal if Dairy Cattle (#331))
import { NUTRIENT_ANALYSIS, MANURE_IMPORTS } from '../../constants/routes';

import { AppTitle, PageTitle, ProgressStepper, TabsMaterial } from '../../components/common';
import { addRecordGroupStyle, customTableStyle, tableActionButtonCss } from '../../common.styles';
import StorageModal from './StorageModal';

<<<<<<< HEAD
export interface StorageForm {
  ManureType: string;
  ManureTypeName: string;
  SystemName: string;
  StorageName: string;
  IsMaterialStored: boolean;
  IsCovered: boolean;
  UncoveredArea?: number;
  AssignedToStoredSystem?: boolean;
  ManagedManure: string;
  UniqueMaterialName: string;
}

const EMPTY_STORAGE: StorageForm = {
  ManureType: '',
  ManureTypeName: '',
  SystemName: '',
  StorageName: '',
  IsMaterialStored: false,
  IsCovered: false,
  AssignedToStoredSystem: false,
  ManagedManure: '',
  UniqueMaterialName: '',
};

export default function Storage() {
  const navigate = useNavigate();
  const [storageList, setStorageList] = useState<StorageForm[]>([]);
  // Not sure if this is the right file type
  const [storageFormData, setStorageFormData] = useState<StorageForm>(EMPTY_STORAGE);

  const handleSubmit = (formData: StorageForm) => {
    setStorageList([...storageList, formData]);
  };
=======
export default function Storage() {
  const { state } = useAppState();
  const navigate = useNavigate();

  // TODO: make correct file type
  const [storageList, setStorageList] = useState<NMPFileFarmManureData[]>(
    state.nmpFile.years[0]?.FarmManures || [],
  );
  // Not sure if NMPFileFarmManureData is the right file type
  const [storageFormData, setstorageFormData] = useState<NMPFileFarmManureData>({
    ManureSource: '',
    MaterialType: '',
    BookLab: '',
    UniqueMaterialName: '',
    Nutrients: { N: 0, P2O5: 0, K2O: 0, Moisture: '', NH4N: 0 },
  });

  const handleSubmit = () => {};
>>>>>>> 76c95c3 (feat(NMP-290): Storage Page and Modal if Dairy Cattle (#331))

  const handlePrevious = () => {
    navigate(MANURE_IMPORTS);
  };

<<<<<<< HEAD
  // fix dispatch where are we saving the storage form info
  // either imported or generated manure do we save IsMaterialStored and AssignedToStoredSystem booleans
=======
>>>>>>> 76c95c3 (feat(NMP-290): Storage Page and Modal if Dairy Cattle (#331))
  const handleNext = () => {
    navigate(NUTRIENT_ANALYSIS);
  };

  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const handleDialogClose = () => {
<<<<<<< HEAD
    setStorageFormData(EMPTY_STORAGE);
    setIsDialogOpen(false);
  };

  // on edit text fields dont show up
  const handleEditRow = (e: GridRenderCellParams) => {
    setStorageFormData(e.row);
    setIsDialogOpen(true);
  };

  const handleDeleteRow = (e: GridRenderCellParams) => {
    setStorageList((prev) =>
      prev.filter((row) => row.UniqueMaterialName !== e.row.UniqueMaterialName),
    );
  };
=======
    setIsDialogOpen(false);
  };

  const handleEditRow = (e: GridRenderCellParams) => {
    setIsDialogOpen(true);
  };

  const handleDeleteRow = (e: GridRenderCellParams) => {};
>>>>>>> 76c95c3 (feat(NMP-290): Storage Page and Modal if Dairy Cattle (#331))

  const columnsAnimalManure: GridColDef[] = useMemo(
    () => [
      {
<<<<<<< HEAD
        field: 'SystemName',
        headerName: 'System Name',
=======
        field: 'storageType',
        headerName: 'Storage Type',
>>>>>>> 76c95c3 (feat(NMP-290): Storage Page and Modal if Dairy Cattle (#331))
        width: 200,
        minWidth: 150,
        maxWidth: 300,
      },
      {
<<<<<<< HEAD
        field: 'StorageName',
=======
        field: 'storageName',
>>>>>>> 76c95c3 (feat(NMP-290): Storage Page and Modal if Dairy Cattle (#331))
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
<<<<<<< HEAD
=======
          storageList={storageList}
>>>>>>> 76c95c3 (feat(NMP-290): Storage Page and Modal if Dairy Cattle (#331))
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
<<<<<<< HEAD
        getRowId={() => crypto.randomUUID()}
=======
        getRowId={(row: any) => row.index}
>>>>>>> 76c95c3 (feat(NMP-290): Storage Page and Modal if Dairy Cattle (#331))
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
