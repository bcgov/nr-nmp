/**
 * @summary The field table on the calculate nutrients page
 */
import { useContext, useEffect, useState, Dispatch, SetStateAction } from 'react';
import Grid from '@mui/material/Grid';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { APICacheContext } from '@/context/APICacheContext';
import { customTableStyle, formGridBreakpoints } from '@/common.styles';
import { Form, NumberField, Select } from '@/components/common';
import Modal, { ModalProps } from '@/components/common/Modal/Modal';
// Data not seeded in DB.
import SEASON_APPLICATION from '../unseededData';
import { EMPTY_CROP_NUTRIENTS } from '@/constants';

import {
  CropNutrients,
  NMPFileFieldData,
  NMPFileNutrientAnalysis,
  NMPFileAppliedManure,
  SelectOption,
  Units,
} from '@/types';
import { getNutrientInputs } from '@/calculations/ManureAndCompost/ManureAndImports/Calculations';
import useAppState from '@/hooks/useAppState';

// TODO: Remove once we start filtering by manure type. This is to prevent
// re-running the map function on each render
const MANURE_APPLICATION_METHODS = SEASON_APPLICATION.map((ele) => ({
  id: ele.Id,
  label: ele.Name,
}));

type ManureFormFields = {
  materialType: string;
  applicationMethod: number;
  applicationRate: number;
  applUnit: number;
  retentionAmmoniumN: number;
  organicNAvailable: number;
};

type AddManureModalProps = {
  initialModalData?: ManureFormFields;
  manuresWithNutrients: NMPFileNutrientAnalysis[];
  rowEditIndex?: number;
  field: NMPFileFieldData;
  setFields: Dispatch<SetStateAction<NMPFileFieldData[]>>;
  onCancel: () => void;
};

const NUTRIENT_COLUMNS: GridColDef[] = [
  {
    field: 'N',
    headerName: 'N',
    width: 80,
    minWidth: 75,
    maxWidth: 200,
    sortable: false,
    resizable: false,
  },
  {
    field: 'P2O5',
    headerName: 'P2O5',
    width: 80,
    minWidth: 75,
    maxWidth: 200,
    sortable: false,
    resizable: false,
  },
  {
    field: 'K2O',
    headerName: 'K2O',
    width: 80,
    minWidth: 75,
    maxWidth: 200,
    sortable: false,
    resizable: false,
  },
];

const DEFAULT_MANURE_FORM_FIELDS: ManureFormFields = {
  materialType: '',
  applicationMethod: 0,
  applicationRate: 0,
  applUnit: 0,
  retentionAmmoniumN: 0,
  organicNAvailable: 0,
};

