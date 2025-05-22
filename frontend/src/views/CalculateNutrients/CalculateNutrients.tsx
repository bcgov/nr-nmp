/**
 * @summary The calculate nutrients page for the application
 * calculates the field nutrients based on the crops and manure
 */
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Button, ButtonGroup } from '@bcgov/design-system-react-components';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import useAppService from '@/services/app/useAppService';
import { AppTitle, PageTitle, ProgressStepper, TabsMaterial } from '../../components/common';
import NMPFileFieldData from '@/types/NMPFileFieldData';
import { NUTRIENT_ANALYSIS, FIELD_LIST } from '@/constants/RouteConstants';

import { addRecordGroupStyle, customTableStyle, tableActionButtonCss } from '../../common.styles';
import { ErrorText, StyledContent } from '../FieldList/fieldList.styles';
import { initFields } from '../../utils/utils';
import FertilizerModal from './CalculateNutrientsComponents/FertilizerModal';

// calculates the field nutrients based on the crops and manure
export default function CalculateNutrients() {
  const { state, setNMPFile, setShowAnimalsStep } = useAppService();
  const [rowEditIndex, setRowEditIndex] = useState<number | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [showViewError, setShowViewError] = useState<string>('');
  const [buttonClicked, setButtonClicked] = useState<string>('');
  const [activeField, setActiveField] = useState<number>(0);

  const navigate = useNavigate();

  const [fieldList, setFieldList] = useState<Array<NMPFileFieldData>>(
    // Load NMP fields into view, add id key for UI tracking purposes
    // id key removed on save
    initFields(state).map((fieldElement: NMPFileFieldData, index: number) => ({
      ...fieldElement,
      id: index.toString(),
    })),
  );

  useEffect(() => {
    setShowAnimalsStep(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEditRow = React.useCallback((e: { row: AnimalData }) => {
    setRowEditIndex(e.row.index);
    setIsDialogOpen(true);
  }, []);

  const handleDeleteRow = (e: { row: AnimalData }) => {
    setFieldList((prev) => {
      const deleteSpot = prev.findIndex((elem) => elem.index === e.row.index);
      const newList = [...prev];
      newList.splice(deleteSpot, 1);
      return newList;
    });
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setRowEditIndex(undefined);
  };

  const handleNextPage = () => {
    setShowViewError('');

    // if (fieldList.length) {
    //   saveFieldsToFile(
    //     // Delete the id key in each field to prevent saving into NMPfile
    //     // eslint-disable-next-line @typescript-eslint/no-unused-vars
    //     fieldList.map(({ id, ...remainingFields }) => remainingFields),
    //     state.nmpFile,
    //     setNMPFile,
    //   );
    //   navigate(/);
    // } else {
    //   setShowViewError('Must enter at least 1 field');
    // }
  };

  const columns: GridColDef[] = useMemo(
    () => [
      { field: 'Crop', headerName: 'Crop', width: 200, minWidth: 150, maxWidth: 300 },
      {
        field: 'Agronomic',
        headerName: 'Agronomic (lb/ac)',
        width: 150,
        minWidth: 125,
        maxWidth: 300,
      },
      {
        field: 'Crop Removal (lb/ac)',
        headerName: 'Crop Removal (lb/ac)',
        minWidth: 200,
        maxWidth: 300,
      },
      {
        field: '',
        headerName: 'Actions',
        width: 120,
        renderCell: (row: any) => (
          <>
            <FontAwesomeIcon
              css={tableActionButtonCss}
              onClick={() => handleEditRow(row)}
              icon={faEdit}
            />
            <FontAwesomeIcon
              css={tableActionButtonCss}
              onClick={() => handleDeleteRow(row)}
              icon={faTrash}
            />
          </>
        ),
        sortable: false,
        resizable: false,
      },
    ],
    [handleEditRow],
  );

  return (
    <StyledContent>
      <ProgressStepper step={FIELD_LIST} />
      <AppTitle />
      <PageTitle title="Calculate Nutrients" />
      <>
        <div css={addRecordGroupStyle}>
          <ButtonGroup
            alignment="end"
            ariaLabel="A group of buttons"
            orientation="horizontal"
          >
            <Button
              size="medium"
              aria-label="Add Manure"
              onPress={() => {
                setButtonClicked('manure');
                setIsDialogOpen(true);
              }}
              variant="secondary"
            >
              <FontAwesomeIcon icon={faPlus} />
              Add Manure
            </Button>
            <Button
              size="medium"
              aria-label="Add Fertilizer"
              onPress={() => {
                setButtonClicked('fertilizer');
                setIsDialogOpen(true);
              }}
              variant="secondary"
            >
              <FontAwesomeIcon icon={faPlus} />
              Add Fertilizer
            </Button>
            <Button
              size="medium"
              aria-label="Add Other"
              onPress={() => {
                setButtonClicked('other');
                setIsDialogOpen(true);
              }}
              variant="secondary"
            >
              <FontAwesomeIcon icon={faPlus} />
              Add Other
            </Button>
          </ButtonGroup>
        </div>
        {
          isDialogOpen && buttonClicked === 'fertilizer' && (
            // if fertilizer button clicked
            <FertilizerModal
              // initialModalData={
              //   rowEditIndex !== undefined
              //     ? fieldList.find((v) => v.index === rowEditIndex)
              //     : undefined
              // }
              // rowEditIndex={rowEditIndex}
              // setFieldList={setFieldList}
              isOpen={isDialogOpen}
              onCancel={handleDialogClose}
              // modalStyle={{ width: '700px' }}
            />
          )
          // else if manure button clicked
        }
        {/* {isDialogOpen && buttonClicked === 'manure' && ()} */}
      </>
      {/* make the tabs = the fields the user has entered */}
      <TabsMaterial
        activeTab={activeField}
        tabLabel={fieldList.length > 0 ? fieldList.map((field) => field.FieldName) : ['Field 1']}
      />
      <DataGrid
        sx={{ ...customTableStyle, marginTop: '1.25rem' }}
        rows={fieldList}
        columns={columns}
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
        {/* go to last tab or if none navigate to nuttrient analysis */}
        <Button
          size="medium"
          aria-label="Back"
          variant="secondary"
          onPress={() => {
            if (activeField > 0) {
              setActiveField(activeField - 1);
            } else {
              navigate(NUTRIENT_ANALYSIS);
            }
          }}
        >
          BACK
        </Button>
        {/* go to next tab or if none navigate to next page */}
        <Button
          size="medium"
          aria-label="Next"
          variant="primary"
          onPress={() => {
            if (activeField < fieldList.length - 1) {
              setActiveField(activeField + 1);
            } else {
              handleNextPage();
            }
          }}
          type="submit"
        >
          Next
        </Button>
      </ButtonGroup>
    </StyledContent>
  );
}
