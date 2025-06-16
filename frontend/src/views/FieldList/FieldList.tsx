/**
 * @summary This is the Field list Tab
 */
import { useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Button, ButtonGroup } from '@bcgov/design-system-react-components';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { AppTitle, PageTitle, ProgressStepper, TabsMaterial } from '../../components/common';
import { addRecordGroupStyle, customTableStyle, tableActionButtonCss } from '../../common.styles';
import { ErrorText, StyledContent } from './fieldList.styles';
import { NMPFileFieldData } from '@/types/NMPFileFieldData';
import { FARM_INFORMATION, FIELD_LIST, MANURE_IMPORTS, SOIL_TESTS } from '@/constants/routes';
import useAppState from '@/hooks/useAppState';
import FieldListModal from '../../components/common/FieldListModal/FieldListModal';

export default function FieldList() {
  const { state, dispatch } = useAppState();
  const [rowEditIndex, setRowEditIndex] = useState<number | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [showViewError, setShowViewError] = useState<string>('');

  const navigate = useNavigate();

  const [fieldList, setFieldList] = useState<Array<NMPFileFieldData>>(
    state.nmpFile.years[0].Fields || [],
  );

  const handleEditRow = useCallback((e: { row: NMPFileFieldData }) => {
    setRowEditIndex(e.row.index);
    setIsDialogOpen(true);
  }, []);

  const handleDeleteRow = (e: any) => {
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
    if (!state.nmpFile.farmDetails.Year) {
      // We should show an error popup, but for now force-navigate back to Farm Information
      navigate(FARM_INFORMATION);
    }
    if (fieldList.length) {
      dispatch({
        type: 'SAVE_FIELDS',
        year: state.nmpFile.farmDetails.Year!,
        newFields: fieldList,
      });
      navigate(SOIL_TESTS);
    } else {
      setShowViewError('Must enter at least 1 field');
    }
  };

  const handleBack = () => {
    try {
      if (
        state.nmpFile.farmDetails.FarmAnimals === undefined ||
        state.nmpFile.farmDetails.FarmAnimals.length === 0
      ) {
        navigate(FARM_INFORMATION);
      } else {
        navigate(MANURE_IMPORTS);
      }
    } catch {
      console.log("Couldn't parse");
      navigate(FARM_INFORMATION);
    }
  };

  const isFieldNameUnique = useCallback(
    (data: Partial<NMPFileFieldData>) =>
      !fieldList.some(
        (fieldRow) => fieldRow.FieldName === data.FieldName && fieldRow.index !== data.index,
      ),
    [fieldList],
  );

  const columns: GridColDef[] = useMemo(
    () => [
      { field: 'FieldName', headerName: 'Field Type', width: 200, minWidth: 150, maxWidth: 300 },
      { field: 'Area', headerName: 'Area', width: 150, minWidth: 125, maxWidth: 300 },
      { field: 'Comment', headerName: 'Comment (optional)', minWidth: 200, maxWidth: 300 },
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
      <PageTitle title="Field Information" />
      <>
        <div css={addRecordGroupStyle}>
          <ButtonGroup
            alignment="end"
            ariaLabel="A group of buttons"
            orientation="horizontal"
          >
            <Button
              size="medium"
              aria-label="Add Field"
              onPress={() => setIsDialogOpen(true)}
              variant="secondary"
            >
              <FontAwesomeIcon icon={faPlus} />
              Add Field
            </Button>
          </ButtonGroup>
        </div>
        {isDialogOpen && (
          <FieldListModal
            initialModalData={
              rowEditIndex !== undefined
                ? fieldList.find((v) => v.index === rowEditIndex)
                : undefined
            }
            rowEditIndex={rowEditIndex}
            setFieldList={setFieldList}
            isFieldNameUnique={isFieldNameUnique}
            isOpen={isDialogOpen}
            onClose={handleDialogClose}
          />
        )}
      </>
      <TabsMaterial
        activeTab={0}
        tabLabel={['Field List', 'Soil Tests', 'Crops']}
      />
      <DataGrid
        sx={{ ...customTableStyle, marginTop: '1.25rem' }}
        rows={fieldList}
        columns={columns}
        getRowId={(row: any) => row.index}
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
          aria-label="Back"
          variant="secondary"
          onPress={handleBack}
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
