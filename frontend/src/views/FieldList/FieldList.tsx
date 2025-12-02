/**
 * @summary This is the Field list Tab
 */
import { useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Button, ButtonGroup } from '@bcgov/design-system-react-components';
import { DataGrid, GridColDef, GridRenderCellParams, GridRowId } from '@mui/x-data-grid';
import { GridApiCommunity } from '@mui/x-data-grid/internals';
import { AlertDialog, FieldListModal, Tabs, View } from '@/components/common';
import {
  addRecordGroupStyle,
  customTableStyle,
  ErrorText,
  tableActionButtonCss,
} from '../../common.styles';
import { NMPFileField } from '@/types/NMPFileField';
import { FARM_INFORMATION, NUTRIENT_ANALYSIS, SOIL_TESTS } from '@/constants/routes';
import useAppState from '@/hooks/useAppState';

export default function FieldList() {
  const { state, dispatch } = useAppState();
  const [rowEditIndex, setRowEditIndex] = useState<number | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [showViewError, setShowViewError] = useState<string>('');

  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [dialogText, setDialogText] = useState<string>('');
  const [deleteBtnConfig, setDeleteBtnConfig] = useState<any>({});

  const navigate = useNavigate();

  const [fieldList, setFieldList] = useState<Array<NMPFileField>>(
    state.nmpFile.years[0].fields || [],
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
    if (fieldList.length) {
      dispatch({
        type: 'SAVE_FIELDS',
        year: state.nmpFile.farmDetails.year,
        newFields: fieldList,
      });
      navigate(SOIL_TESTS);
    } else {
      setShowViewError('Must enter at least 1 field');
    }
  };

  const handlePreviousPage = () => {
    try {
      if (fieldList.length) {
        dispatch({
          type: 'SAVE_FIELDS',
          year: state.nmpFile.farmDetails.year,
          newFields: fieldList,
        });
      }
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
    (data: Partial<NMPFileField>, index: number) =>
      !fieldList.some((fieldRow, idx) => fieldRow.fieldName === data.fieldName && index !== idx),
    [fieldList],
  );

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'fieldName',
        headerName: 'Field Name',
        width: 200,
        minWidth: 150,
        maxWidth: 300,
        sortable: false,
      },
      {
        field: 'area',
        headerName: 'Acres',
        width: 150,
        minWidth: 125,
        maxWidth: 300,
        sortable: false,
      },
      {
        field: 'comment',
        headerName: 'Comments (optional)',
        minWidth: 200,
        maxWidth: 300,
        sortable: false,
      },
      {
        field: '',
        headerName: 'Actions',
        width: 120,
        renderCell: (e: GridRenderCellParams) => (
          <>
            <FontAwesomeIcon
              css={tableActionButtonCss}
              onClick={() => handleEditRow(e)}
              icon={faEdit}
            />
            <FontAwesomeIcon
              css={tableActionButtonCss}
              onClick={() => {
                setDialogText(`Are you sure you want to delete field ${e.row.fieldName}?`);
                setDeleteBtnConfig({
                  btnText: 'Delete',
                  handleClick: () => {
                    handleDeleteRow(e);
                    setShowDeleteDialog(false);
                  },
                });
                setShowDeleteDialog(true);
              }}
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
    <View
      title="Field Information"
      handleBack={handlePreviousPage}
      handleNext={handleNextPage}
    >
      <AlertDialog
        isOpen={showDeleteDialog}
        title="Fields - Delete"
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
      <Tabs
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
    </View>
  );
}
