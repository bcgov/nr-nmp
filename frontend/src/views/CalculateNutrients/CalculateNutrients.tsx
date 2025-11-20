/**
 * @summary The calculate nutrients page for the application
 * calculates the field nutrients based on the crops and manure
 */
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { Button, ButtonGroup } from '@bcgov/design-system-react-components';
import { DataGrid, GridColDef, GridRowId } from '@mui/x-data-grid';
import { GridApiCommunity } from '@mui/x-data-grid/internals';
import useAppState from '@/hooks/useAppState';
import { calculatePrevYearManure } from '@/calculations/CalculateNutrients/PreviousManure';
import { Tabs, View } from '../../components/common';
import { CROPS, NUTRIENT_ANALYSIS, REPORTING } from '@/constants/routes';

import { customTableStyle, ErrorText } from '../../common.styles';

import { Error, Message, Icon } from './CalculateNutrients.styles';
import { NutrientMessage } from './nutrientMessages';
import FertilizerModal from './CalculateNutrientsComponents/FertilizerModal';
import ManureModal from './CalculateNutrientsComponents/ManureModal';
import OtherModal from './CalculateNutrientsComponents/OtherModal';
import FertigationModal from './CalculateNutrientsComponents/FertigationModal/FertigationModal.tsx';
import PreviousYearManureModal from './CalculateNutrientsComponents/PreviousYearManureModal';
import FieldListModal from '../../components/common/FieldListModal/FieldListModal';
import CropsModal from '../Crops/CropsModal';
import {
  BALANCE_COLUMNS,
  fertigationToFertigationRows,
  findBalanceMessage,
  generateColumns,
  genHandleDeleteRow,
  renderNutrientCell,
} from './utils.tsx';
import { CalculateNutrientsRow, NMPFileField, PreviousYearManureApplication } from '@/types';
import { APICacheContext } from '@/context/APICacheContext.tsx';
import SoilNitrateCreditModal from './CalculateNutrientsComponents/SoilNitrateCreditModal.tsx';

function NoRows() {
  return <div />;
}

