/**
 * @summary The nutrient analysis tab on the manure page for the application
 */

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Button, Button as ButtonGov, ButtonGroup } from '@bcgov/design-system-react-components';
import { AppTitle, PageTitle, ProgressStepper } from '../../components/common';
import { StyledContent } from './nutrientAnalsysis.styles';
import { NMPFile, NMPFileImportedManureData } from '@/types';
import useAppService from '@/services/app/useAppService';
import { CALCULATE_NUTRIENTS, NUTRIENT_ANALYSIS, MANURE_IMPORTS } from '@/constants/RouteConstants';
import { saveFarmManuresToFile } from '@/utils/utils';
import { NMPFileFarmManureData } from '@/types/NMPFileFarmManureData';
import NMPFileGeneratedManureData from '@/types/NMPFileGeneratedManureData';
import { defaultNMPFile, defaultNMPFileYear } from '@/constants';
import { customTableStyle, tableActionButtonCss } from '@/common.styles';
import NutrientAnalysisModal from './NutrientAnalysisModal';

export default function NutrientAnalysis() {
  const { state, setNMPFile } = useAppService();
  const parsedFile: NMPFile = useMemo(() => {
    if (state.nmpFile) {
      return JSON.parse(state.nmpFile);
    }
    // TODO: Once we cache state, throw error if uninitialized
    return { ...defaultNMPFile, years: [{ ...defaultNMPFileYear }] };
  }, [state.nmpFile]);
  const manures: (NMPFileImportedManureData | NMPFileGeneratedManureData)[] = useMemo(
    () =>
      (parsedFile.years[0]?.ImportedManures || []).concat(
        parsedFile.years[0]?.GeneratedManures || [],
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const navigate = useNavigate();

  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [editName, setEditName] = useState<string | null>(null);
  // for each manuresource user can create nutrient analysis' objects
  // replace with nmpfile
  const [nutrientAnalysisData, setNutrientAnalysisData] = useState<NMPFileFarmManureData[]>([]);
  // for each manuresource user can create nutrient analysis' objects
  const [analysisForm, setAnalysisForm] = useState<NMPFileFarmManureData | undefined>(undefined);

  const handleEdit = (name: string) => {
    setEditName(name);
    setAnalysisForm(nutrientAnalysisData.find((ele) => ele.ManureSource === name));
    setIsDialogOpen(true);
  };

  const handleDelete = (name: string) => {
    setNutrientAnalysisData((prevState) => prevState.filter((ele) => ele.ManureSource === name));
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

  const handlePrevious = () => {
    navigate(MANURE_IMPORTS);
  };

  const handleNext = () => {
    saveFarmManuresToFile(nutrientAnalysisData, state.nmpFile, setNMPFile);
    navigate(CALCULATE_NUTRIENTS);
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
        field: 'P',
        width: 100,
        minWidth: 100,
        maxWidth: 300,
      },
      {
        headerName: 'K (%)',
        field: 'K',
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
      <ProgressStepper step={NUTRIENT_ANALYSIS} />
      <AppTitle />
      <PageTitle title="Nutrient Analysis" />
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
      {isDialogOpen && (
        <NutrientAnalysisModal
          initialModalData={analysisForm}
          manures={manures.filter((manureEle) => {
            const existingList = nutrientAnalysisData.map(
              (nutrientEle) => nutrientEle.ManureSource,
            );
            return !existingList.some((ele) => ele === manureEle.UniqueMaterialName);
          })}
          handleSubmit={handleModalSubmit}
          isOpen={isDialogOpen}
          onCancel={handleDialogClose}
          modalStyle={{ width: '700px' }}
        />
      )}
      <DataGrid
        sx={{ ...customTableStyle, marginTop: '1.25rem' }}
        rows={nutrientAnalysisData.map((ele) => ({ ...ele, ...ele.Nutrients }))}
        columns={nutrientTableColumns}
        getRowId={(row: any) => row.ManureSource}
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
