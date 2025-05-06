/**
 * @summary This is the Field list Tab
 */
import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit, faPlus } from '@fortawesome/free-solid-svg-icons';
import {
  Button,
  ButtonGroup,
  Dialog,
  Modal,
  Form,
  TextField,
  Select,
} from '@bcgov/design-system-react-components';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import { AppTitle, PageTitle, ProgressStepper, TabsMaterial } from '../../components/common';
import {
  customTableStyle,
  formCss,
  formGridBreakpoints,
  tableActionButtonCss,
} from '../../common.styles';
import { ErrorText, StyledContent } from './fieldList.styles';
import NMPFileFieldData from '@/types/NMPFileFieldData';
import { FARM_INFORMATION, FIELD_LIST, SOIL_TESTS } from '@/constants/RouteConstants';
import { initFields, saveFieldsToFile } from '../../utils/utils';
import useAppService from '@/services/app/useAppService';

type tempNMPFileFieldData = NMPFileFieldData & { id?: string };

const initialFieldFormData: tempNMPFileFieldData = {
  FieldName: '',
  Area: '',
  PreviousYearManureApplicationFrequency: '0',
  Comment: '',
  SoilTest: {},
  Crops: [],
};

const manureOptions = [
  { id: '0', label: 'Select' },
  { id: '1', label: 'No Manure in the last 2 years' },
  { id: '2', label: 'Manure applied in 1 of the 2 years' },
  { id: '3', label: 'Manure applied in each of the 2 years' },
];

