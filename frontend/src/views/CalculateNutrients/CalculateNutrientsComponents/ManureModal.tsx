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
import { CropNutrients } from '@/types';

type ManureFormFields = {
  materialType: string;
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
  ...props
}: AddManureModalProps & Omit<ModalProps, 'title' | 'children' | 'onOpenChange'>) {
  const [manureForm, setManureForm] = useState<ManureFormFields>(
    initialModalData || DEFAULT_MANURE_FORM_FIELDS,
  );
  const apiCache = useContext(APICacheContext);

  const [fertilizerUnits, setFertilizerUnits] = useState<
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
    apiCache.callEndpoint('api/fertilizerunits/').then((response: { status?: any; data: any }) => {
      if (response.status === 200) {
        const { data } = response;
        setFertilizerUnits(data);
      }
    });
  }, [apiCache, manureForm.materialType]);

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
              selectedKey={manureForm.materialType}
              items={farmManures.map((ele: NMPFileFarmManureData) => ({
                id: ele.materialType,
                label: ele.materialType,
              }))}
              onSelectionChange={(e: Key) => handleChange({ materialType: e as string })}
            />
          </Grid>
          <Grid size={formGridBreakpoints}>
            <Select
              isRequired
              label="Application Season/Method"
              name="applicationMethod"
              placeholder="Select an application method"
              selectedKey={manureForm.applicationMethod}
              // TODO: filter by material type
              items={SEASON_APPLICATION.map((ele) => ({ id: ele.Id, label: ele.Name }))}
              onSelectionChange={(e: Key) => handleChange({ applicationMethod: Number(e) })}
            />
          </Grid>
          <Grid size={formGridBreakpoints}>
            <TextField
              isRequired
              label="Application Rate"
              type="number"
              name="applicationRate"
              value={String(manureForm.applicationRate)}
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
              selectedKey={manureForm.applUnit}
              items={fertilizerUnits.map((unit) => ({
                value: { id: unit.id },
                label: unit.name,
              }))}
              onSelectionChange={(e: Key) => handleChange({ applUnit: e.toString() })}
            />
          </Grid>
          <Grid size={formGridBreakpoints}>
            <TextField
              label="Ammonium-N Retention (%)"
              type="number"
              name="retentionAmmoniumN"
              value={manureForm.retentionAmmoniumN.toString()}
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
              value={manureForm.organicNAvailable.toString()}
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
        </Grid>
      </Form>
    </Modal>
  );
}
