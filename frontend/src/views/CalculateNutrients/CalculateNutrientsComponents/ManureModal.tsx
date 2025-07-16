/**
 * @summary The field table on the calculate nutrients page
 */
import { Key, useContext, useEffect, useState, Dispatch, SetStateAction } from 'react';
import { Select, TextField } from '@bcgov/design-system-react-components';
import Grid from '@mui/material/Grid';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { APICacheContext } from '@/context/APICacheContext';
import { customTableStyle, formGridBreakpoints } from '@/common.styles';
import Form from '@/components/common/Form/Form';
import Modal, { ModalProps } from '@/components/common/Modal/Modal';
// Data not seeded in DB.
import SEASON_APPLICATION from '../unseededData';
import { EMPTY_CROP_NUTRIENTS } from '@/constants';

import type { NMPFileFarmManureData } from '@/types/NMPFileFarmManureData';
import { CropNutrients, NMPFileFieldData, Region } from '@/types';
import { NutrientManures } from '@/types/calculateNutrients';
import { getNutrientInputs } from '@/calculations/ManureAndCompost/ManureAndImports/Calculations';
import useAppState from '@/hooks/useAppState';

type ManureFormFields = {
  MaterialType: string;
  applicationMethod: string;
  applicationRate: number;
  applUnit: number;
  retentionAmmoniumN: number;
  organicNAvailable: number;
};

