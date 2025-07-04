/**
 * @summary The nutrient analysis tab on the manure page for the application
 */

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Button, Button as ButtonGov, ButtonGroup } from '@bcgov/design-system-react-components';
import { AppTitle, PageTitle, ProgressStepper, TabsMaterial } from '../../components/common';
import { StyledContent } from './nutrientAnalsysis.styles';
import { AnimalData, NMPFileImportedManureData } from '@/types';
import useAppState from '@/hooks/useAppState';
import { MANURE_IMPORTS, FIELD_LIST, CALCULATE_NUTRIENTS, STORAGE } from '@/constants/routes';
import { NMPFileFarmManureData } from '@/types/NMPFileFarmManureData';
import NMPFileGeneratedManureData from '@/types/NMPFileGeneratedManureData';
import { addRecordGroupStyle, customTableStyle, tableActionButtonCss } from '@/common.styles';
import NutrientAnalysisModal from './NutrientAnalysisModal';

export default function NutrientAnalysis() {
  const { state, dispatch } = useAppState();

  const manures: (NMPFileImportedManureData | NMPFileGeneratedManureData)[] = useMemo(
    () =>
      (state.nmpFile.years[0]?.ImportedManures || []).concat(
        state.nmpFile.years[0]?.GeneratedManures || [],
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [editName, setEditName] = useState<string | null>(null);
  // for each manuresource user can create nutrient analysis' objects
  const [nutrientAnalysisData, setNutrientAnalysisData] = useState<NMPFileFarmManureData[]>(
    state.nmpFile.years[0]?.FarmManures || [],
  );
  // for each manuresource user can create nutrient analysis' objects
  const [analysisForm, setAnalysisForm] = useState<NMPFileFarmManureData | undefined>(undefined);

  const hasDairyCattle = useMemo(
    () =>
      state.nmpFile.years[0]?.FarmAnimals?.some((animal: AnimalData) => animal.animalId === '2'),
    [state.nmpFile.years],
  );

  const handleEdit = (name: string) => {
    setEditName(name);
    setAnalysisForm(nutrientAnalysisData.find((ele) => ele.ManureSource === name));
    setIsDialogOpen(true);
  };

  const handleDelete = (name: string) => {
    setNutrientAnalysisData((prevState) => prevState.filter((ele) => ele.ManureSource !== name));
  };
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setAnalysisForm(undefined);
    setEditName(null);
  };

  const handleModalSubmit = (data: NMPFileFarmManureData) => {
    setNutrientAnalysisData((prevState) => {
      // if editing an entry then updates that entry
      if (editName !== null) {
        return prevState.map((item: NMPFileFarmManureData) =>
          item.ManureSource === editName ? { ...data } : item,
        );
      }
      // else add this new entry
      return [...prevState, { ...data }];
    });
    handleDialogClose();
    setEditName(null);
  };

  const handleNextPage = () => {
    dispatch({
      type: 'SAVE_FARM_MANURE',
      year: state.nmpFile.farmDetails.Year!,
      newManures: nutrientAnalysisData,
    });
    if (!state.showAnimalsStep) {
      navigate(CALCULATE_NUTRIENTS);
    } else {
      navigate(FIELD_LIST);
    }
  };

  const handlePreviousPage = () => {
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
        field: 'ManureSource',
        width: 200,
        minWidth: 100,
        maxWidth: 300,
      },
      {
        headerName: 'Moisture',
        field: 'Moisture',
        width: 100,
        minWidth: 100,
        maxWidth: 300,
      },
      {
        headerName: 'N (%)',
        field: 'N',
        width: 100,
        minWidth: 100,
        maxWidth: 300,
        valueGetter: (param: string | number) => param,
      },
      {
        headerName: 'NH4-N (%)',
        field: 'NH4N',
        width: 100,
        minWidth: 100,
        maxWidth: 300,
      },
      {
        headerName: 'P (%)',
        field: 'P2O5',
        width: 100,
        minWidth: 100,
        maxWidth: 300,
      },
      {
        headerName: 'K (%)',
        field: 'K2O',
        width: 100,
        minWidth: 100,
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
              onClick={() => handleEdit(row.row.ManureSource)}
              icon={faEdit}
              aria-label="Edit"
            />
            <FontAwesomeIcon
              css={tableActionButtonCss}
              onClick={() => handleDelete(row.row.ManureSource)}
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
    <StyledContent>
      <ProgressStepper />
      <AppTitle />
      <PageTitle title="Nutrient Analysis" />
      <div css={addRecordGroupStyle}>
        <ButtonGroup
          alignment="end"
          ariaLabel="A group of buttons"
          orientation="horizontal"
        >
          <ButtonGov
            size="medium"
            aria-label="Add Nutrient Anaylsis"
            onPress={() => setIsDialogOpen(true)}
            variant="secondary"
          >
            Add Nutrient Anaylsis
          </ButtonGov>
        </ButtonGroup>
      </div>
      {isDialogOpen && (
        <NutrientAnalysisModal
          initialModalData={analysisForm}
          manures={manures.filter((manureEle) => {
            const existingList = nutrientAnalysisData.map(
              (nutrientEle) => nutrientEle.ManureSource,
            );
            // Disallow manurer sources already entered, unless it is being edited
            return !existingList.some(
              (ele) => ele === manureEle.UniqueMaterialName && ele !== editName,
            );
          })}
          handleSubmit={handleModalSubmit}
          isOpen={isDialogOpen}
          onCancel={handleDialogClose}
          modalStyle={{ width: '700px' }}
        />
      )}
      {state.showAnimalsStep && hasDairyCattle ? (
        <TabsMaterial
          activeTab={3}
          tabLabel={['Add Animals', 'Manure & Imports', 'Storage', 'Nutrient Analysis']}
        />
      ) : (
        <TabsMaterial
          activeTab={1}
          tabLabel={['Manure & Imports', 'Nutrient Analysis']}
        />
      )}
      <DataGrid
        sx={{ ...customTableStyle, marginTop: '1.25rem' }}
        rows={nutrientAnalysisData.map((ele) => ({ ...ele, ...ele.Nutrients }))}
        columns={nutrientTableColumns}
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
        >
          Next
        </Button>
      </ButtonGroup>
    </StyledContent>
  );
}