export default function CalculateNutrients() {
  const { state, dispatch } = useAppState();
  const [openDialog, setOpenDialog] = useState<[string, number | undefined]>(['', undefined]);
  const [showViewError, setShowViewError] = useState<string>('');
  const [activeField, setActiveField] = useState<number>(0);
  const [balanceMessages, setBalanceMessages] = useState<NutrientMessage[]>([]);

  const navigate = useNavigate();

  const [fieldList, setFieldList] = useState<Array<NMPFileField>>(
    state.nmpFile.years[0].fields || [],
  );
  const apiCache = useContext(APICacheContext);
  const previousManureApplications: PreviousYearManureApplication[] =
    apiCache.getInitializedResponse('previousyearmanureapplications').data;
  const prevYearManureData = useMemo(() => {
    // Calculate previous year manure data when active field changes
    const currentField = fieldList[activeField];
    if (!currentField) {
      return null;
    }
    const prevData = calculatePrevYearManure(currentField, previousManureApplications);
    if (!currentField.previousYearManureApplicationNCredit) {
      currentField.previousYearManureApplicationNCredit = prevData.nitrogen;
    }
    return prevData;
  }, [activeField, fieldList, previousManureApplications]);

  const cropColumns: GridColDef[] = useMemo(() => {
    const handleEditRow = (e: { id: GridRowId; api: GridApiCommunity }) => {
      setOpenDialog(['crop', e.api.getRowIndexRelativeToVisibleRows(e.id)]);
    };
    const handleDeleteRow = genHandleDeleteRow(activeField, 'crops', setFieldList);
    return generateColumns(
      handleEditRow,
      handleDeleteRow,
      renderNutrientCell,
      fieldList[activeField].crops?.length ? 'Crops' : undefined,
      false,
    );
  }, [activeField, fieldList]);

  const manureColumns: GridColDef[] = useMemo(() => {
    const handleEditRow = (e: { id: GridRowId; api: GridApiCommunity }) => {
      setOpenDialog(['manure', e.api.getRowIndexRelativeToVisibleRows(e.id)]);
    };
    const handleDeleteRow = (e: { id: GridRowId; api: GridApiCommunity }) => {
      setFieldList((prev) => {
        const index = e.api.getRowIndexRelativeToVisibleRows(e.id);
        const nextFieldArray = [...prev];
        const manures = [...nextFieldArray[activeField].manures];
        manures.splice(index, 1);
        nextFieldArray[activeField].manures = manures;
        return nextFieldArray;
      });
    };
    return generateColumns(handleEditRow, handleDeleteRow, renderNutrientCell, 'Manures', true);
  }, [activeField]);

  const fertilizerColumns: GridColDef[] = useMemo(() => {
    const handleEditRow = (e: { id: GridRowId; api: GridApiCommunity }) => {
      setOpenDialog(['fertilizer', e.api.getRowIndexRelativeToVisibleRows(e.id)]);
    };
    const handleDeleteRow = genHandleDeleteRow(activeField, 'fertilizers', setFieldList);
    return generateColumns(handleEditRow, handleDeleteRow, renderNutrientCell, 'Fertilizers', true);
  }, [activeField]);

  const fertigationRows = useMemo(
    () => fertigationToFertigationRows(fieldList[activeField].fertigations),
    [fieldList, activeField],
  );

  // This uses the index defined in fertigationRows
  const fertigationColumns: GridColDef[] = useMemo(() => {
    const handleEditRow = (e: { row: { index: number } }) => {
      setOpenDialog(['fertigation', e.row.index]);
    };
    const handleDeleteRow = (e: { row: { index: number } }) => {
      setFieldList((prev) => {
        const fertigations = [...prev[activeField].fertigations];
        fertigations.splice(e.row.index, 1);
        const nextFieldArray = [...prev];
        nextFieldArray[activeField].fertigations = fertigations;
        return nextFieldArray;
      });
    };
    return generateColumns(handleEditRow, handleDeleteRow, renderNutrientCell, 'Fertigation', true);
  }, [activeField]);

  const otherColumns: GridColDef[] = useMemo(() => {
    const handleEditRow = (e: { id: GridRowId; api: GridApiCommunity }) => {
      setOpenDialog(['other', e.api.getRowIndexRelativeToVisibleRows(e.id)]);
    };
    const handleDeleteRow = genHandleDeleteRow(activeField, 'otherNutrients', setFieldList);
    return generateColumns(handleEditRow, handleDeleteRow, renderNutrientCell, 'Other', true);
  }, [activeField]);

  const soilNitrateColumns: GridColDef[] = useMemo(() => {
    const handleEditRow = (e: { id: GridRowId; api: GridApiCommunity }) => {
      setOpenDialog(['soilNitrate', e.api.getRowIndexRelativeToVisibleRows(e.id)]);
    };
    const handleDeleteRow = genHandleDeleteRow(activeField, 'soilNitrateCredit', setFieldList);
    return generateColumns(handleEditRow, handleDeleteRow, renderNutrientCell, '', true, false);
  }, [activeField]);

  const previousYearManureColumns: GridColDef[] = useMemo(
    () =>
      generateColumns(
        () => setOpenDialog(['previousYearManure', 0]),
        () => {},
        renderNutrientCell,
        'Previous Year Manure',
        true,
        false,
      ),
    [],
  );

  const balanceRow: CalculateNutrientsRow = useMemo(() => {
    const allRows = [
      ...fieldList[activeField].crops,
      ...fieldList[activeField].fertilizers,
      ...fieldList[activeField].fertigations,
      ...fieldList[activeField].otherNutrients,
      ...fieldList[activeField].manures,
      ...fieldList[activeField].soilNitrateCredit,
    ];

    // Add previous year manure nitrogen credit to the balance
    const prevYearNitrogen = prevYearManureData?.display ? prevYearManureData.nitrogen || 0 : 0;

    return {
      name: 'Balance',
      reqN:
        Math.round(
          (allRows.reduce((sum, row) => sum + (row.reqN ?? 0), 0) + prevYearNitrogen) * 10,
        ) / 10,
      reqP2o5: Math.round(allRows.reduce((sum, row) => sum + (row.reqP2o5 ?? 0), 0) * 10) / 10,
      reqK2o: Math.round(allRows.reduce((sum, row) => sum + (row.reqK2o ?? 0), 0) * 10) / 10,
      remN: Math.round(allRows.reduce((sum, row) => sum + (row.remN ?? 0), 0) * 10) / 10,
      remP2o5: Math.round(allRows.reduce((sum, row) => sum + (row.remP2o5 ?? 0), 0) * 10) / 10,
      remK2o: Math.round(allRows.reduce((sum, row) => sum + (row.remK2o ?? 0), 0) * 10) / 10,
    };
  }, [fieldList, activeField, prevYearManureData]);

  // When balance row changes, clear previous messages and set new messages
  useEffect(() => {
    const newMessages: NutrientMessage[] = [];
    Object.entries(balanceRow).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'name') {
        let message = findBalanceMessage(key, value);
        if (message) {
          if (message.icon !== '/good.svg') {
            message = {
              ...message,
              text: message.text.replace('{0}', Math.abs(value ?? 0).toFixed(1)),
              icon: message.icon,
            };
          }
          newMessages.push(message);
        }
      }
    });
    setBalanceMessages(newMessages);
  }, [balanceRow]);

  // useCallback prevents unnecessary rerenders
  const handleDialogClose = useCallback(() => setOpenDialog(['', undefined]), []);

  const isFieldNameUnique = useCallback(
    (data: Partial<NMPFileField>, index: number) =>
      !fieldList.some((fieldRow, idx) => fieldRow.fieldName === data.fieldName && index !== idx),
    [fieldList],
  );

  const handleNextPage = (navigateTo: string = '') => {
    setShowViewError('');
    dispatch({
      type: 'SAVE_FIELDS',
      year: state.nmpFile.farmDetails.year,
      newFields: fieldList,
    });
    navigate(navigateTo || REPORTING);
  };

  const handlePreviousPage = () => {
    dispatch({
      type: 'SAVE_FIELDS',
      year: state.nmpFile.farmDetails.year,
      newFields: fieldList,
    });
    if (activeField > 0) {
      setActiveField(activeField - 1);
    } else if (!state.showAnimalsStep) {
      navigate(NUTRIENT_ANALYSIS);
    } else {
      navigate(CROPS);
    }
  };

  const customCalcTableStyle = {
    '& .MuiDataGrid-columnHeaderTitleContainerContent': {
      fontWeight: 'bold',
    },
    '& .MuiDataGrid-overlayWrapperInner': {
      fontWeight: 'bold',
    },
    '& .MuiDataGrid-columnHeader': {
      backgroundColor: 'white !important',
      borderColor: 'none !important',
    },
  };

  return (
    <View
      title="Calculate Nutrients"
      handleBack={handlePreviousPage}
      handleNext={() => {
        if (activeField < fieldList.length - 1) {
          dispatch({
            type: 'SAVE_FIELDS',
            year: state.nmpFile.farmDetails.year,
            newFields: fieldList,
          });
          setActiveField(activeField + 1);
        } else {
          handleNextPage();
        }
      }}
    >
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
      <Tabs
        activeTab={activeField}
        tabLabel={fieldList.length > 0 ? fieldList.map((field) => field.fieldName) : ['Field 1']}
      />
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
          initialModalData={fieldList[activeField].crops[openDialog[1]!]}
          setFields={setFieldList}
          isOpen={openDialog[0] === 'crop'}
          onClose={handleDialogClose}
        />
      )}
      {openDialog[0] === 'fertilizer' && (
        <FertilizerModal
          fieldIndex={activeField}
          // NOTE: Custom fertilizer nutrients aren't saved
          initialModalData={
            openDialog[1] !== undefined
              ? fieldList[activeField].fertilizers[openDialog[1]]
              : undefined
          }
          rowEditIndex={openDialog[1]}
          setFields={setFieldList}
          balanceRow={balanceRow}
          isOpen={openDialog[0] === 'fertilizer'}
          onClose={handleDialogClose}
          modalStyle={{ width: '800px' }}
        />
      )}
      {openDialog[0] === 'manure' && (
        <ManureModal
          fieldIndex={activeField}
          initialModalData={
            openDialog[1] !== undefined ? fieldList[activeField].manures[openDialog[1]] : undefined
          }
          field={fieldList[activeField]}
          fields={fieldList}
          rowEditIndex={openDialog[1]}
          setFields={setFieldList}
          isOpen={openDialog[0] === 'manure'}
          onCancel={handleDialogClose}
          modalStyle={{ minWidth: '800px', overflowY: 'auto' }}
          navigateAway={handleNextPage}
        />
      )}
      {openDialog[0] === 'fertigation' && (
        <FertigationModal
          fieldIndex={activeField}
          initialModalData={
            openDialog[1] !== undefined
              ? fieldList[activeField].fertigations[openDialog[1]]
              : undefined
          }
          rowEditIndex={openDialog[1]}
          balanceRow={balanceRow}
          field={fieldList[activeField]}
          setFields={setFieldList}
          isOpen={openDialog[0] === 'fertigation'}
          onClose={handleDialogClose}
          modalStyle={{ minWidth: '950px', overflowY: 'auto' }}
        />
      )}
      {openDialog[0] === 'other' && (
        <OtherModal
          fieldIndex={activeField}
          initialModalData={
            openDialog[1] !== undefined
              ? fieldList[activeField].otherNutrients[openDialog[1]]
              : undefined
          }
          rowEditIndex={openDialog[1]}
          setFields={setFieldList}
          isOpen={openDialog[0] === 'other'}
          onClose={handleDialogClose}
          modalStyle={{ width: '700px' }}
        />
      )}
      {openDialog[0] === 'soilNitrate' && (
        <SoilNitrateCreditModal
          fieldIndex={activeField}
          initialModalData={
            openDialog[1] !== undefined
              ? fieldList[activeField].soilNitrateCredit[openDialog[1]]
              : undefined
          }
          rowEditIndex={openDialog[1]}
          setFields={setFieldList}
          isOpen={openDialog[0] === 'soilNitrate'}
          onClose={handleDialogClose}
          modalStyle={{ width: '700px' }}
        />
      )}
      {openDialog[0] === 'previousYearManure' && (
        <PreviousYearManureModal
          fieldIndex={activeField}
          isOpen
          onClose={handleDialogClose}
          setFields={setFieldList}
          modalStyle={{ width: '600px' }}
          field={fieldList[activeField]}
          initialModalData={{
            previousYearManureApplicationId: fieldList[activeField].previousYearManureApplicationId,
            previousYearManureApplicationNCredit:
              fieldList[activeField].previousYearManureApplicationNCredit,
          }}
        />
      )}
      <div
        style={{ display: 'flex', fontWeight: 'bold', textAlign: 'center', marginTop: '1.25rem' }}
      >
        <div style={{ width: 220 }} />
        <div style={{ width: 360 }}>Agronomic (lb/ac)</div>
        <div style={{ width: 190 }}>Crop Removal (lb/ac)</div>
      </div>
      <DataGrid
        sx={{
          ...customTableStyle,
          ...customCalcTableStyle,
          '--DataGrid-overlayHeight': '0px',
          '--DataGrid-rowBorderColor':
            fieldList[activeField]?.crops.length > 0 ? 'inherit' : 'none',
        }}
        rows={fieldList[activeField].crops}
        columns={cropColumns}
        getRowId={() => crypto.randomUUID()}
        disableRowSelectionOnClick
        disableColumnMenu
        columnHeaderHeight={24}
        hideFooterPagination
        hideFooter
        slots={{ noRowsOverlay: NoRows }}
      />
      {/* Previous Year Manure Row */}
      {prevYearManureData?.display && (
        <DataGrid
          sx={{ ...customTableStyle, ...customCalcTableStyle }}
          rows={[
            {
              name: '',
              reqN: prevYearManureData.nitrogen || 0,
              reqP2o5: 0,
              reqK2o: 0,
              remN: 0,
              remP2o5: 0,
              remK2o: 0,
            },
          ]}
          columns={previousYearManureColumns}
          getRowId={() => crypto.randomUUID()}
          disableRowSelectionOnClick
          disableColumnMenu
          columnHeaderHeight={16}
          hideFooterPagination
          hideFooter
        />
      )}
      {fieldList[activeField].fertilizers.length > 0 && (
        <DataGrid
          sx={{ ...customTableStyle, ...customCalcTableStyle }}
          rows={fieldList[activeField].fertilizers}
          columns={fertilizerColumns}
          getRowId={() => crypto.randomUUID()}
          disableRowSelectionOnClick
          disableColumnMenu
          columnHeaderHeight={16}
          hideFooterPagination
          hideFooter
        />
      )}
      {fieldList[activeField].manures.length > 0 && (
        <DataGrid
          sx={{ ...customTableStyle, ...customCalcTableStyle }}
          rows={fieldList[activeField].manures}
          columns={manureColumns}
          getRowId={() => crypto.randomUUID()}
          disableRowSelectionOnClick
          disableColumnMenu
          columnHeaderHeight={16}
          hideFooterPagination
          hideFooter
        />
      )}
      {fieldList[activeField].fertigations.length > 0 && (
        <DataGrid
          sx={{ ...customTableStyle, ...customCalcTableStyle }}
          rows={fertigationRows}
          columns={fertigationColumns}
          getRowId={() => crypto.randomUUID()}
          disableRowSelectionOnClick
          disableColumnMenu
          columnHeaderHeight={16}
          hideFooterPagination
          hideFooter
        />
      )}
      {fieldList[activeField].otherNutrients.length > 0 && (
        <DataGrid
          sx={{ ...customTableStyle, ...customCalcTableStyle }}
          rows={fieldList[activeField].otherNutrients}
          columns={otherColumns}
          getRowId={() => crypto.randomUUID()}
          disableRowSelectionOnClick
          disableColumnMenu
          columnHeaderHeight={16}
          hideFooterPagination
          hideFooter
        />
      )}
      {fieldList[activeField].soilNitrateCredit?.length > 0 && (
        <DataGrid
          sx={{ ...customTableStyle, ...customCalcTableStyle }}
          rows={fieldList[activeField].soilNitrateCredit}
          columns={soilNitrateColumns}
          getRowId={() => crypto.randomUUID()}
          disableRowSelectionOnClick
          disableColumnMenu
          columnHeaderHeight={16}
          hideFooterPagination
          hideFooter
        />
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
        <Error key={msg.id}>
          {/* based on msg get appropriate icon */}
          <Icon
            src={msg.icon}
            alt="Nutrient balance icon"
          />
          <Message>{msg.text}</Message>
        </Error>
      ))}
    </View>
  );
}
