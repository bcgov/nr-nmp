/**
 * @summary This is the Add Animal list Tab
 */
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { DataGrid, GridColDef, GridRowId } from '@mui/x-data-grid';
import { GridApiCommunity } from '@mui/x-data-grid/internals';
import { Button, ButtonGroup } from '@bcgov/design-system-react-components';
import { customTableStyle, tableActionButtonCss, addRecordGroupStyle } from '../../common.styles';
import useAppState from '@/hooks/useAppState';
import { AppTitle, PageTitle, Tabs } from '@/components/common';
import { AnimalData, BEEF_COW_ID, DAIRY_COW_ID, POULTRY_ID } from '@/types';
import { FARM_INFORMATION, MANURE_IMPORTS } from '@/constants/routes';
import ProgressStepper from '@/components/common/ProgressStepper/ProgressStepper';
import {
  DoubleRowStyle,
  ErrorText,
  specialTableRowStyle,
  StyledContent,
} from './addAnimals.styles';
import AddAnimalsModal from './AddAnimalsModal';
import { isDairyAndMilkingCattle, liquidSolidManureDisplay } from '@/utils/utils';
import { calculateAnnualWashWater } from './utils';

export default function AddAnimals() {
  const { state, dispatch } = useAppState();
  const [rowEditIndex, setRowEditIndex] = useState<number | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [showViewError, setShowViewError] = useState<string>('');

  const navigate = useNavigate();

  const [animalList, setAnimalList] = useState<Array<AnimalData>>(
    state.nmpFile.years[0].FarmAnimals || [],
  );

  useEffect(() => {
    dispatch({ type: 'SET_SHOW_ANIMALS_STEP', showAnimalsStep: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasDairyCattle = useMemo(
    () => state.nmpFile.years[0].FarmAnimals?.some((animal: AnimalData) => animal.animalId === '2'),
    [state.nmpFile.years],
  );

  const tabs = useMemo(
    () =>
      hasDairyCattle
        ? ['Add Animals', 'Manure & Imports', 'Storage', 'Nutrient Analysis']
        : ['Add Animals', 'Manure & Imports', 'Nutrient Analysis'],
    [hasDairyCattle],
  );

  const handleEditRow = React.useCallback((e: { id: GridRowId; api: GridApiCommunity }) => {
    setRowEditIndex(e.api.getRowIndexRelativeToVisibleRows(e.id));
    setIsDialogOpen(true);
  }, []);

  const handleDeleteRow = (e: { id: GridRowId; api: GridApiCommunity }) => {
    setAnimalList((prev) => {
      const index = e.api.getRowIndexRelativeToVisibleRows(e.id);
      const newList = [...prev];
      newList.splice(index, 1);
      return newList;
    });
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setRowEditIndex(undefined);
  };

  const handleNextPage = () => {
    if (!state.nmpFile.farmDetails.Year) {
      // We should show an error popup, but for now force-navigate back to Farm Information
      navigate(FARM_INFORMATION);
    }
    if (animalList.length) {
      dispatch({
        type: 'SAVE_ANIMALS',
        year: state.nmpFile.farmDetails.Year!,
        newAnimals: animalList,
      });
      navigate(MANURE_IMPORTS);
    } else {
      setShowViewError('You must add at least one animal before continuing.');
    }
  };

  const handlePreviousPage = () => {
    if (animalList.length) {
      dispatch({
        type: 'SAVE_ANIMALS',
        year: state.nmpFile.farmDetails.Year!,
        newAnimals: animalList,
      });
    }
    navigate(FARM_INFORMATION);
  };

  // Same columns are in ManureAndImports.tsx
  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'animalId',
        headerName: 'Animal Type',
        width: 175,
        valueGetter: (params: any) => {
          const animalTypeMap: { [key: string]: string } = {
            [BEEF_COW_ID]: 'Beef Cattle',
            [DAIRY_COW_ID]: 'Dairy Cattle',
            [POULTRY_ID]: 'Poultry',
          };
          return animalTypeMap[params] || params;
        },
        renderCell: (params: any) => {
          if (isDairyAndMilkingCattle(params.row.animalId, params.row.subtype)) {
            return (
              <span css={specialTableRowStyle}>
                <DoubleRowStyle>{params.value}</DoubleRowStyle>
                <DoubleRowStyle>Milking center wash water</DoubleRowStyle>
              </span>
            );
          }
          return <div>{params.value}</div>;
        },
      },
      {
        field: 'manureData',
        headerName: 'Annual Manure',
        width: 200,
        minWidth: 155,
        maxWidth: 300,
        valueGetter: (params: any) => liquidSolidManureDisplay(params),
        renderCell: (params: any) => {
          const { animalId, animalsPerFarm, subtype, washWater, washWaterUnit } = params.row;
          if (isDairyAndMilkingCattle(animalId, subtype)) {
            const washWaterGallons = calculateAnnualWashWater(
              washWater,
              washWaterUnit,
              animalsPerFarm,
            );
            return (
              <span css={specialTableRowStyle}>
                <DoubleRowStyle>{params.value}</DoubleRowStyle>
                <DoubleRowStyle>{washWaterGallons} U.S. gallons</DoubleRowStyle>
              </span>
            );
          }
          return <div>{params.value}</div>;
        },
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 120,
        renderCell: (row: any) => (
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
      },
    ],
    [handleEditRow],
  );

  return (
    <StyledContent>
      <ProgressStepper />
      <AppTitle />
      <PageTitle title="Livestock Information" />
      <>
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
              Add Animal
            </Button>
          </ButtonGroup>
        </div>
        {isDialogOpen && (
          <AddAnimalsModal
            initialModalData={rowEditIndex !== undefined ? animalList[rowEditIndex] : undefined}
            rowEditIndex={rowEditIndex}
            setAnimalList={setAnimalList}
            isOpen={isDialogOpen}
            onClose={handleDialogClose}
            modalStyle={{ width: '700px' }}
          />
        )}
      </>
      <Tabs
        activeTab={0}
        tabLabel={tabs}
      />
      <DataGrid
        sx={{ ...customTableStyle, marginTop: '1.25rem' }}
        rows={animalList}
        columns={columns}
        getRowId={() => crypto.randomUUID()}
        disableRowSelectionOnClick
        disableColumnMenu
        hideFooterPagination
        hideFooter
      />
      <ErrorText>{showViewError}</ErrorText>
      <ButtonGroup
        alignment="start"
        ariaLabel="A group of buttons"
        orientation="horizontal"
      >
        <Button
          size="medium"
          variant="secondary"
          onPress={handlePreviousPage}
        >
          Back
        </Button>
        <Button
          size="medium"
          variant="primary"
          onPress={handleNextPage}
          type="submit"
          // imo this button should be disabled instead of showing error text on click
          // isDisabled={animalList.length === 0}
        >
          Next
        </Button>
      </ButtonGroup>
    </StyledContent>
  );
}
