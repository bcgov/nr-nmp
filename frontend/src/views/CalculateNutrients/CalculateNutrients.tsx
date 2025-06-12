/**
 * @summary The calculate nutrients page for the application
 * calculates the field nutrients based on the crops and manure
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Button, ButtonGroup } from '@bcgov/design-system-react-components';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { margin } from 'node_modules/@mui/system/esm/spacing/spacing';
import useAppService from '@/services/app/useAppService';
import { AppTitle, PageTitle, ProgressStepper, TabsMaterial } from '../../components/common';
import { NMPFileFieldData } from '@/types/NMPFileFieldData';
import { FIELD_LIST, CROPS } from '@/constants/RouteConstants';
import { renderNutrientCell, initFields } from '../../utils/utils.ts';

import { customTableStyle, tableActionButtonCss } from '../../common.styles';
import { ErrorText, StyledContent } from '../FieldList/fieldList.styles';
import { Error, Message, Icon } from './CalculateNutrients.styles';
import { NutrientMessage, nutrientMessages } from './nutrientMessages';
import NewFertilizerModal from './FertilizerModal/NewFertilizerModal';
import ManureModal from './CalculateNutrientsComponents/ManureModal';
import OtherModal from './CalculateNutrientsComponents/OtherModal';
import FertigationModal from './CalculateNutrientsComponents/FertigationModal';
import FieldListModal from '../../components/common/FieldListModal/FieldListModal';

export default function CalculateNutrients() {
  // setNMPFile not yet used
  // const { state, setNMPFile } = useAppService();
  const { state } = useAppService();
  const [rowEditIndex, setRowEditIndex] = useState<number | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [showViewError, setShowViewError] = useState<string>('');
  const [buttonClicked, setButtonClicked] = useState<string>('');
  const [activeField, setActiveField] = useState<number>(0);
  const [balanceMessages, setBalanceMessages] = useState<Array<NutrientMessage>>([]);

  const navigate = useNavigate();

  const [fieldList, setFieldList] = useState<Array<NMPFileFieldData>>(initFields(state));

  // Var for table rows for the crops and their total balance, if no crops then array is empty and there is no balance row
  const crops = useMemo(
    () => (fieldList[activeField]?.Crops ? fieldList[activeField].Crops : []),
    [fieldList, activeField],
  );
  const balanceRow = useMemo(
    () => ({
      index: 'balance',
      cropName: 'Balance',
      reqN: crops.reduce((sum, row) => sum + (row.reqN ?? 0), 0),
      reqP2o5: crops.reduce((sum, row) => sum + (row.reqP2o5 ?? 0), 0),
      reqK2o: crops.reduce((sum, row) => sum + (row.reqK2o ?? 0), 0),
      remN: crops.reduce((sum, row) => sum + (row.remN ?? 0), 0),
      remP2o5: crops.reduce((sum, row) => sum + (row.remP2o5 ?? 0), 0),
      remK2o: crops.reduce((sum, row) => sum + (row.remK2o ?? 0), 0),
    }),
    [crops],
  );
  const rowsWithBalance = crops.length > 0 ? [...crops, balanceRow] : [];

  // find the appropriate balance message based on the nutrient type and value
  const findBalanceMessage = (balanceType: string, balanceValue: number) =>
    nutrientMessages.find((msg) => {
      if (msg.BalanceType !== balanceType) return false;

      // either compares balance value to req (agronomic) or rem (crop removal) high low range
      const isReq = balanceType.startsWith('req');
      const low = isReq ? msg.ReqBalanceLow : msg.RemBalanceLow;
      const high = isReq ? msg.ReqBalanceHigh : msg.RemBalanceHigh;

      return balanceValue >= low && balanceValue <= high;
    });

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
    console.log(balanceRow);

    Object.entries(balanceRow).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'cropName') {
        getMessage(key, value as number);
      }
    });
  }, [balanceRow, getMessage]);

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
    //     fieldList,
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

  const columns: GridColDef[] = useMemo(
    () => [
      { field: 'cropName', headerName: 'Crop', width: 230, minWidth: 200, maxWidth: 300 },
      {
        field: 'reqN',
        headerName: 'N',
        width: 80,
        minWidth: 80,
        maxWidth: 100,
        description: 'Nitrogen',
        renderCell: renderNutrientCell('reqN', findBalanceMessage),
      },
      {
        field: 'reqP2o5',
        headerName: 'P2o5',
        width: 80,
        minWidth: 80,
        maxWidth: 100,
        description: 'Phosphorous',
        renderCell: renderNutrientCell('reqP2o5', findBalanceMessage),
      },
      {
        field: 'reqK2o',
        headerName: 'K2o',
        width: 120,
        minWidth: 120,
        maxWidth: 100,
        description: 'Potassium',
        renderCell: renderNutrientCell('reqK2o', findBalanceMessage),
      },
      {
        field: 'remN',
        headerName: 'N',
        width: 80,
        minWidth: 80,
        maxWidth: 100,
        description: 'Nitrogen',
        renderCell: renderNutrientCell('remN', findBalanceMessage),
      },
      {
        field: 'remP2o5',
        headerName: 'P2o5',
        width: 80,
        minWidth: 80,
        maxWidth: 100,
        description: 'Phosphorous',
        renderCell: renderNutrientCell('remP2o5', findBalanceMessage),
      },
      {
        field: 'remK2o',
        headerName: 'K2o',
        width: 130,
        minWidth: 60,
        maxWidth: 130,
        description: 'Potassium',
        renderCell: renderNutrientCell('remK2o', findBalanceMessage),
      },
      {
        field: '',
        headerName: 'Actions',
        width: 100,
        renderCell: (row: any) => {
          // If balance row don't show actions
          const isBalanceRow = row.row.cropName === 'Balance';
          return !isBalanceRow ? (
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
          ) : null;
        },
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
        onClick={() => {
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
            initialModalData={undefined}
            rowEditIndex={rowEditIndex}
            isOpen={isDialogOpen}
            onClose={handleDialogClose}
            modalStyle={{ width: '700px' }}
          />
        )}
      </>
      <div
        style={{ display: 'flex', fontWeight: 'bold', textAlign: 'center', marginTop: '1.25rem' }}
      >
        <div style={{ width: 220 }} />
        <div style={{ width: 290 }}>Agronomic (lb/ac)</div>
        <div style={{ width: 250 }}>Crop Removal (lb/ac)</div>
      </div>
      {/* display crops belonging to the field of the tab the user is on */}
      <DataGrid
        sx={{ ...customTableStyle, ...customCalcTableStyle }}
        rows={rowsWithBalance}
        columns={columns}
        getRowId={(row: any) => row.index}
        disableRowSelectionOnClick
        disableColumnMenu
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
