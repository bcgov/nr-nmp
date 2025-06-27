/**
 * @summary The calculate nutrients page for the application
 * calculates the field nutrients based on the crops and manure
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { Button, ButtonGroup } from '@bcgov/design-system-react-components';
import { DataGrid, GridColDef, GridRowId } from '@mui/x-data-grid';
import { GridApiCommunity } from '@mui/x-data-grid/internals';
import Grid from '@mui/material/Grid';
import useAppState from '@/hooks/useAppState';
import { AppTitle, PageTitle, ProgressStepper, TabsMaterial } from '../../components/common';
import { NMPFileFieldData } from '@/types/NMPFileFieldData';
import { CROPS, NUTRIENT_ANALYSIS, REPORTING } from '@/constants/routes';

import { customTableStyle } from '../../common.styles';
import { ErrorText, StyledContent } from '../FieldList/fieldList.styles';

import { Error, Message, Icon } from './CalculateNutrients.styles';
import { NutrientMessage } from './nutrientMessages';
import FertilizerModal from './CalculateNutrientsComponents/FertilizerModal';
import ManureModal from './CalculateNutrientsComponents/ManureModal';
import OtherModal from './CalculateNutrientsComponents/OtherModal';
// import FertigationModal from './CalculateNutrientsComponents/FertigationModal';
import FieldListModal from '../../components/common/FieldListModal/FieldListModal';
import {
  BALANCE_COLUMNS,
  findBalanceMessage,
  generateColumns,
  genHandleDeleteRow,
  renderNutrientCell,
} from './utils.tsx';
import { CalculateNutrientsColumn } from '@/types/calculateNutrients.ts';
import CropsModal from '../Crops/CropsModal.tsx';
import { AnimalData } from '@/types/Animals.ts';

export default function CalculateNutrients() {
  const { state } = useAppState();
  const [openDialog, setOpenDialog] = useState<[string, number | undefined]>(['', undefined]);
  const [showViewError, setShowViewError] = useState<string>('');
  const [activeField, setActiveField] = useState<number>(0);
  const [balanceMessages, setBalanceMessages] = useState<Array<NutrientMessage>>([]);
  const [animalList] = useState<Array<AnimalData>>(state.nmpFile.years[0]?.FarmAnimals || []);

  const navigate = useNavigate();

  const [fieldList, setFieldList] = useState<Array<NMPFileFieldData>>(
    state.nmpFile.years[0].Fields || [],
  );

  const cropColumns: GridColDef[] = useMemo(() => {
    const handleEditRow = (e: { id: GridRowId; api: GridApiCommunity }) => {
      setOpenDialog(['crop', e.api.getRowIndexRelativeToVisibleRows(e.id)]);
    };
    const handleDeleteRow = genHandleDeleteRow(activeField, 'Crops', setFieldList);
    return generateColumns(handleEditRow, handleDeleteRow, renderNutrientCell);
  }, [activeField]);

  // TODO: Add manure columns

  const fertilizerColumns: GridColDef[] = useMemo(() => {
    const handleEditRow = (e: { id: GridRowId; api: GridApiCommunity }) => {
      setOpenDialog(['fertilizer', e.api.getRowIndexRelativeToVisibleRows(e.id)]);
    };
    const handleDeleteRow = genHandleDeleteRow(activeField, 'Fertilizers', setFieldList);
    return generateColumns(handleEditRow, handleDeleteRow, renderNutrientCell);
  }, [activeField]);

  const otherColumns: GridColDef[] = useMemo(() => {
    const handleEditRow = (e: { id: GridRowId; api: GridApiCommunity }) => {
      setOpenDialog(['other', e.api.getRowIndexRelativeToVisibleRows(e.id)]);
    };
    const handleDeleteRow = genHandleDeleteRow(activeField, 'OtherNutrients', setFieldList);
    return generateColumns(handleEditRow, handleDeleteRow, renderNutrientCell);
  }, [activeField]);

  const balanceRow: CalculateNutrientsColumn = useMemo(() => {
    const allRows = [
      ...fieldList[activeField].Crops,
      ...fieldList[activeField].Fertilizers,
      ...fieldList[activeField].OtherNutrients,
    ];
    return {
      name: 'Balance',
      reqN: allRows.reduce((sum, row) => sum + (row.reqN ?? 0), 0),
      reqP2o5: allRows.reduce((sum, row) => sum + (row.reqP2o5 ?? 0), 0),
      reqK2o: allRows.reduce((sum, row) => sum + (row.reqK2o ?? 0), 0),
      remN: allRows.reduce((sum, row) => sum + (row.remN ?? 0), 0),
      remP2o5: allRows.reduce((sum, row) => sum + (row.remP2o5 ?? 0), 0),
      remK2o: allRows.reduce((sum, row) => sum + (row.remK2o ?? 0), 0),
    };
  }, [fieldList, activeField]);

  const getMessage = useCallback((balanceType: string, balanceValue: number) => {
    const message = findBalanceMessage(balanceType, balanceValue);
    if (message && message.Icon !== '/good.svg') {
      setBalanceMessages((prev) => [
        ...prev,
        {
          ...message,
          Text: message.Text.replace('{0}', Math.abs(balanceValue ?? 0).toFixed(1)),
          Icon: message.Icon,
        },
      ]);
    }
  }, []);

  // When balance row changes, clear previous messages and set new messages
  useEffect(() => {
    setBalanceMessages([]);

    Object.entries(balanceRow).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'name') {
        getMessage(key, value as number);
      }
    });
  }, [balanceRow, getMessage]);

  // useCallback prevents unnecessary rerenders
  const handleDialogClose = useCallback(() => setOpenDialog(['', undefined]), []);

  const isFieldNameUnique = useCallback(
    (data: Partial<NMPFileFieldData>, index: number) =>
      !fieldList.some((fieldRow, idx) => fieldRow.FieldName === data.FieldName && index !== idx),
    [fieldList],
  );

  const handleNextPage = () => {
    setShowViewError('');

    navigate(REPORTING);
  };

  const handlePreviousPage = () => {
    if (activeField > 0) {
      setActiveField(activeField - 1);
    }

    if (animalList.length === 0) {
      navigate(NUTRIENT_ANALYSIS);
    } else {
      navigate(CROPS);
    }
  };

  const customCalcTableStyle = {
    '& .MuiDataGrid-columnHeader[data-field="reqN"] .MuiDataGrid-columnHeaderTitle': {
      marginLeft: '2em',
    },
    '& .MuiDataGrid-columnHeader[data-field="reqP2o5"] .MuiDataGrid-columnHeaderTitle': {
      marginLeft: '.5em',
    },
    '& .MuiDataGrid-columnHeader[data-field="reqK2o"] .MuiDataGrid-columnHeaderTitle': {
      marginLeft: '.5em',
    },
    '& .MuiDataGrid-columnHeader[data-field="remN"] .MuiDataGrid-columnHeaderTitle': {
      marginLeft: '2em',
    },
    '& .MuiDataGrid-columnHeader[data-field="remP2o5"] .MuiDataGrid-columnHeaderTitle': {
      marginLeft: '1em',
    },
    '& .MuiDataGrid-columnHeader[data-field="remK2o"] .MuiDataGrid-columnHeaderTitle': {
      marginLeft: '1.5em',
    },
  };

  return (
    <StyledContent>
      <ProgressStepper />
      <AppTitle />
      <PageTitle title="Calculate Nutrients" />
      <ButtonGroup>
        <Button
          size="medium"
          aria-label="Duplicate Field"
          onClick={() => {
            setOpenDialog(['field', undefined]);
          }}
        >
          <FontAwesomeIcon icon={faPlus} />
          Duplicate Field
        </Button>
      </ButtonGroup>
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
              setOpenDialog(['manure', undefined]);
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
              setOpenDialog(['fertilizer', undefined]);
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
              setOpenDialog(['fertigation', undefined]);
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
              setOpenDialog(['other', undefined]);
            }}
            variant="secondary"
          >
            <FontAwesomeIcon icon={faPlus} />
            Add Other
          </Button>
        </ButtonGroup>
        {openDialog[0] === 'field' && (
          <FieldListModal
            mode="Duplicate Field"
            initialModalData={fieldList[activeField]}
            rowEditIndex={undefined}
            setFieldList={setFieldList}
            isFieldNameUnique={isFieldNameUnique}
            isOpen={openDialog[0] === 'field'}
            onClose={handleDialogClose}
          />
        )}
        {openDialog[0] === 'crop' && (
          <CropsModal
            field={fieldList[activeField]}
            fieldIndex={activeField}
            cropIndex={openDialog[1]}
            initialModalData={fieldList[activeField].Crops[openDialog[1]!]}
            setFields={setFieldList}
            farmRegion={state.nmpFile.farmDetails.FarmRegion}
            isOpen={openDialog[0] === 'crop'}
            onClose={handleDialogClose}
          />
        )}
        {openDialog[0] === 'fertilizer' && (
          <FertilizerModal
            fieldIndex={activeField}
            initialModalData={
              openDialog[1] !== undefined
                ? fieldList[activeField].Fertilizers[openDialog[1]]
                : undefined
            }
            rowEditIndex={openDialog[1]}
            setFields={setFieldList}
            isOpen={openDialog[0] === 'fertilizer'}
            onClose={handleDialogClose}
            modalStyle={{ width: '800px' }}
          />
        )}
        {openDialog[0] === 'manure' && (
          <ManureModal
            initialModalData={undefined}
            farmManures={state.nmpFile.years[0].FarmManures || []}
            rowEditIndex={openDialog[1]}
            isOpen={openDialog[0] === 'manure'}
            onCancel={handleDialogClose}
            modalStyle={{ minWidth: '800px', overflowY: 'auto' }}
          />
        )}
        {/*
          // Note: this is currently unimplemented
          openDialog[0] === 'fertigation' && (
            <FertigationModal
              initialModalData={undefined}
              rowEditIndex={openDialog[1]}
              setFieldList={setFieldList}
              isOpen={openDialog[0] === 'fertigation'}
              onCancel={handleDialogClose}
              modalStyle={{ width: '700px' }}
            />
          )
        */}
        {openDialog[0] === 'other' && (
          <OtherModal
            fieldIndex={activeField}
            initialModalData={
              openDialog[1] !== undefined
                ? fieldList[activeField].OtherNutrients[openDialog[1]]
                : undefined
            }
            rowEditIndex={openDialog[1]}
            setFields={setFieldList}
            isOpen={openDialog[0] === 'other'}
            onClose={handleDialogClose}
            modalStyle={{ width: '700px' }}
          />
        )}
      </>
      <div
        style={{ display: 'flex', fontWeight: 'bold', textAlign: 'center', marginTop: '1.25rem' }}
      >
        <div style={{ width: 220 }} />
        <div style={{ width: 290 }}>
          Agronomic (lb/ac)
          <br />
          <Grid container>
            <Grid size="grow">
              <span>N</span>
            </Grid>
            <Grid size="grow">
              <span>
                P<sub>2</sub>O<sub>5</sub>
              </span>
            </Grid>
            <Grid size="grow">
              <span>
                K<sub>2</sub>O
              </span>
            </Grid>
          </Grid>
        </div>
        <div style={{ width: 250 }}>
          Crop Removal (lb/ac)
          <br />
          <Grid container>
            <Grid size="grow">
              <span>N</span>
            </Grid>
            <Grid size="grow">
              <span>
                P<sub>2</sub>O<sub>5</sub>
              </span>
            </Grid>
            <Grid size="grow">
              <span>
                K<sub>2</sub>O
              </span>
            </Grid>
          </Grid>
        </div>
      </div>

      {fieldList[activeField].Crops.length > 0 && (
        <>
          <span>Crop</span>
          <DataGrid
            sx={{ ...customTableStyle, ...customCalcTableStyle }}
            rows={fieldList[activeField].Crops}
            columns={cropColumns}
            getRowId={() => crypto.randomUUID()}
            disableRowSelectionOnClick
            disableColumnMenu
            columnHeaderHeight={0}
            hideFooterPagination
            hideFooter
          />
        </>
      )}
      {fieldList[activeField].Fertilizers.length > 0 && (
        <>
          <span>Fertilizer</span>
          <DataGrid
            sx={{ ...customTableStyle, ...customCalcTableStyle }}
            rows={fieldList[activeField].Fertilizers}
            columns={fertilizerColumns}
            getRowId={() => crypto.randomUUID()}
            disableRowSelectionOnClick
            disableColumnMenu
            columnHeaderHeight={0}
            hideFooterPagination
            hideFooter
          />
        </>
      )}
      {fieldList[activeField].OtherNutrients.length > 0 && (
        <>
          <span>Nutrient Source</span>
          <DataGrid
            sx={{ ...customTableStyle, ...customCalcTableStyle }}
            rows={fieldList[activeField].OtherNutrients}
            columns={otherColumns}
            getRowId={() => crypto.randomUUID()}
            disableRowSelectionOnClick
            disableColumnMenu
            columnHeaderHeight={0}
            hideFooterPagination
            hideFooter
          />
        </>
      )}
      <DataGrid
        sx={{ ...customTableStyle, ...customCalcTableStyle }}
        rows={[balanceRow]}
        columns={BALANCE_COLUMNS}
        getRowId={() => crypto.randomUUID()}
        disableRowSelectionOnClick
        disableColumnMenu
        columnHeaderHeight={0}
        hideFooterPagination
        hideFooter
      />
      <ErrorText>{showViewError}</ErrorText>
      {balanceMessages.map((msg) => (
        <Error key={msg.Id}>
          {/* based on msg get appropriate icon */}
          <Icon
            src={msg.Icon}
            alt="Nutrient balance icon"
          />
          <Message>{msg.Text}</Message>
        </Error>
      ))}
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
          onPress={handlePreviousPage}
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
