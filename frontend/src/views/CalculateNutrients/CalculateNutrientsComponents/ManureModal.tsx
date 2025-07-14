/**
 * @summary The field table on the calculate nutrients page
 */
import { Key, useContext, useEffect, useState } from 'react';
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
  field: NMPFileFieldData | undefined;
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
  ...props
}: AddManureModalProps & Omit<ModalProps, 'title' | 'children' | 'onOpenChange'>) {
  const [manureForm, setManureForm] = useState<ManureFormFields>(
    initialModalData ?? DEFAULT_MANURE_FORM_FIELDS,
  );
  const apiCache = useContext(APICacheContext);
  const { state } = useAppState();

  const [manureUnits, setManureUnits] = useState<
    {
      id: number;
      name: string;
      dryliquid: string;
      conversiontoimperialgallonsperacre: number;
    }[]
  >([]);

  const [availableThisYearTable, setAvailableThisYearTable] = useState<Array<CropNutrients>>([
    EMPTY_CROP_NUTRIENTS,
  ]);
  const [availableLongTermTable, setAvailableLongTermTable] = useState<Array<CropNutrients>>([
    EMPTY_CROP_NUTRIENTS,
  ]);
  const [stillReqTable, setStillReqTable] = useState<Array<CropNutrients>>([EMPTY_CROP_NUTRIENTS]);

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
    setAvailableThisYearTable([EMPTY_CROP_NUTRIENTS]);
    setAvailableLongTermTable([EMPTY_CROP_NUTRIENTS]);
    setStillReqTable([EMPTY_CROP_NUTRIENTS]);
    onCancel();
  };

  const handleSubmit = () => {
    // TBD: Submit logic here
    handleModalClose();
  };

  const handleCalculate = async () => {
    const nutrientInputs = await getNutrientInputs(
      state.nmpFile?.years?.[0]?.FarmManures?.[0],
      state.nmpFile.farmDetails.FarmRegion as unknown as Region,
      manureForm.applicationRate,
      manureForm.applUnit?.toString(),
      manureForm.retentionAmmoniumN,
      manureForm.organicNAvailable,
    );
    setAvailableLongTermTable([
      {
        N: nutrientInputs.N_LongTerm,
        P2O5: nutrientInputs.P2O5_LongTerm,
        K2O: nutrientInputs.K2O_LongTerm,
      },
    ]);
    setAvailableThisYearTable([
      {
        N: nutrientInputs.N_FirstYear,
        P2O5: nutrientInputs.P2O5_FirstYear,
        K2O: nutrientInputs.K2O_FirstYear,
      },
    ]);
    setStillReqTable([
      {
        N:
          field && Array.isArray(field.Crops)
            ? (field.Crops[0]?.reqN ?? 0) + (field.Crops[1]?.reqN ?? 0)
            : 0,
        P2O5: (field?.Crops?.[0]?.reqP2o5 ?? 0) + (field?.Crops?.[1]?.reqP2o5 ?? 0),
        K2O: (field?.Crops?.[0]?.reqK2o ?? 0) + (field?.Crops?.[1]?.reqK2o ?? 0),
      },
    ]);
    console.log('HERE: ', field);
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
              rows={availableThisYearTable}
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
              rows={availableLongTermTable}
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
              rows={stillReqTable}
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
