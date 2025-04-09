/**
 * @summary This is the Field list Tab
 */
import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
// import { useNavigate } from 'react-router-dom';
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
import Grid from '@mui/material/Grid2';
import { AppTitle, PageTitle, ProgressStepper, TabsMaterial } from '../../components/common';
// import { Dropdown, InputField, Button } from '../../components/common';
// import Modal from '@/components/common/Modal/Modal';
import {
  formCss,
  // formGridBreakpoints,
  // hideCheckboxGroup,
  // showCheckboxGroup,
} from '../../common.styles';
import {
  customTableStyle,
  StyledContent,
  tableActionButtonCss,
  // ListItemContainer,
  // ButtonWrapper,
  // Header,
  // Column,
  // ListItem,
  // ContentWrapper,
  // ButtonContainer,
  // ErrorText,
} from './fieldList.styles';
// import NMPFileFieldData from '@/types/NMPFileFieldData';
// import ViewCard from '@/components/common/ViewCard/ViewCard';
import {
  // FARM_INFORMATION,
  FIELD_LIST,
  // SOIL_TESTS
} from '@/constants/RouteConstants';
// import { initFields, saveFieldsToFile } from '../../utils/utils';
import useAppService from '@/services/app/useAppService';

type FieldEntry = {
  id?: number;
  fieldName: string;
  area: number | undefined;
  manureApplication: string;
  comments: string;
};

const EMPTY_FIELD_FORM: FieldEntry = {
  fieldName: '',
  comments: '',
  area: undefined,
  manureApplication: '',
};

// const initialFieldFormData = {
//   FieldName: '',
//   Area: '',
//   PreviousYearManureApplicationFrequency: '0',
//   Comment: '',
//   SoilTest: {},
//   Crops: [],
// };

const manureOptions = [
  { id: 0, label: 'Select' },
  { id: 1, label: 'No Manure in the last 2 years' },
  { id: 2, label: 'Manure applied in 1 of the 2 years' },
  { id: 3, label: 'Manure applied in each of the 2 years' },
];

