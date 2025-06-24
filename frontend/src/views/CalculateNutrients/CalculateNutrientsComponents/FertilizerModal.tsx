/**
 * @summary This is the NewFertilizerModal component
 */
import React, { FormEvent, Key, useContext, useEffect, useState } from 'react';
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

import type {
  Fertilizer,
  FertilizerType,
  FertilizerUnit,
  CropNutrients,
  NMPFileFieldData,
} from '@/types';
import { calcFertBalance } from '../utils';
import { NMPFileFertilizer } from '@/types/calculateNutrients';

type FertilizerModalProps = {
  fieldIndex: number;
  initialModalData: NMPFileFertilizer | undefined;
  rowEditIndex: number | undefined;
  setFields: React.Dispatch<React.SetStateAction<NMPFileFieldData[]>>;
  onClose: () => void;
};

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

const EMPTY_FERTILIZER_FORM_DATA: NMPFileFertilizer = {
  name: '',
  fertilizerTypeId: 0,
  fertilizerId: 0,
  applicationRate: 1,
  applUnitId: 0,
  applDate: '',
  applicationMethod: '',
  reqN: 0,
  reqP2o5: 0,
  reqK2o: 0,
  remN: 0,
  remP2o5: 0,
  remK2o: 0,
};

const FERTILIZER_METHOD: Array<{ id: string; label: string }> = [
  { id: 'Broadcast', label: 'Broadcast' },
  { id: 'Banded', label: 'Banded' },
  { id: 'With planter', label: 'With planter' },
  { id: 'Sidedress', label: 'Sidedress' },
  { id: 'Fertigation', label: 'Fertigation' },
  { id: 'Follar', label: 'Follar' },
];

export default function FertilizerModal({
  fieldIndex,
  initialModalData,
  rowEditIndex,
  setFields,
  onClose,
  ...props
}: FertilizerModalProps & Omit<ModalProps, 'title' | 'children' | 'onOpenChange'>) {
  const [fertilizerTypes, setFertilizerTypes] = useState<FertilizerType[]>([]);
  const [fertilizerOptions, setFertilizerOptions] = useState<Fertilizer[]>([]);
  const [filteredFertilizersOptions, setFilteredFertilizerOptions] = useState<Fertilizer[]>([]);
  const [fertilizerUnits, setFertilizerUnits] = useState<FertilizerUnit[]>([]);

  const [formState, setFormState] = useState<NMPFileFertilizer>(
    initialModalData ?? EMPTY_FERTILIZER_FORM_DATA,
  );

  const apiCache = useContext(APICacheContext);

  const [calculatedData, setCalculateData] = useState<CropNutrients | null>(
    initialModalData
      ? { N: initialModalData.reqN, P2O5: initialModalData.reqP2o5, K2O: initialModalData.reqK2o }
      : null,
  );

  const dryOrLiquidUnitOptions = fertilizerUnits.filter(
    (ele) =>
      ele.dryliquid ===
      fertilizerTypes.find((fertType) => fertType.id === formState.fertilizerTypeId)?.dryliquid,
  );

  const handleSubmit = () => {
    setFields((prevFields) => {
      const newFields = prevFields.map((prev, index) => {
        if (index !== fieldIndex) return prev;

        if (rowEditIndex !== undefined) {
          const newFertilizers = [...prev.Fertilizers];
          newFertilizers[rowEditIndex] = { ...formState };
          return { ...prev, Fertilizers: newFertilizers };
        }

        // For case where this is a new fertilizer
        return {
          ...prev,
          Fertilizers: [
            ...prev.Fertilizers,
            {
              ...formState,
            },
          ],
        };
      });

      return newFields;
    });

    onClose();
  };

  useEffect(() => {
    apiCache.callEndpoint('api/fertilizertypes/').then((response: { status?: any; data: any }) => {
      if (response.status === 200) {
        const fertilizerTs: FertilizerType[] = response.data;
        setFertilizerTypes(fertilizerTs);

        // Fetch fertilizers sequentially, after fertilizer types
        apiCache
          .callEndpoint('api/fertilizers/')
          .then((secondResponse: { status?: any; data: any }) => {
            if (secondResponse.status === 200) {
              const { data } = secondResponse;
              setFertilizerOptions(data);

              // If the fertilizerTypeId is already set, set the filtered options as well
              if (formState.fertilizerTypeId) {
                setFilteredFertilizerOptions(
                  data.filter(
                    (ele: Fertilizer) =>
                      ele.dryliquid ===
                      fertilizerTs.find((fertType) => fertType.id === formState.fertilizerTypeId)
                        ?.dryliquid,
                  ),
                );
              }
            }
          });
      }
    });
    apiCache.callEndpoint('api/fertilizerunits/').then((response: { status?: any; data: any }) => {
      if (response.status === 200) {
        const { data } = response;
        setFertilizerUnits(data);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleModalCalculate = (e: FormEvent) => {
    e.preventDefault();
    if (
      !formState.fertilizerId ||
      !formState.applUnitId ||
      !formState.applicationRate ||
      fertilizerOptions.length === 0 ||
      fertilizerUnits.length === 0
    )
      return;

    const fertilizer = fertilizerOptions.find((ele) => ele.id === formState.fertilizerId);
    if (fertilizer === undefined)
      throw new Error(`Fertilizer ${formState.fertilizerId} is missing from list.`);
    const fertilizerUnit = fertilizerUnits.find(
      (fertTypeEle) => fertTypeEle.id === formState.applUnitId,
    );
    if (fertilizerUnit === undefined)
      throw new Error(`Fertilizer unit ${formState.applUnitId} is missing from list.`);
    const cropNutrients = calcFertBalance(fertilizer, formState.applicationRate, fertilizerUnit);
    setCalculateData(cropNutrients);
    setFormState((prev) => ({
      ...prev,
      reqN: cropNutrients.N,
      reqP2o5: cropNutrients.P2O5,
      reqK2o: cropNutrients.K2O,
      remN: cropNutrients.N,
      remP2o5: cropNutrients.P2O5,
      remK2o: cropNutrients.K2O,
    }));
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
    }

    if (name === 'fertilizerId') {
      // eslint-disable-next-line no-param-reassign
      changes.name = filteredFertilizersOptions.find((f) => f.id === value)!.name;
    }

    setFormState((prev) => ({ ...prev, ...changes }));
  };

  return (
    <Modal
      title="Add fertilizer"
      onOpenChange={onClose}
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
                  rows={calculatedData != null ? [calculatedData] : []}
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
            onPress={onClose}
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
