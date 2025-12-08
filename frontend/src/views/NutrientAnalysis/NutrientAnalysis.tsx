/**
 * @summary The nutrient analysis tab on the manure page for the application
 */

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Button, ButtonGroup } from '@bcgov/design-system-react-components';
import { AlertDialog, Tabs, View } from '../../components/common';
import {
  NMPFileAnimal,
  NMPFileManureStorageSystem,
  NMPFileNutrientAnalysis,
  NMPFileManure,
  AlertDialogContinueBtn,
} from '@/types';
import useAppState from '@/hooks/useAppState';
import { MANURE_IMPORTS, FIELD_LIST, CALCULATE_NUTRIENTS, STORAGE } from '@/constants/routes';
import { addRecordGroupStyle, customTableStyle, tableActionButtonCss } from '@/common.styles';
import NutrientAnalysisModal from './NutrientAnalysisModal';
import { DAIRY_COW_ID } from '@/constants';

export default function NutrientAnalysis() {
  const { state, dispatch } = useAppState();

  const manures: NMPFileManure[] = useMemo(
    () =>
      (state.nmpFile.years[0]?.importedManures || []).concat(
        state.nmpFile.years[0]?.generatedManures || [],
        state.nmpFile.years[0]?.derivedManures || [],
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const storageSystems: NMPFileManureStorageSystem[] =
    state.nmpFile.years[0].manureStorageSystems || [];
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [editId, setEditId] = useState<string | null>(null);
  // for each manuresource user can create nutrient analysis' objects
  const [nutrientAnalysisData, setNutrientAnalysisData] = useState<NMPFileNutrientAnalysis[]>(
    state.nmpFile.years[0].nutrientAnalyses,
  );
  // for each manuresource user can create nutrient analysis' objects
  const [analysisForm, setAnalysisForm] = useState<NMPFileNutrientAnalysis | undefined>(undefined);

  const [dialogText, setDialogText] = useState<string>('');
  const [deleteBtnConfig, setDeleteBtnConfig] = useState<AlertDialogContinueBtn | undefined>(
    undefined,
  );
  const hasDairyCattle = useMemo(
    () =>
      state.nmpFile.years[0]?.farmAnimals?.some(
        (animal: NMPFileAnimal) => animal.animalId === DAIRY_COW_ID,
      ),
    [state.nmpFile.years],
  );

  const handleEdit = (uuid: string) => {
    setEditId(uuid);
    setAnalysisForm(nutrientAnalysisData.find((ele) => ele.sourceUuid === uuid));
    setIsDialogOpen(true);
  };

  const handleDelete = (uuid: string) => {
    setNutrientAnalysisData((prevState) => prevState.filter((ele) => ele.sourceUuid !== uuid));
  };
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setAnalysisForm(undefined);
    setEditId(null);
  };

  const handleModalSubmit = (data: NMPFileNutrientAnalysis) => {
    setNutrientAnalysisData((prevState) => {
      // if editing an entry then updates that entry
      if (editId !== null) {
        return prevState.map((item: NMPFileNutrientAnalysis) =>
          item.sourceUuid === editId ? { ...data } : item,
        );
      }
      // else add this new entry
      return [...prevState, { ...data }];
    });
    handleDialogClose();
    setEditId(null);
  };

  const handleNextPage = () => {
    dispatch({
      type: 'SAVE_NUTRIENT_ANALYSIS',
      year: state.nmpFile.farmDetails.year,
      newNutrientAnalyses: nutrientAnalysisData,
    });
    if (!state.showAnimalsStep) {
      navigate(CALCULATE_NUTRIENTS);
    } else {
      navigate(FIELD_LIST);
    }
  };

  const handlePreviousPage = () => {
    dispatch({
      type: 'SAVE_NUTRIENT_ANALYSIS',
      year: state.nmpFile.farmDetails.year,
      newNutrientAnalyses: nutrientAnalysisData,
    });
    if (hasDairyCattle) {
      navigate(STORAGE);
    } else {
      navigate(MANURE_IMPORTS);
    }
  };

  const nutrientTableColumns: GridColDef[] = useMemo(
    () => [
      {
        headerName: 'Source',
        field: 'sourceName',
        width: 200,
        minWidth: 100,
        maxWidth: 300,
        sortable: false,
      },
      {
        headerName: 'Moisture',
        field: 'moisture',
        width: 100,
        minWidth: 100,
        maxWidth: 300,
        sortable: false,
      },
      {
        headerName: 'N (%)',
        field: 'N',
        width: 100,
        minWidth: 100,
        maxWidth: 300,
        valueGetter: (param: string | number) => param,
        sortable: false,
      },
      {
        renderHeader: () => (
          <strong>
            <span>NH₄-N (ppm)</span>
          </strong>
        ),
        field: 'NH4N',
        width: 100,
        minWidth: 100,
        maxWidth: 300,
        sortable: false,
      },
      {
        headerName: 'P (%)',
        field: 'P',
        width: 100,
        minWidth: 100,
        maxWidth: 300,
        sortable: false,
      },
      {
        headerName: 'K (%)',
        field: 'K',
        width: 100,
        minWidth: 100,
        maxWidth: 300,
        sortable: false,
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 120,
        renderCell: (row: GridRenderCellParams) => (
          <>
            <FontAwesomeIcon
              css={tableActionButtonCss}
              onClick={() => handleEdit(row.row.sourceUuid)}
              icon={faEdit}
              aria-label="Edit"
            />
            <FontAwesomeIcon
              css={tableActionButtonCss}
              onClick={() => {
                setDialogText(`Are you sure you want to delete ${row.row.sourceName}?`);
                setDeleteBtnConfig({
                  btnText: 'Delete',
                  handleClick: () => {
                    handleDelete(row.row.sourceUuid);
                    setDialogText('');
                  },
                });
              }}
              icon={faTrash}
              aria-label="Delete"
            />
          </>
        ),
        sortable: false,
        resizable: false,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nutrientAnalysisData],
  );

  return (
    <View
      title="Nutrient Analysis"
      handleBack={handlePreviousPage}
      handleNext={handleNextPage}
    >
      <AlertDialog
        isOpen={!!dialogText}
        title="Nutrient Analysis - Delete"
        onOpenChange={() => setDialogText('')}
        continueBtn={deleteBtnConfig}
      >
        <div>{dialogText}</div>
      </AlertDialog>
      <div css={addRecordGroupStyle}>
        <ButtonGroup
          alignment="end"
          ariaLabel="A group of buttons"
          orientation="horizontal"
        >
          <Button
            size="medium"
            onPress={() => setIsDialogOpen(true)}
            variant="secondary"
          >
            Add Nutrient Anaylsis
          </Button>
        </ButtonGroup>
      </div>
      {isDialogOpen && (
        <NutrientAnalysisModal
          initialModalData={analysisForm}
          manures={manures}
          storageSystems={storageSystems}
          currentNutrientAnalyses={nutrientAnalysisData}
          handleSubmit={handleModalSubmit}
          isOpen={isDialogOpen}
          onCancel={handleDialogClose}
          modalStyle={{ width: '700px' }}
        />
      )}
      {state.showAnimalsStep && hasDairyCattle ? (
        <Tabs
          activeTab={3}
          tabLabel={['Add Animals', 'Manure & Imports', 'Storage', 'Nutrient Analysis']}
        />
      ) : state.showAnimalsStep ? (
        <Tabs
          activeTab={2}
          tabLabel={['Add Animals', 'Manure & Imports', 'Nutrient Analysis']}
        />
      ) : (
        <Tabs
          activeTab={1}
          tabLabel={['Manure & Imports', 'Nutrient Analysis']}
        />
      )}
      <DataGrid
        sx={{ ...customTableStyle, marginTop: '1.25rem' }}
        rows={nutrientAnalysisData}
        columns={nutrientTableColumns}
        getRowId={() => crypto.randomUUID()}
        disableRowSelectionOnClick
        disableColumnMenu
        hideFooterPagination
        hideFooter
      />
    </View>
  );
}
