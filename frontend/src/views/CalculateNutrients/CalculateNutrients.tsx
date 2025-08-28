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
import useAppState from '@/hooks/useAppState';
import { Tabs, View } from '../../components/common';
import { NMPFileFieldData } from '@/types/NMPFileFieldData';
import { CROPS, NUTRIENT_ANALYSIS, REPORTING } from '@/constants/routes';

import { customTableStyle, ErrorText } from '../../common.styles';

import { Error, Message, Icon } from './CalculateNutrients.styles';
import { NutrientMessage } from './nutrientMessages';
import FertilizerModal from './CalculateNutrientsComponents/FertilizerModal';
import ManureModal from './CalculateNutrientsComponents/ManureModal';
import OtherModal from './CalculateNutrientsComponents/OtherModal';
import FertigationModal from './CalculateNutrientsComponents/FertigationModal/FertigationModal.tsx';
import FieldListModal from '../../components/common/FieldListModal/FieldListModal';
import CropsModal from '../Crops/CropsModal';
import {
  BALANCE_COLUMNS,
  findBalanceMessage,
  generateColumns,
  genHandleDeleteRow,
  renderNutrientCell,
} from './utils.tsx';
import { CalculateNutrientsColumn, Schedule } from '@/types';

function NoRows() {
  return <div />;
}

