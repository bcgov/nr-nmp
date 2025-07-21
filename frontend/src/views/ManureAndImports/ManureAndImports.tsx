/* eslint-disable eqeqeq */
import { useState, useEffect, useContext, useMemo } from 'react';
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
import { APICacheContext } from '@/context/APICacheContext';
import {
  NMPFileImportedManureData,
  LiquidManureConversionFactors,
  SolidManureConversionFactors,
  SelectOption,
  AnimalData,
  ManureType,
} from '@/types';
import {
  DefaultSolidManureConversionFactors,
  DefaultLiquidManureConversionFactors,
  DefaultManureFormData,
} from '@/constants';
import { getDensityFactoredConversionUsingMoisture } from '@/calculations/ManureAndCompost/ManureAndImports/Calculations';
import { StyledContent } from './manureAndImports.styles';
import useAppState from '@/hooks/useAppState';
import {
  ADD_ANIMALS,
  CROPS,
  FARM_INFORMATION,
  NUTRIENT_ANALYSIS,
  STORAGE,
} from '@/constants/routes';

import { AppTitle, PageTitle, ProgressStepper, TabsMaterial } from '../../components/common';
import { addRecordGroupStyle, customTableStyle, tableActionButtonCss } from '@/common.styles';
import ManureImportModal from './ManureImportModal';
import { booleanChecker, liquidSolidManureDisplay } from '@/utils/utils';

