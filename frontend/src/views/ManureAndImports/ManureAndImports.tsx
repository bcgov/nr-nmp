import { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Button, ButtonGroup } from '@bcgov/design-system-react-components';
import { DataGrid, GridColDef, GridRowId, GridRenderCellParams } from '@mui/x-data-grid';
import { GridApiCommunity } from '@mui/x-data-grid/internals';
import { APICacheContext } from '@/context/APICacheContext';
import {
  NMPFileImportedManure,
  LiquidManureConversionFactors,
  SolidManureConversionFactors,
  NMPFileAnimal,
  ManureType,
  Animal,
} from '@/types';
import { getDensityFactoredConversionUsingMoisture } from '@/utils/densityCalculations';
import useAppState from '@/hooks/useAppState';
import { ADD_ANIMALS, CROPS, NUTRIENT_ANALYSIS, STORAGE } from '@/constants/routes';

import { AlertDialog, Tabs, View } from '@/components/common';
import { addRecordGroupStyle, customTableStyle, tableActionButtonCss } from '@/common.styles';
import ManureImportModal from './ManureImportModal';
import { booleanChecker, liquidSolidManureDisplay, printNum } from '@/utils/utils';
import { DAIRY_COW_ID } from '@/constants';

// Create a new component for crops manure and imports for now
export default function ManureAndImports() {
  const { state, dispatch } = useAppState();
  const navigate = useNavigate();
  const apiCache = useContext(APICacheContext);

  const [animalList] = useState<Array<NMPFileAnimal>>(state.nmpFile.years[0]?.farmAnimals || []);

  const [animals, setAnimals] = useState<Animal[]>([]);
  const [rowEditIndex, setRowEditIndex] = useState<number | undefined>(undefined);
  const [manures, setManures] = useState<NMPFileImportedManure[]>(
    state.nmpFile.years[0]?.importedManures || [],
  );
  const [solidManureDropdownOptions, setSolidManureDropdownOptions] = useState<
    SolidManureConversionFactors[]
  >([]);
  const [liquidManureDropdownOptions, setLiquidManureDropdownOptions] = useState<
    LiquidManureConversionFactors[]
  >([]);

  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [dialogText, setDialogText] = useState<string>('');
  const [deleteBtnConfig, setDeleteBtnConfig] = useState<any>({});

  const hasDairyCattle = useMemo(
    () => animalList.some((animal) => animal.animalId === DAIRY_COW_ID),
    [animalList],
  );

  const handleSubmit = (data: NMPFileImportedManure) => {
    let updatedManureFormData: NMPFileImportedManure;

    if (data.manureType === ManureType.Liquid) {
      const liquidManureConversionFactor = liquidManureDropdownOptions.find(
        (item) => item.inputunit === data.units,
      );

      const annualAmountUSGallonsVolume =
        (data.annualAmount || 0) *
        (liquidManureConversionFactor?.usgallonsoutput
          ? parseFloat(liquidManureConversionFactor.usgallonsoutput)
          : 0);

      updatedManureFormData = {
        ...data,
        annualAmountUSGallonsVolume,
        annualAmountDisplayVolume: `${printNum(annualAmountUSGallonsVolume)} U.S. gallons`,
      };
    } else if (data.manureType === ManureType.Solid) {
      const solidManureConversionFactor = solidManureDropdownOptions.find(
        (item) => item.inputunit === data.units,
      );

      const annualAmountCubicMetersVolume =
        (data.annualAmount || 0) *
        getDensityFactoredConversionUsingMoisture(
          data.moisture || 0,
          solidManureConversionFactor?.cubicmetersoutput || '',
        );

      const annualAmountCubicYardsVolume =
        (data.annualAmount || 0) *
        getDensityFactoredConversionUsingMoisture(
          data.moisture || 0,
          solidManureConversionFactor?.cubicyardsoutput || '',
        );

      const annualAmountTonsWeight =
        (data.annualAmount || 0) *
        getDensityFactoredConversionUsingMoisture(
          data.moisture || 0,
          solidManureConversionFactor?.ustonsoutput || '',
        );

      updatedManureFormData = {
        ...data,
        annualAmountCubicYardsVolume,
        annualAmountCubicMetersVolume,
        annualAmountTonsWeight,
        annualAmountDisplayVolume: `${printNum(annualAmountCubicYardsVolume)} yards³ (${printNum(annualAmountCubicMetersVolume)} m³)`,
        annualAmountDisplayWeight: `${printNum(annualAmountTonsWeight)} tons`,
      };
    } else {
      throw new Error("Manure type isn't set.");
    }

    if (rowEditIndex !== undefined) {
      const updatedManures = [...manures];
      updatedManures[rowEditIndex] = updatedManureFormData;

      setManures(updatedManures);
      setRowEditIndex(undefined);
    } else {
      setManures([...manures, updatedManureFormData]);
    }
  };

  const handleNextPage = () => {
    dispatch({
      type: 'SAVE_IMPORTED_MANURE',
      year: state.nmpFile.farmDetails.year,
      newManures: manures,
    });
    if (hasDairyCattle) {
      navigate(STORAGE);
    } else {
      navigate(NUTRIENT_ANALYSIS);
    }
  };

  const handlePreviousPage = () => {
    dispatch({
      type: 'SAVE_IMPORTED_MANURE',
      year: state.nmpFile.farmDetails.year,
      newManures: manures,
    });
    if (state.showAnimalsStep) {
      navigate(ADD_ANIMALS);
    } else {
      navigate(CROPS);
    }
  };

  useEffect(() => {
    apiCache
      .callEndpoint('api/liquidmaterialsconversionfactors/')
      .then((response: { status?: any; data: LiquidManureConversionFactors[] }) => {
        if (response.status === 200) {
          setLiquidManureDropdownOptions(response.data);
        }
      });
    apiCache
      .callEndpoint('api/solidmaterialsconversionfactors/')
      .then((response: { status?: any; data: SolidManureConversionFactors[] }) => {
        if (response.status === 200) {
          setSolidManureDropdownOptions(response.data);
        }
      });
    apiCache.callEndpoint('/api/animals/').then((response: { status?: any; data: Animal[] }) => {
      if (response.status === 200) {
        setAnimals(response.data);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setRowEditIndex(undefined);
  };

  const handleEditRow = (e: { id: GridRowId; api: GridApiCommunity }) => {
    setRowEditIndex(e.api.getRowIndexRelativeToVisibleRows(e.id));
    setIsDialogOpen(true);
  };

  const handleDeleteRow = (e: { id: GridRowId; api: GridApiCommunity }) => {
    setManures((prev) => {
      const index = e.api.getRowIndexRelativeToVisibleRows(e.id);
      const newList = [...prev];
      newList.splice(index, 1);
      return newList;
    });
  };

  const columnsAnimalManure: GridColDef[] = useMemo(
    () => [
      {
        field: 'animalId',
        headerName: 'Animal Type',
        width: 200,
        minWidth: 150,
        maxWidth: 300,
        valueGetter: (val: any) => animals.find((ele) => String(ele.id) === val)?.name || val,
        sortable: false,
      },
      {
        field: 'uuid',
        headerName: 'Animal Sub Type',
        width: 325,
        minWidth: 150,
        maxWidth: 500,
        valueGetter: (val: string) => animalList.find((a) => a.uuid === val)!.manureData?.name,
        sortable: false,
      },
      {
        field: 'manureData',
        headerName: 'Amount Collected Per Year',
        width: 175,
        minWidth: 125,
        maxWidth: 500,
        valueGetter: (params: any) => liquidSolidManureDisplay(params),
        sortable: false,
      },
    ],
    [animalList, animals],
  );

  const columnsImportedManure: GridColDef[] = useMemo(
    () => [
      {
        field: 'uniqueMaterialName',
        headerName: 'Material Name',
        width: 125,
        minWidth: 150,
        maxWidth: 300,
        sortable: false,
      },
      {
        field: 'manureType',
        headerName: 'Material Type',
        width: 125,
        minWidth: 150,
        maxWidth: 300,
        valueGetter: (param: number) => ManureType[param],
        sortable: false,
      },
      {
        field: 'annualAmountDisplayVolume',
        headerName: 'Annual Amount (Vol)',
        width: 150,
        minWidth: 125,
        maxWidth: 300,
        sortable: false,
      },
      {
        field: 'annualAmountDisplayWeight',
        headerName: 'Annual Amount (Weight)',
        width: 150,
        minWidth: 125,
        maxWidth: 300,
        sortable: false,
      },
      {
        field: 'assignedToStoredSystem',
        headerName: 'Stored',
        width: 75,
        minWidth: 75,
        maxWidth: 300,
        valueGetter: (param: boolean | string) => (booleanChecker(param) ? 'Yes' : 'No'),
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
              onClick={() => handleEditRow(row)}
              icon={faEdit}
              aria-label="Edit"
            />
            <FontAwesomeIcon
              css={tableActionButtonCss}
              onClick={() => {
                setDialogText(`Are you sure you want to delete ${row.row.managedManureName}?`);
                setDeleteBtnConfig({
                  btnText: 'Delete',
                  handleClick: () => {
                    handleDeleteRow(row);
                    setShowDeleteDialog(false);
                  },
                });
                setShowDeleteDialog(true);
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
    [],
  );

  return (
    <View
      title={state.showAnimalsStep ? 'Animals and Manure' : 'Manure and Compost'}
      handleBack={handlePreviousPage}
      handleNext={handleNextPage}
    >
      <AlertDialog
        isOpen={showDeleteDialog}
        title="Manure and Imports - Delete"
        onOpenChange={() => setShowDeleteDialog(false)}
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
            Add Manure
          </Button>
        </ButtonGroup>
      </div>
      {isDialogOpen && (
        <ManureImportModal
          initialModalData={rowEditIndex !== undefined ? manures[rowEditIndex] : undefined}
          handleDialogClose={handleDialogClose}
          handleSubmit={handleSubmit}
          manuresList={manures}
          isOpen={isDialogOpen}
        />
      )}
      {state.showAnimalsStep && hasDairyCattle ? (
        <Tabs
          activeTab={1}
          tabLabel={['Add Animals', 'Manure & Imports', 'Storage', 'Nutrient Analysis']}
        />
      ) : state.showAnimalsStep ? (
        <Tabs
          activeTab={1}
          tabLabel={['Add Animals', 'Manure & Imports', 'Nutrient Analysis']}
        />
      ) : (
        <Tabs
          activeTab={0}
          tabLabel={['Manure & Imports', 'Nutrient Analysis']}
        />
      )}
      {state.showAnimalsStep ? (
        <DataGrid
          sx={{ ...customTableStyle, marginTop: '1.25rem' }}
          rows={animalList}
          columns={columnsAnimalManure}
          getRowId={() => crypto.randomUUID()}
          disableRowSelectionOnClick
          disableColumnMenu
          hideFooterPagination
          hideFooter
        />
      ) : null}
      <DataGrid
        sx={{ ...customTableStyle, marginTop: '1.25rem' }}
        rows={manures}
        columns={columnsImportedManure}
        getRowId={() => crypto.randomUUID()}
        disableRowSelectionOnClick
        disableColumnMenu
        hideFooterPagination
        hideFooter
      />
    </View>
  );
}
