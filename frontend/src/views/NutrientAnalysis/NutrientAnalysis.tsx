/**
 * @summary The nutrient analysis tab on the manure page for the application
 */

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Button, ButtonGroup } from '@bcgov/design-system-react-components';
import { Tabs, View } from '../../components/common';
import {
  AnimalData,
  DAIRY_COW_ID,
  NMPFileImportedManureData,
  NMPFileManureStorageSystem,
  NMPFileNutrientAnalysisData,
} from '@/types';
import useAppState from '@/hooks/useAppState';
import { MANURE_IMPORTS, FIELD_LIST, CALCULATE_NUTRIENTS, STORAGE } from '@/constants/routes';
import NMPFileGeneratedManureData from '@/types/NMPFileGeneratedManureData';
import { addRecordGroupStyle, customTableStyle, tableActionButtonCss } from '@/common.styles';
import NutrientAnalysisModal from './NutrientAnalysisModal';

const TEST_MANURE_NUTRIENTS: NMPFileNutrientAnalysisData[] = [
  {
    materialSource: '111',
    Moisture: '',
    N: 1,
    NH4N: 2,
    P2O5: 3,
    K2O: 4,
    ManureId: 1,
    SolidLiquid: 'liquid',
    linkedUuid: 'uuuid1',
    nMineralizationId: 1,
    bookLab: 'book',
    UniqueMaterialName: 'string1',
    materialType: '',
  },
  {
    materialSource: '222',
    Moisture: '',
    N: 5,
    NH4N: 6,
    P2O5: 7,
    K2O: 8,
    ManureId: 1,
    SolidLiquid: 'liquid',
    linkedUuid: 'uuuid2',
    nMineralizationId: 1,
    bookLab: 'book',
    UniqueMaterialName: 'string2',
    materialType: '',
  },
  {
    materialSource: '333',
    Moisture: '',
    N: 9,
    NH4N: 9,
    P2O5: 9,
    K2O: 9,
    ManureId: 2,
    SolidLiquid: 'solid',
    linkedUuid: 'uuuid3',
    nMineralizationId: 1,
    bookLab: 'book',
    UniqueMaterialName: 'string3',
    materialType: '',
  },
];

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
  const storageSystems: NMPFileManureStorageSystem[] = useMemo(
    () => state.nmpFile.years[0].ManureStorageSystems || [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [editName, setEditName] = useState<string | null>(null);
  // for each manuresource user can create nutrient analysis' objects
  const [nutrientAnalysisData, setNutrientAnalysisData] = useState<NMPFileNutrientAnalysisData[]>(
    // TEST_MANURE_NUTRIENTS,
    state.nmpFile.years[0]?.NutrientAnalysis || [],
  );
  // for each manuresource user can create nutrient analysis' objects
  const [analysisForm, setAnalysisForm] = useState<NMPFileNutrientAnalysisData | undefined>(
    undefined,
  );

  const hasDairyCattle = useMemo(
    () =>
      state.nmpFile.years[0]?.FarmAnimals?.some(
        (animal: AnimalData) => animal.animalId === DAIRY_COW_ID,
      ),
    [state.nmpFile.years],
  );

  const handleEdit = (name: string) => {
    setEditName(name);
    setAnalysisForm(nutrientAnalysisData.find((ele) => ele.linkedUuid === name));
    setIsDialogOpen(true);
  };

  const handleDelete = (name: string) => {
    setNutrientAnalysisData((prevState) => prevState.filter((ele) => ele.materialSource !== name));
  };
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setAnalysisForm(undefined);
    setEditName(null);
  };

  const handleModalSubmit = (data: NMPFileNutrientAnalysisData) => {
    setNutrientAnalysisData((prevState) => {
      // if editing an entry then updates that entry
      if (editName !== null) {
        return prevState.map((item: NMPFileNutrientAnalysisData) =>
          item.linkedUuid === editName ? { ...data } : item,
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
      type: 'SAVE_NUTRIENT_ANALYSIS',
      year: state.nmpFile.farmDetails.Year!,
      newNutrientAnalysis: nutrientAnalysisData,
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
      year: state.nmpFile.farmDetails.Year!,
      newNutrientAnalysis: nutrientAnalysisData,
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
        field: 'materialSource',
        width: 200,
        minWidth: 100,
        maxWidth: 300,
        sortable: false,
      },
      {
        headerName: 'Moisture',
        field: 'Moisture',
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
        headerName: 'NH4-N (%)',
        field: 'NH4N',
        width: 100,
        minWidth: 100,
        maxWidth: 300,
        sortable: false,
      },
      {
        headerName: 'P (%)',
        field: 'P2O5',
        width: 100,
        minWidth: 100,
        maxWidth: 300,
        sortable: false,
      },
      {
        headerName: 'K (%)',
        field: 'K2O',
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
              onClick={() => handleEdit(row.row.linkedUuid)}
              icon={faEdit}
              aria-label="Edit"
            />
            <FontAwesomeIcon
              css={tableActionButtonCss}
              onClick={() => handleDelete(row.row.linkedUuid)}
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
        // rows={nutrientAnalysisData.map((ele) => ({ ...ele, ...ele.Nutrients }))}
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
