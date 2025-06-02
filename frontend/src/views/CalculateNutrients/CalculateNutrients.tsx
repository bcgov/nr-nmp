/**
 * @summary The calculate nutrients page for the application
 * calculates the field nutrients based on the crops and manure
 */
import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Button, ButtonGroup } from '@bcgov/design-system-react-components';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import useAppService from '@/services/app/useAppService';
import { AppTitle, PageTitle, ProgressStepper, TabsMaterial } from '../../components/common';
import { NMPFileFieldData } from '@/types/NMPFileFieldData';
import { FIELD_LIST, CROPS } from '@/constants/RouteConstants';

import { customTableStyle, tableActionButtonCss } from '../../common.styles';
import { ErrorText, StyledContent } from '../FieldList/fieldList.styles';
import { initFields } from '../../utils/utils';
import FertilizerModal from './CalculateNutrientsComponents/FertilizerModal';
import NewFertilizerModal from './FertilizerModal/NewFertilizerModal';
import ManureModal from './CalculateNutrientsComponents/ManureModal';
import OtherModal from './CalculateNutrientsComponents/OtherModal';
import FertigationModal from './CalculateNutrientsComponents/FertigationModal';
import FieldListModal from '../../components/common/FieldListModal/FieldListModal';

// calculates the field nutrients based on the crops and manure
export default function CalculateNutrients() {
  // setNMPFile not yet used
  // const { state, setNMPFile } = useAppService();
  const { state } = useAppService();
  const [rowEditIndex, setRowEditIndex] = useState<number | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [showViewError, setShowViewError] = useState<string>('');
  const [buttonClicked, setButtonClicked] = useState<string>('');
  const [activeField, setActiveField] = useState<number>(0);

  const navigate = useNavigate();

  const [fieldList, setFieldList] = useState<Array<NMPFileFieldData>>(
    // Index is removed on save
    initFields(state).map((fieldElement: NMPFileFieldData, index: number) => ({
      ...fieldElement,
      index,
    })),
  );

  const handleEditRow = React.useCallback((e: { row: NMPFileFieldData }) => {
    setRowEditIndex(e.row.index);
    setIsDialogOpen(true);
  }, []);

  const handleDeleteRow = (e: { row: NMPFileFieldData }) => {
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
    //   // next page is reporting
    //   navigate(/);
    // } else {
    //   setShowViewError('Must enter at least 1 field');
    // }
  };

  const isFieldNameUnique = useCallback(
    (data: NMPFileFieldData) =>
      !fieldList.some(
        (fieldRow) => fieldRow.FieldName === data.FieldName && fieldRow.index !== data.index,
      ),
    [fieldList],
  );

  const columns: GridColDef[] = useMemo(
    () => [
      { field: 'cropName', headerName: 'Crop', width: 250, minWidth: 200, maxWidth: 300 },
      {
        field: 'reqN',
        headerName: 'N',
        width: 60,
        minWidth: 60,
        maxWidth: 100,
        description: 'Nitrogen',
      },
      {
        field: 'reqP2o5',
        headerName: 'P2o5',
        width: 60,
        minWidth: 60,
        maxWidth: 100,
        description: 'Phosphorous',
      },
      {
        field: 'reqK2o',
        headerName: 'K2o',
        width: 110,
        minWidth: 100,
        maxWidth: 110,
        description: 'Nitrogen',
      },
      {
        field: 'remN',
        headerName: 'N',
        width: 60,
        minWidth: 60,
        maxWidth: 100,
        description: 'Nitrogen',
      },
      {
        field: 'remP2o5',
        headerName: 'P2o5',
        width: 60,
        minWidth: 60,
        maxWidth: 100,
        description: 'Nitrogen',
      },
      {
        field: 'remK2o',
        headerName: 'K2o',
        width: 180,
        minWidth: 60,
        maxWidth: 180,
        description: 'Nitrogen',
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
      <Button
        size="medium"
        aria-label="Add Field"
        onPress={() => {
          setButtonClicked('field');
          setIsDialogOpen(true);
        }}
      >
        <FontAwesomeIcon icon={faPlus} />
        Add Field
      </Button>
      {/* tabs = the fields the user has entered */}
      <TabsMaterial
        activeTab={activeField}
        tabLabel={fieldList.length > 0 ? fieldList.map((field) => field.FieldName) : ['Field 1']}
      />
      <>
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
            aria-label="Add Fertigation"
            onPress={() => {
              setButtonClicked('fertigation');
              setIsDialogOpen(true);
            }}
            variant="secondary"
          >
            <FontAwesomeIcon icon={faPlus} />
            Add Fertigation
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

        {isDialogOpen && buttonClicked === 'field' && (
          <FieldListModal
            initialModalData={undefined}
            rowEditIndex={undefined}
            setFieldList={setFieldList}
            isFieldNameUnique={isFieldNameUnique}
            isOpen={isDialogOpen}
            onClose={handleDialogClose}
          />
        )}
        {isDialogOpen && buttonClicked === 'fertilizer' && (
          <NewFertilizerModal
            initialModalData={undefined}
            isOpen={isDialogOpen}
            onCancel={handleDialogClose}
            modalStyle={{ width: '700px' }}
            handleSubmit={() => {}}
          />
        )}
        {isDialogOpen && buttonClicked === 'manure' && (
          <ManureModal
            initialModalData={
              rowEditIndex !== undefined
                ? fieldList.find((v) => v.index === rowEditIndex)
                : undefined
            }
            rowEditIndex={rowEditIndex}
            setFieldList={setFieldList}
            isOpen={isDialogOpen}
            onCancel={handleDialogClose}
            modalStyle={{ width: '700px' }}
          />
        )}
        {isDialogOpen && buttonClicked === 'fertigation' && (
          <FertigationModal
            initialModalData={
              rowEditIndex !== undefined
                ? fieldList.find((v) => v.index === rowEditIndex)
                : undefined
            }
            rowEditIndex={rowEditIndex}
            setFieldList={setFieldList}
            isOpen={isDialogOpen}
            onCancel={handleDialogClose}
            modalStyle={{ width: '700px' }}
          />
        )}
        {isDialogOpen && buttonClicked === 'other' && (
          <OtherModal
            initialModalData={
              rowEditIndex !== undefined
                ? fieldList.find((v) => v.index === rowEditIndex)
                : undefined
            }
            rowEditIndex={rowEditIndex}
            setFieldList={setFieldList}
            isOpen={isDialogOpen}
            onCancel={handleDialogClose}
            modalStyle={{ width: '700px' }}
          />
        )}
      </>
      <div
        style={{ display: 'flex', fontWeight: 'bold', textAlign: 'center', marginTop: '1.25rem' }}
      >
        <div style={{ width: 230 }} />
        <div style={{ width: 210 }}>Agronomic (lb/ac)</div>
        <div style={{ width: 250 }}>Crop Removal (lb/ac)</div>
      </div>
      {/* display crops belonging to the field of the tab the user is on */}
      <DataGrid
        sx={{ ...customTableStyle }}
        rows={fieldList[activeField]?.Crops ? fieldList[activeField].Crops : []}
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
              navigate(CROPS);
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