export default function CalculateNutrients() {
  const { state, dispatch } = useAppState();
  const [openDialog, setOpenDialog] = useState<[string, number | undefined]>(['', undefined]);
  const [showViewError, setShowViewError] = useState<string>('');
  const [activeField, setActiveField] = useState<number>(0);
  const [balanceMessages, setBalanceMessages] = useState<Array<NutrientMessage>>([]);

  const navigate = useNavigate();

  const [fieldList, setFieldList] = useState<Array<NMPFileFieldData>>(
    state.nmpFile.years[0].Fields || [],
  );

  const cropColumns: GridColDef[] = useMemo(() => {
    const handleEditRow = (e: { id: GridRowId; api: GridApiCommunity }) => {
      setOpenDialog(['crop', e.api.getRowIndexRelativeToVisibleRows(e.id)]);
    };
    const handleDeleteRow = genHandleDeleteRow(activeField, 'Crops', setFieldList);
    return generateColumns(
      handleEditRow,
      handleDeleteRow,
      renderNutrientCell,
      fieldList[activeField].Crops?.length ? 'Crops' : undefined,
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
        const manures = [...nextFieldArray[activeField].Manures];
        manures.splice(index, 1);
        nextFieldArray[activeField].Manures = manures;
        return nextFieldArray;
      });
    };
    return generateColumns(handleEditRow, handleDeleteRow, renderNutrientCell, 'Manures', true);
  }, [activeField]);

  const fertilizerColumns: GridColDef[] = useMemo(() => {
    const handleEditRow = (e: { id: GridRowId; api: GridApiCommunity }) => {
      setOpenDialog(['fertilizer', e.api.getRowIndexRelativeToVisibleRows(e.id)]);
    };
    const handleDeleteRow = genHandleDeleteRow(activeField, 'Fertilizers', setFieldList);
    return generateColumns(handleEditRow, handleDeleteRow, renderNutrientCell, 'Fertilizers', true);
  }, [activeField]);

  // Instead of making one row per fertigation, there is one row per application
  // An index attr is added to track its spot in the array
  const fertigationRows = useMemo(
    () =>
      fieldList[activeField].Fertigations.reduce((accRows, fertigation, index) => {
        const nutrientColumns: CalculateNutrientsColumn = {
          name: fertigation.name,
          reqN: fertigation.reqN,
          reqP2o5: fertigation.remP2o5,
          reqK2o: fertigation.reqK2o,
          remN: fertigation.remN,
          remP2o5: fertigation.remP2o5,
          remK2o: fertigation.remK2o,
        };

        // Undefined means to jump by a month
        let dayJump;
        switch (fertigation.schedule) {
          case Schedule.Daily:
            dayJump = 1;
            break;
          case Schedule.Weekly:
            dayJump = 7;
            break;
          case Schedule.Biweekly:
            dayJump = 14;
            break;
          default:
            dayJump = undefined;
        }
        const date = new Date(fertigation.startDate!);
        for (let i = 0; i < fertigation.eventsPerSeason; i += 1) {
          const splitDateStr = date.toDateString().split(' ');
          // Format is like 01 Jan
          accRows.push({
            date: `${splitDateStr[2]} ${splitDateStr[1]}`,
            action: i,
            index,
            ...nutrientColumns,
          });
          if (dayJump) {
            date.setDate(date.getDate() + dayJump);
          } else {
            date.setMonth(date.getMonth() + 1);
          }
        }
        return accRows;
      }, [] as any[]),
    [fieldList, activeField],
  );

  // This uses the index defined in fertigationRows
  const fertigationColumns: GridColDef[] = useMemo(() => {
    const handleEditRow = (e: { row: { index: number } }) => {
      setOpenDialog(['fertigation', e.row.index]);
    };
    const handleDeleteRow = (e: { row: { index: number } }) => {
      setFieldList((prev) => {
        const fertigations = [...prev[activeField].Fertigations];
        fertigations.splice(e.row.index, 1);
        const nextFieldArray = [...prev];
        nextFieldArray[activeField].Fertigations = fertigations;
        return nextFieldArray;
      });
    };
    return generateColumns(handleEditRow, handleDeleteRow, renderNutrientCell, 'Fertigation', true);
  }, [activeField]);

  const otherColumns: GridColDef[] = useMemo(() => {
    const handleEditRow = (e: { id: GridRowId; api: GridApiCommunity }) => {
      setOpenDialog(['other', e.api.getRowIndexRelativeToVisibleRows(e.id)]);
    };
    const handleDeleteRow = genHandleDeleteRow(activeField, 'OtherNutrients', setFieldList);
    return generateColumns(handleEditRow, handleDeleteRow, renderNutrientCell, 'Other', true);
  }, [activeField]);

  const balanceRow: CalculateNutrientsColumn = useMemo(() => {
    const allRows = [
      ...fieldList[activeField].Crops,
      ...fieldList[activeField].Fertilizers,
      ...fieldList[activeField].Fertigations,
      ...fieldList[activeField].OtherNutrients,
      ...fieldList[activeField].Manures,
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
    dispatch({
      type: 'SAVE_FIELDS',
      year: state.nmpFile.farmDetails.Year!,
      newFields: fieldList,
    });

    navigate(REPORTING);
  };

  const handlePreviousPage = () => {
    dispatch({
      type: 'SAVE_FIELDS',
      year: state.nmpFile.farmDetails.Year!,
      newFields: fieldList,
    });
    if (activeField > 0) {
      setActiveField(activeField - 1);
    }

    if (!state.showAnimalsStep) {
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
      // Go to next tab or if none navigate to nutrient analysis
      handleNext={() => {
        if (activeField < fieldList.length - 1) {
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
        tabLabel={fieldList.length > 0 ? fieldList.map((field) => field.FieldName) : ['Field 1']}
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
          // NOTE: Custom fertilizer nutrients aren't saved
          initialModalData={
            openDialog[1] !== undefined
              ? fieldList[activeField].Fertilizers[openDialog[1]]
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
            openDialog[1] !== undefined ? fieldList[activeField].Manures[openDialog[1]] : undefined
          }
          field={fieldList[activeField]}
          rowEditIndex={openDialog[1]}
          setFields={setFieldList}
          isOpen={openDialog[0] === 'manure'}
          onCancel={handleDialogClose}
          modalStyle={{ minWidth: '800px', overflowY: 'auto' }}
        />
      )}
      {openDialog[0] === 'fertigation' && (
        <FertigationModal
          fieldIndex={activeField}
          initialModalData={
            openDialog[1] !== undefined
              ? fieldList[activeField].Fertigations[openDialog[1]]
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
            fieldList[activeField]?.Crops.length > 0 ? 'inherit' : 'none',
        }}
        rows={fieldList[activeField].Crops}
        columns={cropColumns}
        getRowId={() => crypto.randomUUID()}
        disableRowSelectionOnClick
        disableColumnMenu
        columnHeaderHeight={24}
        hideFooterPagination
        hideFooter
        slots={{ noRowsOverlay: NoRows }}
      />

      {fieldList[activeField].Fertilizers.length > 0 && (
        <DataGrid
          sx={{ ...customTableStyle, ...customCalcTableStyle }}
          rows={fieldList[activeField].Fertilizers}
          columns={fertilizerColumns}
          getRowId={() => crypto.randomUUID()}
          disableRowSelectionOnClick
          disableColumnMenu
          columnHeaderHeight={16}
          hideFooterPagination
          hideFooter
        />
      )}
      {fieldList[activeField].Manures.length > 0 && (
        <DataGrid
          sx={{ ...customTableStyle, ...customCalcTableStyle }}
          rows={fieldList[activeField].Manures}
          columns={manureColumns}
          getRowId={() => crypto.randomUUID()}
          disableRowSelectionOnClick
          disableColumnMenu
          columnHeaderHeight={16}
          hideFooterPagination
          hideFooter
        />
      )}
      {fieldList[activeField].Fertigations.length > 0 && (
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
      {fieldList[activeField].OtherNutrients.length > 0 && (
        <DataGrid
          sx={{ ...customTableStyle, ...customCalcTableStyle }}
          rows={fieldList[activeField].OtherNutrients}
          columns={otherColumns}
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
        <Error key={msg.Id}>
          {/* based on msg get appropriate icon */}
          <Icon
            src={msg.Icon}
            alt="Nutrient balance icon"
          />
          <Message>{msg.Text}</Message>
        </Error>
      ))}
    </View>
  );
}