export default function FieldList() {
  const { state, setNMPFile, setProgressStep } = useAppService();
  const [formData, setFormData] = useState<tempNMPFileFieldData>(initialFieldFormData);
  const [isEditingForm, setIsEditingForm] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isFormInvalid, setIsFormInvalid] = useState<boolean>(false);
  const [showViewError, setShowViewError] = useState<string>('');

  const navigate = useNavigate();

  const [fieldList, setFieldList] = useState<Array<tempNMPFileFieldData>>(
    // Load NMP fields into view, add id key for UI tracking purposes
    // id key removed on save
    initFields(state).map((fieldElement: NMPFileFieldData, index: number) => ({
      ...fieldElement,
      id: index.toString(),
    })),
  );

  useEffect(() => {
    setProgressStep(3);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    // Prevent default browser page refresh.
    e.preventDefault();

    if (isEditingForm) {
      // If editing, find and replace field instead of adding new field
      const replaceIndex = fieldList.findIndex((element) => element?.id === formData?.id);
      setFieldList((prev) => {
        const newList = [...prev];
        newList[replaceIndex] = { ...formData };
        return newList;
      });
    } else {
      //
      setFieldList((prev) => [...prev, { ...formData, id: prev?.length.toString() ?? '0' }]);
    }
    setFormData(initialFieldFormData);
    setIsEditingForm(false);
    setIsDialogOpen(false);
    setShowViewError('');
  };

  const handleFormFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateUniqueField = (): string => {
    // Trigger validation error if blank, replaces default isRequired
    if (!formData?.FieldName) return ' ';

    // Check if field name is unique, with exception of editing the same field
    const isNameValid = fieldList.some(
      (fieldRow) => fieldRow.FieldName === formData.FieldName && fieldRow.id !== formData?.id,
    );
    return isNameValid ? ' must be unique' : '';
  };

  const handleEditRow = (e: any) => {
    setIsEditingForm(true);
    setFormData(e.row);
    setIsDialogOpen(true);
  };

  const handleDeleteRow = (e: any) => {
    setFieldList((prev) => {
      const newList = [...prev];
      if (e?.id === 0 || e?.id) newList.splice(e.id, 1);
      return newList;
    });
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setIsEditingForm(false);
    setIsFormInvalid(false);
    setFormData(initialFieldFormData);
  };

  const handleNextPage = () => {
    setShowViewError('');

    if (fieldList.length) {
      saveFieldsToFile(
        // Delete the id key in each field to prevent saving into NMPfile
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        fieldList.map(({ id, ...remainingFields }) => remainingFields),
        state.nmpFile,
        setNMPFile,
      );
      navigate(SOIL_TESTS);
    } else {
      setShowViewError('Must enter at least 1 field');
    }
  };

  const isManureOptionValid = () =>
    formData?.PreviousYearManureApplicationFrequency !== manureOptions[0].id;

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
    [],
  );

  return (
    <StyledContent>
      <ProgressStepper step={FIELD_LIST} />
      <AppTitle />
      <PageTitle title="Field Information" />
      <>
        <div
          css={{
            '.bcds-ButtonGroup': {
              overflow: 'visible',
              height: '0rem',
              '> button': {
                position: 'relative',
                bottom: '-0.25rem',
                zIndex: '10',
              },
            },
          }}
        >
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
        <Modal
          isDismissable
          isOpen={isDialogOpen}
          onOpenChange={handleDialogClose}
        >
          <Dialog
            isCloseable
            role="dialog"
          >
            <div
              style={{
                padding: '1rem',
              }}
            >
              <span
                style={{
                  fontWeight: '700',
                  fontSize: '1.25rem',
                }}
              >
                {isEditingForm ? 'Edit animal' : 'Add animal'}
              </span>
              <Divider
                aria-hidden="true"
                component="div"
                css={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}
              />
              <Form
                css={formCss}
                onSubmit={onSubmit}
                onInvalid={() => setIsFormInvalid(true)}
              >
                <Grid
                  container
                  spacing={1}
                >
                  <Grid size={formGridBreakpoints}>
                    <span
                      className={`bcds-react-aria-Select--Label ${isFormInvalid && validateUniqueField() ? '--error' : ''}`}
                    >
                      Field name {isFormInvalid && validateUniqueField()}
                    </span>
                    <TextField
                      isRequired
                      name="FieldName"
                      value={formData?.FieldName}
                      validate={() => (isFormInvalid ? validateUniqueField() : '')}
                      onChange={(e) => handleFormFieldChange('FieldName', e)}
                    />
                  </Grid>
                  <Grid size={formGridBreakpoints}>
                    <span
                      className={`bcds-react-aria-Select--Label ${isFormInvalid && !formData?.Area ? '--error' : ''}`}
                    >
                      Area
                    </span>
                    <TextField
                      isRequired
                      type="number"
                      name="Area"
                      value={formData?.Area?.toString()}
                      onChange={(e) => handleFormFieldChange('Area', e?.trim())}
                    />
                  </Grid>
                  <Grid size={6}>
                    <span
                      className={`bcds-react-aria-Select--Label ${isFormInvalid && !isManureOptionValid() ? '--error' : ''}`}
                    >
                      Manure Application
                    </span>
                    <Select
                      isRequired
                      name="manureApplication"
                      items={manureOptions}
                      selectedKey={formData?.PreviousYearManureApplicationFrequency}
                      validate={() => (!isManureOptionValid() ? 'required' : '')}
                      onSelectionChange={(e) => {
                        handleFormFieldChange(
                          'PreviousYearManureApplicationFrequency',
                          e.toString(),
                        );
                      }}
                    />
                  </Grid>
                  <Grid size={formGridBreakpoints}>
                    <span>Comment (Optional)</span>
                    <TextField
                      name="Comment"
                      value={formData.Comment}
                      onChange={(e) => handleFormFieldChange('Comment', e)}
                    />
                  </Grid>
                </Grid>
                <Divider
                  aria-hidden="true"
                  component="div"
                  css={{ marginTop: '1rem', marginBottom: '1rem' }}
                />
                <ButtonGroup
                  alignment="end"
                  orientation="horizontal"
                >
                  <Button
                    type="reset"
                    variant="secondary"
                    onPress={handleDialogClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                  >
                    Confirm
                  </Button>
                </ButtonGroup>
              </Form>
            </div>
          </Dialog>
        </Modal>
      </>
      <TabsMaterial
        activeTab={0}
        tabLabel={['Field List', 'Soil Tests', 'Crops']}
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
        <Button
          size="medium"
          aria-label="Back"
          variant="secondary"
          onPress={() => navigate(FARM_INFORMATION)}
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