type AddManureModalProps = {
  initialModalData: ManureFormFields | undefined;
  farmManures: NMPFileFarmManureData[];
  rowEditIndex: number | undefined;
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
  MaterialType: '',
  applicationMethod: '',
  applicationRate: 0,
  applUnit: 0,
  retentionAmmoniumN: 0,
  organicNAvailable: 0,
};
export default function ManureModal({
  initialModalData,
  farmManures,
  onCancel,
  field,
  setFields,
  ...props
}: AddManureModalProps & Omit<ModalProps, 'title' | 'children' | 'onOpenChange'>) {
  const [manureForm, setManureForm] = useState<ManureFormFields>(
    initialModalData ?? DEFAULT_MANURE_FORM_FIELDS,
  );
  const apiCache = useContext(APICacheContext);
  const { state, dispatch } = useAppState();

  const [manureUnits, setManureUnits] = useState<
    {
      id: number;
      name: string;
      dryliquid: string;
      conversiontoimperialgallonsperacre: number;
    }[]
  >([]);

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
        setManureUnits(data);
      }
    });
  }, [apiCache, manureForm.MaterialType]);

  const handleModalClose = () => {
    setAvailableThisYearTable(EMPTY_CROP_NUTRIENTS);
    setAvailableLongTermTable(EMPTY_CROP_NUTRIENTS);
    setStillReqTable(EMPTY_CROP_NUTRIENTS);
    onCancel();
  };

  const handleSubmit = () => {
    if (!field) {
      console.error('No field selected for manure application');
      return;
    }

    // Find the selected farm manure
    const selectedFarmManure = farmManures.find(
      (manure) => manure.MaterialType === manureForm.MaterialType,
    );

    if (!selectedFarmManure) {
      console.error('Selected farm manure not found');
      return;
    }

    // Create new nutrient manure entry
    const newNutrientManure: NutrientManures = {
      manureId: selectedFarmManure.Nutrients.ManureId || 0,
      applicationId: Number(manureForm.applicationMethod) || 0,
      unitId: Number(manureForm.applUnit) || 0,
      rate: manureForm.applicationRate,
      nh4Retention: manureForm.retentionAmmoniumN,
      nAvail: manureForm.organicNAvailable,
      reqN: availableThisYearTable?.N || 0,
      reqP2o5: availableThisYearTable?.P2O5 || 0,
      reqK2o: availableThisYearTable?.K2O || 0,
      remN: availableLongTermTable?.N || 0,
      remP2o5: availableLongTermTable?.P2O5 || 0,
      remK2o: availableLongTermTable?.K2O || 0,
    };

    // Update the fields array
    const currentFields = state.nmpFile.years[0].Fields || [];
    const updatedFields = currentFields.map((f: NMPFileFieldData) => {
      if (f.FieldName === field.FieldName) {
        return {
          ...f,
          Nutrients: {
            nutrientManures: [...(f.Nutrients?.nutrientManures || []), newNutrientManure],
          },
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
    const farmManure = state.nmpFile?.years?.[0]?.FarmManures?.[0];
    if (!farmManure) {
      console.error('No farm manure data available for calculation.');
      return;
    }
    const nutrientInputs = await getNutrientInputs(
      farmManure,
      state.nmpFile.farmDetails.FarmRegion as unknown as Region,
      manureForm.applicationRate,
      manureForm.applUnit?.toString(),
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
      N:
        field && Array.isArray(field.Crops)
          ? (field.Crops[0]?.reqN ?? 0) + (field.Crops[1]?.reqN ?? 0)
          : 0,
      P2O5: (field?.Crops?.[0]?.reqP2o5 ?? 0) + (field?.Crops?.[1]?.reqP2o5 ?? 0),
      K2O: (field?.Crops?.[0]?.reqK2o ?? 0) + (field?.Crops?.[1]?.reqK2o ?? 0),
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
        onCancel={() => handleModalClose()}
        onSubmit={() => handleSubmit()}
        isConfirmDisabled={false}
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
              selectedKey={manureForm?.MaterialType}
              items={farmManures?.map((ele: NMPFileFarmManureData) => ({
                id: ele.MaterialType,
                label: ele.MaterialType,
              }))}
              onSelectionChange={(e: Key) => handleChange({ MaterialType: e.toString() })}
            />
          </Grid>
          <Grid size={formGridBreakpoints}>
            <Select
              isRequired
              label="Application Season/Method"
              name="applicationMethod"
              placeholder="Select an application method"
              selectedKey={manureForm?.applicationMethod}
              // TODO: filter by material type
              items={SEASON_APPLICATION.map((ele) => ({ id: ele.Id, label: ele.Name }))}
              onSelectionChange={(e: Key) =>
                handleChange({ applicationMethod: parseInt(e.toString(), 10) })
              }
            />
          </Grid>
          <Grid size={formGridBreakpoints}>
            <TextField
              isRequired
              label="Application Rate"
              type="number"
              name="applicationRate"
              value={manureForm?.applicationRate?.toString()}
              onChange={(e: string) => {
                handleChange({ applicationRate: e });
              }}
              maxLength={7}
            />
          </Grid>
          <Grid size={formGridBreakpoints}>
            <Select
              isRequired
              label="Units"
              placeholder="Select a unit"
              selectedKey={manureForm?.applUnit}
              items={manureUnits
                // .filter((unit) => [3, 4, 5, 6].includes(unit.id))
                .map((unit) => ({
                  value: { id: unit.id },
                  label: unit.name,
                }))}
              // onSelectionChange={(e: any) => handleChange(e)}
              onSelectionChange={(e: Key) => handleChange({ applUnit: e.toString() })}
            />
          </Grid>
          <Grid size={formGridBreakpoints}>
            <TextField
              label="Ammonium-N Retention (%)"
              type="number"
              name="retentionAmmoniumN"
              value={manureForm?.retentionAmmoniumN?.toString()}
              onChange={(e: string) => {
                handleChange({ retentionAmmoniumN: Number.isNaN(Number(e)) ? e : Number(e) });
              }}
              maxLength={5}
            />
          </Grid>
          <Grid size={formGridBreakpoints}>
            <TextField
              label="Organic N Available"
              type="number"
              name="organicNAvailable"
              value={manureForm?.organicNAvailable?.toString()}
              onChange={(e: string) => {
                handleChange({ organicNAvailable: Number.isNaN(Number(e)) ? e : Number(e) });
              }}
              maxLength={5}
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
          <Grid
            size={12}
            sx={{ textAlign: 'center', mt: 2 }}
          >
            <button
              type="button"
              onClick={handleCalculate}
              style={{
                padding: '8px 16px',
                backgroundColor: '#003366',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
              }}
            >
              Calculate
            </button>
          </Grid>
        </Grid>
      </Form>
    </Modal>
  );
}