// Create a new component for crops manure and imports for now
export default function ManureAndImports() {
  const { state, dispatch } = useAppState();
  const navigate = useNavigate();
  const apiCache = useContext(APICacheContext);

  const [animalList] = useState<Array<AnimalData>>(state.nmpFile.years[0]?.FarmAnimals || []);

  const [cattleSubtypeList, setCattleSubtypeList] = useState<SelectOption[]>([]);
  const [editMaterialName, setEditMaterialName] = useState<string | null>(null);
  const [manures, setManures] = useState<NMPFileImportedManureData[]>(
    state.nmpFile.years[0]?.ImportedManures || [],
  );
  const [solidManureDropdownOptions, setSolidManureDropdownOptions] = useState<
    SolidManureConversionFactors[]
  >([DefaultSolidManureConversionFactors]);
  const [liquidManureDropdownOptions, setLiquidManureDropdownOptions] = useState<
    LiquidManureConversionFactors[]
  >([DefaultLiquidManureConversionFactors]);
  const [manureFormData, setManureFormData] =
    useState<NMPFileImportedManureData>(DefaultManureFormData);

  const hasDairyCattle = useMemo(
    () => animalList.some((animal) => animal.animalId === '2'),
    [animalList],
  );

  const handleSubmit = (data: NMPFileImportedManureData) => {
    let updatedManureFormData: NMPFileImportedManureData;

    if (data.ManureType === ManureType.Liquid) {
      const liquidManureConversionFactor = liquidManureDropdownOptions.find(
        (item) => item.inputunit == data.Units,
      );

      const annualAmountUSGallonsVolume =
        (data.AnnualAmount ?? 0) *
        (liquidManureConversionFactor?.usgallonsoutput
          ? parseFloat(liquidManureConversionFactor.usgallonsoutput)
          : 0);

      updatedManureFormData = {
        ...data,
        AnnualAmountUSGallonsVolume: annualAmountUSGallonsVolume,
        AnnualAmountDisplayVolume: `${Math.round((annualAmountUSGallonsVolume * 10) / 10).toString()} U.S. gallons`,
      };
    } else if (data.ManureType === ManureType.Solid) {
      const solidManureConversionFactor = solidManureDropdownOptions.find(
        (item) => item.inputunit == data.Units,
      );

      const annualAmountCubicMetersVolume =
        (data.AnnualAmount ?? 0) *
        getDensityFactoredConversionUsingMoisture(
          Number(data.Moisture),
          solidManureConversionFactor?.cubicmetersoutput || '',
        );

      const annualAmountCubicYardsVolume =
        (data.AnnualAmount ?? 0) *
        getDensityFactoredConversionUsingMoisture(
          Number(data.Moisture),
          solidManureConversionFactor?.cubicyardsoutput || '',
        );

      const annualAmountTonsWeight =
        (data.AnnualAmount ?? 0) *
        getDensityFactoredConversionUsingMoisture(
          Number(data.Moisture),
          solidManureConversionFactor?.metrictonsoutput || '',
        );

      updatedManureFormData = {
        ...data,
        AnnualAmountCubicYardsVolume: annualAmountCubicYardsVolume,
        AnnualAmountCubicMetersVolume: annualAmountCubicMetersVolume,
        AnnualAmountDisplayVolume: `${Math.round((annualAmountCubicYardsVolume * 10) / 10).toString()} yards³ (${Math.round((annualAmountCubicMetersVolume * 10) / 10).toString()} m³)`,
        AnnualAmountDisplayWeight: `${Math.round((annualAmountTonsWeight * 10) / 10).toString()} tons`,
      };
    } else {
      throw new Error("Manure type isn't set.");
    }

    if (editMaterialName !== null) {
      const updatedManures = manures.map((manure) =>
        manure.UniqueMaterialName === editMaterialName ? updatedManureFormData : manure,
      );

      setManures(updatedManures);
      setEditMaterialName(null);
    } else {
      setManures([...manures, updatedManureFormData]);
    }
  };

  const handleNextPage = () => {
    if (!state.nmpFile.farmDetails.Year) {
      // We should show an error popup, but for now force-navigate back to Farm Information
      navigate(FARM_INFORMATION);
    }
    dispatch({
      type: 'SAVE_IMPORTED_MANURE',
      year: state.nmpFile.farmDetails.Year!,
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
      year: state.nmpFile.farmDetails.Year!,
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
      .then((response: { status?: any; data: any }) => {
        if (response.status === 200) {
          const { data } = response;
          setLiquidManureDropdownOptions(data);
        }
      });
    apiCache
      .callEndpoint('api/solidmaterialsconversionfactors/')
      .then((response: { status?: any; data: any }) => {
        if (response.status === 200) {
          const { data } = response;
          setSolidManureDropdownOptions(data);
        }
      });

    apiCache.callEndpoint('api/animal_subtypes/2/').then((response) => {
      if (response.status === 200) {
        const { data } = response;
        const subType: { id: string; label: string }[] = (
          data as { id: number; name: string }[]
        ).map((row) => ({ id: row.id.toString(), label: row.name }));
        setCattleSubtypeList((prev) => [...prev, ...subType]);
      }
    });

    apiCache.callEndpoint('api/animal_subtypes/1/').then((response) => {
      if (response.status === 200) {
        const { data } = response;
        const subType: { id: string; label: string }[] = (
          data as { id: number; name: string }[]
        ).map((row) => ({ id: row.id.toString(), label: row.name }));
        setCattleSubtypeList((prev) => [...prev, ...subType]);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditMaterialName(null);
    setManureFormData(DefaultManureFormData);
  };

  const handleEditRow = (e: GridRenderCellParams) => {
    setEditMaterialName(e.row.UniqueMaterialName);
    setManureFormData(e.row);
    setIsDialogOpen(true);
  };

  const handleDeleteRow = (e: GridRenderCellParams) => {
    setManures((prev) => prev.filter((ele) => ele.UniqueMaterialName !== e.row.UniqueMaterialName));
  };

  const columnsAnimalManure: GridColDef[] = useMemo(
    () => [
      {
        field: 'animalId',
        headerName: 'Animal Type',
        width: 200,
        minWidth: 150,
        maxWidth: 300,
        valueGetter: (param: string | number) => (param === '1' ? 'Beef Cattle' : 'Dairy Cattle'),
      },
      {
        field: 'subtype',
        headerName: 'Animal Sub Type',
        width: 325,
        minWidth: 150,
        maxWidth: 500,
        valueGetter: (param: string | number) =>
          cattleSubtypeList?.find((ele) => ele.id === param)?.label || param,
      },
      {
        field: 'manureData',
        headerName: 'Amount Collected Per Year',
        width: 175,
        minWidth: 125,
        maxWidth: 500,
        valueGetter: (params: any) => liquidSolidManureDisplay(params),
      },
    ],
    [cattleSubtypeList],
  );

  const columnsImportedManure: GridColDef[] = useMemo(
    () => [
      {
        field: 'UniqueMaterialName',
        headerName: 'Material Name',
        width: 125,
        minWidth: 150,
        maxWidth: 300,
      },
      {
        field: 'ManureType',
        headerName: 'Material Type',
        width: 125,
        minWidth: 150,
        maxWidth: 300,
        valueGetter: (param: number) => ManureType[param],
      },
      {
        field: 'AnnualAmountDisplayVolume',
        headerName: 'Annual Amount (Vol)',
        width: 150,
        minWidth: 125,
        maxWidth: 300,
      },
      {
        field: 'AnnualAmountDisplayWeight',
        headerName: 'Annual Amount (Weight)',
        width: 150,
        minWidth: 125,
        maxWidth: 300,
      },
      {
        field: 'IsMaterialStored',
        headerName: 'Stored',
        width: 75,
        minWidth: 75,
        maxWidth: 300,
        valueGetter: (param: boolean | string) => (booleanChecker(param) ? 'Yes' : 'No'),
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
      {state.showAnimalsStep ? (
        <PageTitle title="Animals and Manure" />
      ) : (
        <PageTitle title="Manure and Compost" />
      )}
      <>
        <div css={addRecordGroupStyle}>
          <ButtonGovGroup
            alignment="end"
            ariaLabel="A group of buttons"
            orientation="horizontal"
          >
            <ButtonGov
              size="medium"
              aria-label="Add manure"
              onPress={() => setIsDialogOpen(true)}
              variant="secondary"
            >
              Add Manure
            </ButtonGov>
          </ButtonGovGroup>
        </div>
        <ManureImportModal
          key={isDialogOpen.toString()}
          initialModalData={manureFormData}
          handleDialogClose={handleDialogClose}
          handleSubmit={handleSubmit}
          manuresList={manures}
          isOpen={isDialogOpen}
          onOpenChange={handleDialogClose}
          isDismissable
        />
        {state.showAnimalsStep && hasDairyCattle ? (
          <TabsMaterial
            activeTab={1}
            tabLabel={['Add Animals', 'Manure & Imports', 'Storage', 'Nutrient Analysis']}
          />
        ) : state.showAnimalsStep ? (
          <TabsMaterial
            activeTab={1}
            tabLabel={['Add Animals', 'Manure & Imports', 'Nutrient Analysis']}
          />
        ) : (
          <TabsMaterial
            activeTab={0}
            tabLabel={['Manure & Imports', 'Nutrient Analysis']}
          />
        )}
      </>
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
          Back
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
