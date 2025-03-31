/**
 * @summary The Field and Soil page for the application
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  ButtonGroup,
  Dialog,
  DialogTrigger,
  Modal,
  Form,
  TextField,
  Select,
} from '@bcgov/design-system-react-components';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Divider from '@mui/material/Divider';

import Grid from '@mui/material/Grid2';

import useAppService from '@/services/app/useAppService';
import NMPFile from '@/types/NMPFile';
import defaultNMPFile from '@/constants/DefaultNMPFile';
import { AppTitle, PageTitle, ProgressStepper, TabsMaterial } from '../../components/common';
import FieldList from './FieldList/FieldList';
import SoilTests from './SoilTests/SoilTests';
import Crops from './Crops/Crops';
// import { TabOptions, TabContentDisplay } from '../../components/common/Tabs/Tabs';
import { StyledContent } from './fieldAndSoil.styles';
import { NMPFileCropData } from '@/types';
import blankNMPFileYearData from '@/constants/BlankNMPFileYearData';
import {
  ANIMALS_MANURE,
  FARM_INFORMATION,
  FIELD_SOIL,
  LANDING_PAGE,
} from '@/constants/RouteConstants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus';
import { buttonGroup, formCss } from '@/common.styles';

const columns: GridColDef[] = [
  { field: 'FieldName', headerName: 'Field Type' },
  { field: 'Area', headerName: 'Area' },
  { field: 'Comment', headerName: 'Comments (optional)' },
  { field: '', headerName: 'Actions' },

  // { field: 'id', headerName: 'ID', width: 70 },
  // { field: 'firstName', headerName: 'First name', width: 130 },
  // { field: 'lastName', headerName: 'Last name', width: 130 },
  // {
  //   field: 'age',
  //   headerName: 'Age',
  //   type: 'number',
  //   width: 90,
  // },
  // {
  //   field: 'fullName',
  //   headerName: 'Full name',
  //   description: 'This column has a value getter and is not sortable.',
  //   sortable: false,
  //   width: 160,
  //   valueGetter: (value, row) => `${row.firstName || ''} ${row.lastName || ''}`,
  // },
];

const rows = [
  { id: 1, lastName: 'Snow', firstName: 'Jon', age: 35 },
  { id: 2, lastName: 'Lannister', firstName: 'Cersei', age: 42 },
  { id: 3, lastName: 'Lannister', firstName: 'Jaime', age: 45 },
  { id: 4, lastName: 'Stark', firstName: 'Arya', age: 16 },
  { id: 5, lastName: 'Targaryen', firstName: 'Daenerys', age: null },
  { id: 6, lastName: 'Melisandre', firstName: null, age: 150 },
  { id: 7, lastName: 'Clifford', firstName: 'Ferrara', age: 44 },
  { id: 8, lastName: 'Frances', firstName: 'Rossini', age: 36 },
  { id: 9, lastName: 'Roxie', firstName: 'Harvey', age: 65 },
];

export default function FieldAndSoil() {
  const { state, setNMPFile, setProgressStep } = useAppService();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [fields, setFields] = useState<
    {
      FieldName: string;
      Area: string;
      PreviousYearManureApplicationFrequency: string;
      Comment: string;
      SoilTest: object;
      Crops: NMPFileCropData[];
    }[]
  >([]);

  const tabs = [
    {
      id: 'field-list',
      label: 'Field List',
      content: (
        <FieldList
          fields={fields}
          setFields={setFields}
        />
      ),
    },
    {
      id: 'soil-test',
      label: 'Soil Tests',
      content: (
        <SoilTests
          fields={fields}
          setFields={setFields}
        />
      ),
    },
    {
      id: 'crops',
      label: 'Crops',
      content: (
        <Crops
          fields={fields}
          setFields={setFields}
        />
      ),
    },
  ];

  // const handleNext = () => {
  //   let nmpFile: NMPFile;
  //   if (state.nmpFile) nmpFile = JSON.parse(state.nmpFile);
  //   else {
  //     nmpFile = { ...defaultNMPFile };
  //     nmpFile.years.push({ ...blankNMPFileYearData });
  //   }
  //   if (nmpFile.years.length > 0) {
  //     nmpFile.years[0].Fields = fields.map((field) => ({
  //       FieldName: field.FieldName,
  //       Area: parseFloat(field.Area),
  //       PreviousYearManureApplicationFrequency: field.PreviousYearManureApplicationFrequency,
  //       Comment: field.Comment,
  //       SoilTest: field.SoilTest,
  //       Crops: field.Crops,
  //     }));
  //   }
  //   setNMPFile(JSON.stringify(nmpFile));

  //   // if on the last tab navigate to calculate nutrients page
  //   if (activeTab === tabs.length - 1) {
  //     navigate('/manure-and-compost');
  //   } else {
  //     setActiveTab(activeTab + 1);
  //   }
  // };

  // const handlePrevious = () => {
  //   if (activeTab > 0) setActiveTab(activeTab - 1);
  //   else navigate('/farm-information');
  // };

  // assumes only 1 year, edit
  useEffect(() => {
    if (state.nmpFile) {
      const parsedData = JSON.parse(state.nmpFile);
      setFields(parsedData.years[0].Fields);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  useEffect(() => {
    setProgressStep(3);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTestClick = () => {
    console.log('test click');
  };
  return (
    <StyledContent>
      <ProgressStepper step={FIELD_SOIL} />
      <AppTitle />
      <PageTitle title="Field Information" />

      <DialogTrigger>
        <ButtonGroup
          alignment="end"
          ariaLabel="A group of buttons"
          orientation="horizontal"
        >
          <Button
            size="medium"
            aria-label="Add Field"
            onPress={() => console.log('test')}
            variant="secondary"
          >
            <FontAwesomeIcon icon={faPlus} />
            Add Field
          </Button>
        </ButtonGroup>
        <Modal>
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
                  font: "700 1.25rem/2.125rem 'BC Sans'",
                }}
              >
                Add Field
              </span>
              <Divider
                aria-hidden="true"
                component="div"
                css={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}
              />
              <Form css={formCss}>
                <Grid
                  container
                  spacing={1}
                >
                  <Grid size={6}>
                    <TextField
                      isRequired
                      label="Field"
                      name="FieldName"
                    />
                  </Grid>
                  <Grid size={6}>
                    <TextField
                      isRequired
                      label="Area"
                      name="Area"
                    />
                  </Grid>

                  <Grid size={6}>
                    <Select
                      isRequired
                      items={[
                        {
                          id: 'chilliwack',
                          label: 'Chilliwack',
                        },
                        {
                          id: 'kelowna',
                          label: 'Kelowna',
                        },
                      ]}
                      label="Manure Application"
                    />
                  </Grid>
                  <Grid size={6}>
                    <TextField
                      isRequired
                      label="Comments (optional)"
                      name="Comments"
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
                  // css={{ '> button': { marginTop: '1rem' } }}
                >
                  <Button
                    type="reset"
                    variant="secondary"
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
      </DialogTrigger>
      <TabsMaterial>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5,
              },
            },
          }}
          pageSizeOptions={[5]}
          checkboxSelection
          disableRowSelectionOnClick
        />
      </TabsMaterial>
    </StyledContent>
    // <Card
    //   height="500px"
    //   width="700px"
    // >
    //   <CardHeader>
    //     <Banner>
    //       <TabOptions
    //         tabs={tabs}
    //         activeTab={activeTab}
    //         setActiveTab={setActiveTab}
    //         clickable={false}
    //       />
    //     </Banner>
    //   </CardHeader>
    //   <TabContentDisplay
    //     tabs={tabs}
    //     activeTab={activeTab}
    //   />
    //   <ButtonWrapper position="right">
    //     <Button
    //       text="Next"
    //       size="sm"
    //       handleClick={handleNext}
    //       aria-label="Next"
    //       variant="primary"
    //       disabled={fields.length === 0}
    //     />
    //   </ButtonWrapper>
    //   <ButtonWrapper position="left">
    //     <Button
    //       text="Back"
    //       size="sm"
    //       handleClick={handlePrevious}
    //       aria-label="Back"
    //       variant="primary"
    //       disabled={false}
    //     />
    //   </ButtonWrapper>
    // </Card>
  );
}