export default function ManureModal({
  initialModalData,
  manuresWithNutrients,
  onCancel,
  field,
  setFields,
  ...props
}: AddManureModalProps & Omit<ModalProps, 'title' | 'children' | 'onOpenChange'>) {
  const [manureForm, setManureForm] = useState<ManureFormFields>(
    initialModalData || DEFAULT_MANURE_FORM_FIELDS,
  );
  const apiCache = useContext(APICacheContext);
  const { state, dispatch } = useAppState();

  const [manureUnits, setManureUnits] = useState<SelectOption<Units>[]>([]);

  const [availableThisYearTable, setAvailableThisYearTable] =
    useState<CropNutrients>(EMPTY_CROP_NUTRIENTS);
  const [availableLongTermTable, setAvailableLongTermTable] =
    useState<CropNutrients>(EMPTY_CROP_NUTRIENTS);
  const [stillReqTable, setStillReqTable] = useState<CropNutrients>(EMPTY_CROP_NUTRIENTS);

  // get fertilizer types, names, and conversion units
  useEffect(() => {
    apiCache.callEndpoint('api/units/').then((response: { status?: any; data: any }) => {
      if (response.status === 200) {
        const { data } = response;
        setManureUnits(
          (data as Units[]).map((unit) => ({
            value: unit,
            id: unit.id,
            label: unit.name,
          })),
        );
      }
    });
  }, [apiCache, manureForm.materialType]);

  const handleModalClose = () => {
    setAvailableThisYearTable(EMPTY_CROP_NUTRIENTS);
    setAvailableLongTermTable(EMPTY_CROP_NUTRIENTS);
    setStillReqTable(EMPTY_CROP_NUTRIENTS);
    onCancel();
  };

  const handleSubmit = () => {
    debugger;
    if (!field) {
      console.error('No field selected for manure application');
      return;
    }

    // Find the selected farm manure
    const selectedManure = manuresWithNutrients.find(
      (manure) => manure.materialType === manureForm.materialType,
    );

    if (!selectedManure) {
      console.error('Selected farm manure not found');
      return;
    }

    // Create new nutrient manure entry
    const newAppliedManure: NMPFileAppliedManure = {
      manureId: selectedManure.ManureId,
      name: selectedManure.materialType,
      applicationId: manureForm.applicationMethod,
      unitId: manureForm.applUnit,
      rate: manureForm.applicationRate,
      nh4Retention: manureForm.retentionAmmoniumN,
      nAvail: manureForm.organicNAvailable,
      reqN: availableThisYearTable.N,
      reqP2o5: availableThisYearTable.P2O5,
      reqK2o: availableThisYearTable.K2O,
      remN: availableLongTermTable.N,
      remP2o5: availableLongTermTable.P2O5,
      remK2o: availableLongTermTable.K2O,
    };

    // Update the fields array
    const currentFields = state.nmpFile.years[0].Fields || [];
    const updatedFields = currentFields.map((f: NMPFileFieldData) => {
      if (f.FieldName === field.FieldName) {
        return {
          ...f,
          Manures: [...f.Manures, newAppliedManure],
        };
      }
      return f;
    });

    // Update fields state and dispatch to global state
    setFields(updatedFields);
    dispatch({
      type: 'SAVE_FIELDS',
      year: state.nmpFile.farmDetails.Year!,
      newFields: updatedFields,
    });
    handleModalClose();
  };

  const handleCalculate = async () => {
    const farmManure = state.nmpFile.years[0].NutrientAnalyses[0];
    if (!farmManure) {
      console.error('No farm manure data available for calculation.');
      return;
    }
    const nutrientInputs = await getNutrientInputs(
      farmManure,
      state.nmpFile.farmDetails.FarmRegion,
      manureForm.applicationRate,
      manureUnits.find((opt) => opt.id === manureForm.applUnit)!.value,
      manureForm.retentionAmmoniumN,
      manureForm.organicNAvailable,
    );
    setAvailableLongTermTable({
      N: nutrientInputs.N_LongTerm,
      P2O5: nutrientInputs.P2O5_LongTerm,
      K2O: nutrientInputs.K2O_LongTerm,
    });
    setAvailableThisYearTable({
      N: nutrientInputs.N_FirstYear,
      P2O5: nutrientInputs.P2O5_FirstYear,
      K2O: nutrientInputs.K2O_FirstYear,
    });
    setStillReqTable({
      N: field.Crops[0].reqN + (field.Crops[1]?.reqN ?? 0),
      P2O5: field.Crops[0].reqP2o5 + (field.Crops[1]?.reqP2o5 ?? 0),
      K2O: field.Crops[0].reqK2o + (field.Crops[1]?.reqK2o ?? 0),
    });
  };

  const handleChange = (changes: { [name: string]: string | number | undefined }) => {
    const name = Object.keys(changes)[0];
    const value = changes[name];
    setManureForm((prev) => {
      if (!prev) return prev;
      return { ...prev, [name]: value };
    });
  };

  return (
    <Modal
      title="Add Manure"
      onOpenChange={handleModalClose}
      {...props}
    >
      <Form
        onCancel={handleModalClose}
        onCalculate={handleCalculate}
        onConfirm={handleSubmit}
      >
        <Grid
          container
          spacing={2}
          sx={{ alignItems: 'end' }}
        >
          <Grid size={formGridBreakpoints}>
            <Select
              isRequired
              label="Material Type"
              placeholder="Select a material type"
              selectedKey={manureForm.materialType}
              items={manuresWithNutrients.map((ele: NMPFileNutrientAnalysis) => ({
                id: ele.materialType,
                label: ele.materialType,
              }))}
              onSelectionChange={(e) => handleChange({ materialType: e as string })}
            />
          </Grid>
          <Grid size={formGridBreakpoints}>
            <Select
              isRequired
              label="Application Season/Method"
              placeholder="Select an application method"
              selectedKey={manureForm.applicationMethod}
              // TODO: filter by material type
              items={MANURE_APPLICATION_METHODS}
              onSelectionChange={(e) => handleChange({ applicationMethod: e as number })}
            />
          </Grid>
          <Grid size={formGridBreakpoints}>
            <NumberField
              isRequired
              label="Application Rate"
              value={manureForm.applicationRate}
              onChange={(e) => handleChange({ applicationRate: e })}
              minValue={0}
            />
          </Grid>
          <Grid size={formGridBreakpoints}>
            <Select
              isRequired
              label="Units"
              placeholder="Select a unit"
              selectedKey={manureForm.applUnit}
              items={manureUnits}
              onSelectionChange={(e) => handleChange({ applUnit: e as number })}
              autoselectFirst
            />
          </Grid>
          <Grid size={formGridBreakpoints}>
            <NumberField
              label="Ammonium-N Retention (%)"
              value={manureForm.retentionAmmoniumN}
              onChange={(e) => handleChange({ retentionAmmoniumN: e })}
              minValue={0}
              maxValue={100}
            />
          </Grid>
          <Grid size={formGridBreakpoints}>
            <NumberField
              label="Organic N Available (%)"
              value={manureForm.organicNAvailable}
              onChange={(e) => handleChange({ organicNAvailable: e })}
              minValue={0}
              maxValue={100}
            />
          </Grid>
          <Grid size={{ ...formGridBreakpoints, md: 4 }}>
            <span css={{ fontWeight: 'bold' }}>Available This Year (lb/ac) </span>
            <DataGrid
              sx={{ ...customTableStyle }}
              columns={NUTRIENT_COLUMNS}
              rows={[availableThisYearTable]}
              getRowId={() => crypto.randomUUID()}
              disableRowSelectionOnClick
              disableColumnMenu
              hideFooterPagination
              hideFooter
            />
          </Grid>
          <Grid size={{ ...formGridBreakpoints, md: 4 }}>
            <span css={{ fontWeight: 'bold' }}>Available Long Term (lb/ac) </span>
            <DataGrid
              sx={{ ...customTableStyle }}
              columns={NUTRIENT_COLUMNS}
              rows={[availableLongTermTable]}
              getRowId={() => crypto.randomUUID()}
              disableRowSelectionOnClick
              disableColumnMenu
              hideFooterPagination
              hideFooter
            />
          </Grid>
          <Grid size={{ ...formGridBreakpoints, md: 4 }}>
            <span css={{ fontWeight: 'bold' }}>Still Required This Year (lb/ac) </span>
            <DataGrid
              sx={{ ...customTableStyle }}
              columns={NUTRIENT_COLUMNS}
              rows={[stillReqTable]}
              getRowId={() => crypto.randomUUID()}
              disableRowSelectionOnClick
              disableColumnMenu
              hideFooterPagination
              hideFooter
            />
          </Grid>
        </Grid>
      </Form>
    </Modal>
  );
}
