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
  NMPFile,
  SelectOption,
  DAIRY_COW_ID,
  MILKING_COW_ID,
  AnimalData,
} from '@/types';
import {
  DefaultSolidManureConversionFactors,
  DefaultLiquidManureConversionFactors,
  DefaultManureFormData,
  defaultNMPFile,
  defaultNMPFileYear,
} from '@/constants';
import { getDensityFactoredConversionUsingMoisture } from '@/calculations/ManureAndCompost/ManureAndImports/Calculations';
import { StyledContent } from './manureAndImports.styles';
import useAppService from '@/services/app/useAppService';
import {
  ADD_ANIMALS,
  FARM_INFORMATION,
  FIELD_LIST,
  NUTRIENT_ANALYSIS,
} from '@/constants/RouteConstants';
import NMPFileGeneratedManureData from '@/types/NMPFileGeneratedManureData';
import DefaultGeneratedManureFormData from '@/constants/DefaultGeneratedManureData';
import { getLiquidManureDisplay, getSolidManureDisplay, initAnimals } from '../AddAnimals/utils';

import { AppTitle, PageTitle, ProgressStepper, TabsMaterial } from '../../components/common';
import { addRecordGroupStyle, customTableStyle, tableActionButtonCss } from '@/common.styles';
import ManureImportModal from './ManureImportModal';
import { booleanChecker, liquidSolidManureDisplay } from '@/utils/utils';

export default function ManureAndImports() {
  const { state, setNMPFile, setShowAnimalsStep } = useAppService();
  const parsedFile: NMPFile = useMemo(() => {
    if (state.nmpFile) {
      return JSON.parse(state.nmpFile);
    }
    // TODO: Once we cache state, throw error if uninitialized
    return { ...defaultNMPFile, years: [{ ...defaultNMPFileYear }] };
  }, [state.nmpFile]);
  const navigate = useNavigate();
  const apiCache = useContext(APICacheContext);

  const [animalList] = useState<Array<AnimalData>>(initAnimals(state));

  const [cattleSubtypeList, setCattleSubtypeList] = useState<SelectOption[]>([]);
  const [editMaterialName, setEditMaterialName] = useState<string | null>(null);
  const [manures, setManures] = useState<NMPFileImportedManureData[]>(
    parsedFile.years[0]?.ImportedManures || [],
  );
  const generatedManures: NMPFileGeneratedManureData[] = useMemo(() => {
    const farmAnimals = parsedFile.years[0]?.FarmAnimals;
    if (farmAnimals === undefined) {
      return [];
    }
    const gManures: NMPFileGeneratedManureData[] = [];
    for (let i = 0; i < farmAnimals.length; i += 1) {
      const animal = farmAnimals[i];
      if (animal.manureData !== undefined) {
        if (animal.animalId === DAIRY_COW_ID && animal.subtype === MILKING_COW_ID) {
          // TODO: Add wash water as manure. We're ignoring a lot of dairy cow stuff for now
        }

        if (animal.manureData.annualSolidManure !== undefined) {
          gManures.push({
            ...DefaultGeneratedManureFormData,
            index: gManures.length,
            UniqueMaterialName: animal.manureData.name,
            ManureTypeName: '2',
            AnnualAmount: animal.manureData.annualSolidManure,
            AnnualAmountTonsWeight: animal.manureData.annualSolidManure,
            AnnualAmountDisplayWeight: getSolidManureDisplay(animal.manureData.annualSolidManure),
          });
        } else {
          gManures.push({
            ...DefaultGeneratedManureFormData,
            index: gManures.length,
            UniqueMaterialName: animal.manureData.name,
            ManureTypeName: '1',
            AnnualAmount: animal.manureData.annualLiquidManure,
            AnnualAmountUSGallonsVolume: animal.manureData.annualLiquidManure,
            AnnualAmountDisplayWeight: getLiquidManureDisplay(animal.manureData.annualLiquidManure),
          });
        }
      }
    }
    return gManures;
  }, [parsedFile.years]);
  const [solidManureDropdownOptions, setSolidManureDropdownOptions] = useState<
    SolidManureConversionFactors[]
  >([DefaultSolidManureConversionFactors]);
  const [liquidManureDropdownOptions, setLiquidManureDropdownOptions] = useState<
    LiquidManureConversionFactors[]
  >([DefaultLiquidManureConversionFactors]);
  const [manureFormData, setManureFormData] =
    useState<NMPFileImportedManureData>(DefaultManureFormData);

  const handleSubmit = (data: NMPFileImportedManureData) => {
    let updatedManureFormData: NMPFileImportedManureData;

    if (data.ManureType === 1) {
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
    } else if (data.ManureType === 2) {
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

  const handlePrevious = () => {
    // Remove the generated manures, which will be reprocessed when returning to this page
    if (parsedFile.years[0].GeneratedManures !== undefined) {
      const nmpFile = { ...parsedFile };
      nmpFile.years[0].GeneratedManures = undefined;
      setNMPFile(JSON.stringify(nmpFile));
    }

    if (
      parsedFile.years[0]?.FarmAnimals !== undefined &&
      parsedFile.years[0].FarmAnimals.length > 0
    ) {
      navigate(ADD_ANIMALS);
    } else {
      navigate(FARM_INFORMATION);
    }
  };

  const handleNext = () => {
    const nmpFile = { ...parsedFile };
    nmpFile.years[0].ImportedManures = structuredClone(manures);
    nmpFile.years[0].GeneratedManures = structuredClone(generatedManures);
    setNMPFile(JSON.stringify(nmpFile));
    navigate(NUTRIENT_ANALYSIS);
  };

  useEffect(() => {
    // Load animals step to progress stepper
    setShowAnimalsStep(true);

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
    // Check Invalid row index
    if (typeof Number(e?.id) !== 'number') {
      throw new Error('Invalid manure row index');
    }
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
        field: 'ManureTypeName',
        headerName: 'Material Type',
        width: 125,
        minWidth: 150,
        maxWidth: 300,
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
      <ProgressStepper step={FIELD_LIST} />
      <AppTitle />
      <PageTitle title="Manure & Imports" />
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
        <TabsMaterial
          activeTab={1}
          tabLabel={['Add Animals', 'Manure & Imports', 'Nutrient Analysis']}
        />
      </>
      <DataGrid
        sx={{ ...customTableStyle, marginTop: '1.25rem' }}
        rows={animalList}
        columns={columnsAnimalManure}
        getRowId={(row: any) => row.index}
        disableRowSelectionOnClick
        disableColumnMenu
        hideFooterPagination
        hideFooter
      />
      <DataGrid
        sx={{ ...customTableStyle, marginTop: '1.25rem' }}
        rows={manures}
        columns={columnsImportedManure}
        getRowId={(row: any) => row.UniqueMaterialName}
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
