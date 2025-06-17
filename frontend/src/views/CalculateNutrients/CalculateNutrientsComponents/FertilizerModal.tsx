/**
 * @summary This is the NewFertilizerModal component
 */
import { FormEvent, Key, useContext, useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import {
  Button,
  ButtonGroup,
  Form,
  Select,
  TextField,
} from '@bcgov/design-system-react-components';
import Divider from '@mui/material/Divider';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Modal, { ModalProps } from '@/components/common/Modal/Modal';
import { customTableStyle, formCss, formGridBreakpoints } from '@/common.styles';
import { APICacheContext } from '@/context/APICacheContext';
import { InputField } from '@/components/common';

import type { FertilizerFormState } from '../types';
import type { Fertilizer, FertilizerType, FertilizerUnit, CropNutrients } from '@/types';
import calcFertBalance from '../utils';

type FertilizerModalProps = {
  initialModalData: FertilizerFormState | undefined;
  setDataForParent: (data: CropNutrients) => void;
  onCancel: () => void;
};

interface FertilizerDetail {
  fertilizerType: FertilizerType | undefined;
  fertilizerUnit: FertilizerUnit | undefined;
  fertilizer: Fertilizer | undefined;
}

const NUTRIENT_COLUMNS: GridColDef[] = [
  {
    field: 'N',
    headerName: 'N',

    sortable: false,
    resizable: false,
  },
  {
    field: 'P2O5',
    headerName: 'P2O5',

    sortable: false,
    resizable: false,
  },
  {
    field: 'K2O',
    headerName: 'K2O',

    sortable: false,
    resizable: false,
  },
];

const EMPTY_FERTILIZER_FORM_DATA: FertilizerFormState = {
  fertilizerTypeId: 0,
  fertilizerId: 0,
  applicationRate: 1,
  applUnitId: 1,
  applDate: '',
  applicationMethod: '',
};

const FERTILIZER_METHOD: Array<{ id: string; label: string }> = [
  { id: 'Broadcast', label: 'Broadcast' },
  { id: 'Banded', label: 'Banded' },
  { id: 'With planter', label: 'With planter' },
  { id: 'Sidedress', label: 'Sidedress' },
  { id: 'Fertigation', label: 'Fertigation' },
  { id: 'Follar', label: 'Follar' },
];

const EMPTY_FERT_DETAIL_DATA = {
  fertilizerType: undefined,
  fertilizerUnit: undefined,
  fertilizer: undefined,
};

export default function FertilizerModal({
  initialModalData,
  // Import field and handleSubmit from parent component when ready
  setDataForParent,
  onCancel,
  ...props
}: FertilizerModalProps & Omit<ModalProps, 'title' | 'children' | 'onOpenChange'>) {
  const [fertilizerTypes, setFertilizerTypes] = useState<FertilizerType[]>([]);
  const [fertilizerOptions, setFertilizerOptions] = useState<Fertilizer[]>([]);
  const [filteredFertilizersOptions, setFilteredFertilizerOptions] = useState<Fertilizer[]>([]);
  const [fertilizerUnits, setFertilizerUnits] = useState<FertilizerUnit[]>([]);

  const [formState, setFormState] = useState<FertilizerFormState>(
    initialModalData ?? EMPTY_FERTILIZER_FORM_DATA,
  );
  const [fertilizerDetailData, setFertilizerDetailData] =
    useState<FertilizerDetail>(EMPTY_FERT_DETAIL_DATA);

  const apiCache = useContext(APICacheContext);

  const [calculatedData, setCalculateData] = useState<[CropNutrients] | null>(null);

  const dryOrLiquidUnitOptions = fertilizerUnits.filter(
    (ele) =>
      ele.dryliquid ===
      fertilizerTypes.find((fertType) => fertType.id === formState.fertilizerTypeId)?.dryliquid,
  );

  useEffect(() => {
    apiCache.callEndpoint('api/fertilizertypes/').then((response: { status?: any; data: any }) => {
      if (response.status === 200) {
        const { data } = response;
        setFertilizerTypes(data);
      }
    });
    apiCache.callEndpoint('api/fertilizers/').then((response: { status?: any; data: any }) => {
      if (response.status === 200) {
        const { data } = response;
        setFertilizerOptions(data);
      }
    });
    apiCache.callEndpoint('api/fertilizerunits/').then((response: { status?: any; data: any }) => {
      if (response.status === 200) {
        const { data } = response;
        setFertilizerUnits(data);
      }
    });
  }, [apiCache, fertilizerTypes, fertilizerOptions]);

  const handleModalCalculate = (e: FormEvent) => {
    e.preventDefault();
    if (
      !fertilizerDetailData.fertilizer ||
      !formState.applicationRate ||
      !fertilizerDetailData.fertilizerUnit
    )
      return;
    setCalculateData([
      calcFertBalance(
        fertilizerDetailData.fertilizer,
        formState.applicationRate,
        fertilizerDetailData.fertilizerUnit,
      ),
    ]);
  };

  const handleInputChanges = (changes: { [name: string]: string | number | undefined }) => {
    const name = Object.keys(changes)[0];
    const value = changes[name];

    if (name === 'fertilizerTypeId') {
      setFilteredFertilizerOptions(
        fertilizerOptions.filter(
          (ele) =>
            ele.dryliquid === fertilizerTypes.find((fertType) => fertType.id === value)?.dryliquid,
        ),
      );

      setFertilizerDetailData({
        ...EMPTY_FERT_DETAIL_DATA,
        fertilizerType: fertilizerTypes.find((ele) => ele.id === Number(value)),
      });
    }

    if (name === 'fertilizerId') {
      setFertilizerDetailData((prev: any) => ({
        ...prev,
        fertilizer: fertilizerOptions.find((ele) => ele.id === Number(value)),
      }));
    }

    if (name === 'applUnitId') {
      setFertilizerDetailData((prev: any) => ({
        ...prev,
        fertilizerUnit: fertilizerUnits.find((fertTypeEle) => fertTypeEle.id === Number(value)),
      }));
    }
    setFormState((prev) => ({ ...prev, ...changes }));
  };

  const handleSubmit = () => {
    // Call the setData function from CalculateNutrients.tsx parent component
    if (calculatedData) setDataForParent(...calculatedData);
  };

  return (
    <Modal
      title="Add fertilizer"
      onOpenChange={onCancel}
      {...props}
    >
      <Form
        css={formCss}
        onSubmit={handleModalCalculate}
      >
        <Grid
          container
          spacing={2}
        >
          <Grid size={formGridBreakpoints}>
            <Select
              isRequired
              name="fertilizerTypeId"
              items={fertilizerTypes.map((ele) => ({ id: ele.id, label: ele.name }))}
              label="Fertilizer Type"
              placeholder="Select Fertilizer Type"
              selectedKey={formState.fertilizerTypeId}
              onSelectionChange={(e: Key) => {
                handleInputChanges({ fertilizerTypeId: parseInt(e.toString(), 10) });
              }}
            />
          </Grid>
          <Grid size={formGridBreakpoints}>
            <Select
              isRequired
              name="Fertilizer"
              items={filteredFertilizersOptions.map((ele) => ({ id: ele.id, label: ele.name }))}
              label="Fertilizer"
              placeholder="Select Fertilizer"
              selectedKey={formState.fertilizerId}
              onSelectionChange={(e: Key) => {
                handleInputChanges({ fertilizerId: parseInt(e.toString(), 10) });
              }}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField
              isRequired
              label="Application Rate"
              type="number"
              name="Moisture"
              value={formState?.applicationRate.toString()}
              onChange={(e: string) => {
                handleInputChanges({ applicationRate: e });
              }}
              maxLength={5}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Select
              isRequired
              name="applUnitId"
              items={dryOrLiquidUnitOptions.map((ele) => ({ id: ele.id, label: ele.name }))}
              label="Application Units"
              placeholder="Select Units"
              selectedKey={formState.applUnitId}
              onSelectionChange={(e: Key) => {
                handleInputChanges({ applUnitId: parseInt(e.toString(), 10) });
              }}
            />
          </Grid>
          <Grid size={formGridBreakpoints}>
            <Select
              name="applicationMethod"
              items={FERTILIZER_METHOD}
              label="Method (optional)"
              placeholder="Select Method"
              selectedKey={formState.applicationMethod}
              onSelectionChange={(e: Key) => {
                // Current NMP stores this, but not for calculations
                // Right now not passed to parent componet for storing
                handleInputChanges({ applicationMethod: e.toString() });
              }}
            />
          </Grid>
          <Grid size={formGridBreakpoints}>
            <span className="bcds-react-aria-Select--Label">Date (optional)</span>
            <InputField
              label=""
              type="date"
              name="applDate"
              value={formState.applDate ?? 0}
              onChange={(e: any) => {
                // Current NMP stores this, but not for calculations
                // Right now not passed to parent componet for storing.
                handleInputChanges({ applDate: e?.target?.value });
              }}
            />
          </Grid>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <div>
            <Grid
              container
              spacing={1}
              sx={{
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Grid size={formGridBreakpoints}>
                <div css={{ fontWeight: 'bold', textAlign: 'center' }}>
                  Available This Year (lb/ac){' '}
                </div>
                <DataGrid
                  sx={{ ...customTableStyle }}
                  columns={NUTRIENT_COLUMNS}
                  rows={calculatedData ?? []}
                  getRowId={() => crypto.randomUUID()}
                  disableRowSelectionOnClick
                  disableColumnMenu
                  hideFooterPagination
                  hideFooter
                />
              </Grid>
            </Grid>
          </div>
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
            onPress={onCancel}
            aria-label="reset"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            aria-label="submit"
          >
            Calculate
          </Button>
          <Button
            isDisabled={!calculatedData}
            variant="primary"
            onClick={handleSubmit}
            aria-label="submit"
          >
            Submit
          </Button>
        </ButtonGroup>
      </Form>
    </Modal>
  );
}
