/**
 * @summary This is the Field list Tab
 */
import { useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Button, ButtonGroup } from '@bcgov/design-system-react-components';
import { DataGrid, GridColDef, GridRowId } from '@mui/x-data-grid';
import { GridApiCommunity } from '@mui/x-data-grid/internals';
import { AppTitle, PageTitle, ProgressStepper, TabsMaterial } from '../../components/common';
import { addRecordGroupStyle, customTableStyle, tableActionButtonCss } from '../../common.styles';
import { ErrorText, StyledContent } from './fieldList.styles';
import { NMPFileFieldData } from '@/types/NMPFileFieldData';
import { FARM_INFORMATION, NUTRIENT_ANALYSIS, SOIL_TESTS } from '@/constants/routes';
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

  const handleEditRow = useCallback((e: { id: GridRowId; api: GridApiCommunity }) => {
    setRowEditIndex(e.api.getRowIndexRelativeToVisibleRows(e.id));
    setIsDialogOpen(true);
  }, []);

  const handleDeleteRow = (e: { id: GridRowId; api: GridApiCommunity }) => {
    setFieldList((prev) => {
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

  const handlePreviousPage = () => {
    try {
      if (!state.showAnimalsStep) {
        navigate(FARM_INFORMATION);
      } else {
        navigate(NUTRIENT_ANALYSIS);
      }
    } catch {
      console.log("Couldn't parse");
      navigate(FARM_INFORMATION);
    }
  };

  const isFieldNameUnique = useCallback(
    (data: Partial<NMPFileFieldData>, index: number) =>
      !fieldList.some((fieldRow, idx) => fieldRow.FieldName === data.FieldName && index !== idx),
    [fieldList],
  );

  const columns: GridColDef[] = useMemo(
    () => [
      { field: 'FieldName', headerName: 'Field Name', width: 200, minWidth: 150, maxWidth: 300 },
      { field: 'Area', headerName: 'Acres', width: 150, minWidth: 125, maxWidth: 300 },
      { field: 'Comment', headerName: 'Comments (optional)', minWidth: 200, maxWidth: 300 },
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
      <ProgressStepper />
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
            mode={rowEditIndex !== undefined ? 'Edit Field' : 'Add Field'}
            initialModalData={rowEditIndex !== undefined ? fieldList[rowEditIndex] : undefined}
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