export default function FieldList() {
  const {
    // state,
    // setNMPFile,
    setProgressStep,
  } = useAppService();
  // const navigate = useNavigate();

  const [fieldList, setFieldList] = useState<Array<FieldEntry>>([
    {
      id: 0,
      fieldName: 'Test Field',
      comments: 'None',
      area: 42,
      manureApplication: 'TestApplication',
    },
    {
      id: 1,
      fieldName: 'Test Field 2',
      comments: 'None 2',
      area: 422,
      manureApplication: 'TestApplication2',
    },
  ]);

  // const [isModalVisible, setIsModalVisible] = useState(false);
  // const [editIndex, setEditIndex] = useState<number | null>(null);
  // const [fieldFormData, setFieldFormData] = useState<NMPFileFieldData>(initialFieldFormData);
  // const [fields, setFields] = useState<NMPFileFieldData[]>(initFields(state));
  // const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  //   const { name, value } = e.target;
  //   setFieldFormData({ ...fieldFormData, [name]: value });
  // };

  // const handleEdit = (index: number) => {
  //   setFieldFormData(fields[index]);
  //   setEditIndex(index);
  //   setIsModalVisible(true);
  // };

  // const handleDelete = (index: number) => {
  //   const updatedFields = fields.filter((_, i) => i !== index);
  //   setFields(updatedFields);
  // };

  // const validate = () => {
  //   const newErrors: { [key: string]: string } = {};
  //   if (!fieldFormData.FieldName.trim()) {
  //     newErrors.FieldName = 'Field Name is required';
  //   } else if (
  //     fields.some(
  //       (field, index) =>
  //         field.FieldName.trim().toLowerCase() === fieldFormData.FieldName.trim().toLowerCase() &&
  //         index !== editIndex,
  //     )
  //   ) {
  //     newErrors.FieldName = 'Field Name must be unique';
  //   }
  //   if (!fieldFormData.Area.trim() || Number.isNaN(Number(fieldFormData.Area))) {
  //     newErrors.Area = 'Area is required and must be a number';
  //   }
  //   if (fieldFormData.PreviousYearManureApplicationFrequency === '0') {
  //     newErrors.PreviousYearManureApplicationFrequency =
  //       'Please select a manure application frequency';
  //   }
  //   return newErrors;
  // };

  // const handleSubmit = () => {
  //   const validationErrors = validate();
  //   if (Object.keys(validationErrors).length > 0) {
  //     setErrors(validationErrors);
  //     return;
  //   }
  //   setErrors({});
  //   if (editIndex !== null) {
  //     const updatedFields = fields.map((field, index) =>
  //       index === editIndex ? fieldFormData : field,
  //     );
  //     setFields(updatedFields);
  //     setEditIndex(null);
  //   } else {
  //     setFields([...fields, fieldFormData]);
  //   }
  //   setFieldFormData(initialFieldFormData);
  //   setIsModalVisible(false);
  // };

  // const handleNext = () => {
  //   saveFieldsToFile(fields, state.nmpFile, setNMPFile);
  //   navigate(SOIL_TESTS);
  // };

  // const handlePrevious = () => {
  //   navigate(FARM_INFORMATION);
  // };

  useEffect(() => {
    setProgressStep(3);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // const filteredFields = fields.filter((field) => field.FieldName.trim() !== '');

  const [isEditingForm, setIsEditingForm] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isFormInvalid, setIsFormInvalid] = useState<boolean>(false);
  const [formData, setFormData] = useState<FieldEntry>(EMPTY_FIELD_FORM);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    // Prevent default browser page refresh.
    e.preventDefault();

    // console.log(e);
    const data = Object.fromEntries(new FormData(e.currentTarget)) as unknown as FieldEntry;
    setFieldList((prev) => [...prev, { ...data, id: prev?.length ?? 0 }]);
    if (isEditingForm) {
      // temp blank
      setIsEditingForm(false);
    } else {
      setFormData(EMPTY_FIELD_FORM);
    }
    setIsDialogOpen(false);
  };

  const handleFormFieldChange = (field: string, value: string | number | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditRow = (e: any) => {
    setIsEditingForm(true);
    setFormData(e.row);
    setIsDialogOpen(true);
  };

  const handleDeleteRow = (e: any) => {
    // delete row
    console.log(e);
  };

  const columns: GridColDef[] = useMemo(
    () => [
      { field: 'fieldName', headerName: 'Field Type', width: 200, minWidth: 150, maxWidth: 300 },
      { field: 'area', headerName: 'Area', width: 150, minWidth: 125, maxWidth: 300 },
      { field: 'comments', headerName: 'Comments (optional)', minWidth: 200, maxWidth: 300 },
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
          onOpenChange={(e) => {
            setIsFormInvalid(false);
            setIsDialogOpen(e);
          }}
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
                Add Field
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
                  <Grid size={6}>
                    <span
                      className={`bcds-react-aria-Select--Label ${isFormInvalid ? '--error' : ''}`}
                    >
                      Field name
                    </span>
                    <TextField
                      isRequired
                      name="fieldName"
                      value={formData?.fieldName}
                      onChange={(e) => handleFormFieldChange('fieldName', e)}
                    />
                  </Grid>
                  <Grid size={6}>
                    <span
                      className={`bcds-react-aria-Select--Label ${isFormInvalid ? '--error' : ''}`}
                    >
                      Area
                    </span>
                    <TextField
                      isRequired
                      type="number"
                      name="area"
                      value={formData?.area?.toString()}
                      onChange={(e) => handleFormFieldChange('area', e)}
                    />
                  </Grid>

                  <Grid size={6}>
                    <span
                      className={`bcds-react-aria-Select--Label ${isFormInvalid ? '--error' : ''}`}
                    >
                      Manure Application
                    </span>
                    <Select
                      isRequired
                      name="manureApplication"
                      items={manureOptions}
                      value={formData?.manureApplication}
                      onChange={(e: string | number | undefined) =>
                        handleFormFieldChange('manureApplication', e)
                      }
                    />
                  </Grid>
                  <Grid size={6}>
                    <span>Comments (Optional)</span>
                    <TextField
                      name="comments"
                      value={formData.comments}
                      onChange={(e) => handleFormFieldChange('comments', e)}
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
                    onPress={() => {
                      setIsDialogOpen(false);
                      setIsFormInvalid(false);
                    }}
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
      <TabsMaterial tabLabel={['Field List', 'Soil Tests', 'Crops']}>
        {[
          <DataGrid
            sx={{ ...customTableStyle, marginTop: '1.25rem' }}
            key="Field List"
            rows={fieldList}
            columns={columns}
            checkboxSelection
            disableRowSelectionOnClick
            disableColumnMenu
            hideFooterPagination
            hideFooter
          />,
        ]}
      </TabsMaterial>
      <ButtonGroup
        alignment="start"
        ariaLabel="A group of buttons"
        orientation="horizontal"
      >
        <Button
          size="medium"
          aria-label="Back"
          variant="secondary"
        >
          BACK
        </Button>
        <Button
          size="medium"
          aria-label="Next"
          variant="primary"
          type="submit"
        >
          Next
        </Button>
      </ButtonGroup>
    </StyledContent>
    // <ViewCard
    //   heading="Field List"
    //   handlePrevious={handlePrevious}
    //   handleNext={handleNext}
    //   nextDisabled={fields.length === 0}
    // >
    //   <ButtonContainer hasFields={filteredFields.length > 0}>
    //     <Button
    //       text="Add Field"
    //       handleClick={() => setIsModalVisible(true)}
    //       aria-label="Add Field"
    //       variant="primary"
    //       size="sm"
    //       disabled={false}
    //     />
    //   </ButtonContainer>
    //   <ContentWrapper hasFields={filteredFields.length > 0}>
    //     {filteredFields.length > 0 && (
    //       <Header>
    //         <Column>Field Name</Column>
    //         <Column>Area</Column>
    //         <Column>Comments</Column>
    //         <Column align="right">Actions</Column>
    //       </Header>
    //     )}
    //     {filteredFields.map((field, index) => (
    //       <ListItemContainer key={field.FieldName}>
    //         <ListItem>{field.FieldName}</ListItem>
    //         <ListItem>{field.Area}</ListItem>
    //         <ListItem>{field.Comment}</ListItem>
    //         <ListItem align="right">
    //           <button
    //             type="button"
    //             onClick={() => handleEdit(index)}
    //           >
    //             <FontAwesomeIcon icon={faEdit} />
    //           </button>
    //           <button
    //             type="button"
    //             onClick={() => handleDelete(index)}
    //           >
    //             <FontAwesomeIcon icon={faTrash} />
    //           </button>
    //         </ListItem>
    //       </ListItemContainer>
    //     ))}
    //   </ContentWrapper>
    //   <Modal
    //     isVisible={isModalVisible}
    //     title={editIndex !== null ? 'Edit Field' : 'Add Field'}
    //     onClose={() => setIsModalVisible(false)}
    //     footer={
    //       <>
    //         <ButtonWrapper>
    //           <Button
    //             text="Cancel"
    //             handleClick={() => setIsModalVisible(false)}
    //             aria-label="Cancel"
    //             variant="secondary"
    //             size="sm"
    //             disabled={false}
    //           />
    //         </ButtonWrapper>
    //         <ButtonWrapper>
    //           <Button
    //             text="Submit"
    //             handleClick={handleSubmit}
    //             aria-label="Submit"
    //             variant="primary"
    //             size="sm"
    //             disabled={false}
    //           />
    //         </ButtonWrapper>
    //       </>
    //     }
    //   >
    //     {errors.FieldName && <ErrorText>{errors.FieldName}</ErrorText>}
    //     <InputField
    //       label="Field Name"
    //       type="text"
    //       name="FieldName"
    //       value={fieldFormData.FieldName}
    //       onChange={handleChange}
    //     />
    //     {errors.Area && <ErrorText>{errors.Area}</ErrorText>}
    //     <InputField
    //       label="Area"
    //       type="text"
    //       name="Area"
    //       value={fieldFormData.Area}
    //       onChange={handleChange}
    //     />
    //     {errors.PreviousYearManureApplicationFrequency && (
    //       <ErrorText>{errors.PreviousYearManureApplicationFrequency}</ErrorText>
    //     )}
    //     <Dropdown
    //       label="Manure application in previous years"
    //       name="PreviousYearManureApplicationFrequency"
    //       value={fieldFormData.PreviousYearManureApplicationFrequency}
    //       options={manureOptions}
    //       onChange={handleChange}
    //     />
    //     <InputField
    //       label="Comments (optional)"
    //       type="text"
    //       name="Comment"
    //       value={fieldFormData.Comment}
    //       onChange={handleChange}
    //     />
    //   </Modal>
    // </ViewCard>
  );
}
