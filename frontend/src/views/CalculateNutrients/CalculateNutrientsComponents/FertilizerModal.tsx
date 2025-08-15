/**
 * @summary This is the NewFertilizerModal component
 */
import React, { useContext, useEffect, useMemo, useState } from 'react';
import Grid from '@mui/material/Grid';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Modal, { ModalProps } from '@/components/common/Modal/Modal';
import { customTableStyle, formGridBreakpoints } from '@/common.styles';
import { APICacheContext } from '@/context/APICacheContext';
import { InputField, NumberField, Select, Form } from '@/components/common';

import {
  Fertilizer,
  FertilizerType,
  FertilizerUnit,
  CropNutrients,
  NMPFileFieldData,
  CalculateNutrientsColumn,
  DensityUnit,
  SelectOption,
  NMPFileFertilizer,
} from '@/types';
import { calcFertBalance, renderBalanceCell } from '../utils';
import { DRY_CUSTOM_ID, EMPTY_CUSTOM_FERTILIZER, LIQUID_CUSTOM_ID } from '@/constants';

type FertilizerModalProps = {
  fieldIndex: number;
  initialModalData?: NMPFileFertilizer;
  rowEditIndex?: number;
  balanceRow: CalculateNutrientsColumn;
  setFields: React.Dispatch<React.SetStateAction<NMPFileFieldData[]>>;
  onClose: () => void;
};

type BalanceCalcRow = {
  reqN: number;
  reqP2o5: number;
  reqK2o: number;
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

const BALANCE_COLUMNS: GridColDef[] = [
  {
    field: 'reqN',
    headerName: 'N',
    renderCell: renderBalanceCell('reqN', true),
    sortable: false,
    resizable: false,
  },
  {
    field: 'reqP2o5',
    headerName: 'P2O5',
    renderCell: renderBalanceCell('reqP2o5', true),
    sortable: false,
    resizable: false,
  },
  {
    field: 'reqK2o',
    headerName: 'K2O',
    renderCell: renderBalanceCell('reqK2o', true),
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
  density: undefined,
  densityUnitId: undefined,
  reqN: 0,
  reqP2o5: 0,
  reqK2o: 0,
  remN: 0,
  remP2o5: 0,
  remK2o: 0,
};

const FERTILIZER_METHODS: { id: string; label: string }[] = [
  { id: '', label: 'None' },
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
  balanceRow,
  setFields,
  onClose,
  ...props
}: FertilizerModalProps & Omit<ModalProps, 'title' | 'children' | 'onOpenChange'>) {
  const [fertilizerTypes, setFertilizerTypes] = useState<SelectOption<FertilizerType>[]>([]);
  const [fertilizers, setFertilizers] = useState<SelectOption<Fertilizer>[]>([]);
  const [filteredFertilizers, setFilteredFertilizers] = useState<SelectOption<Fertilizer>[]>([]);
  const [fertilizerUnits, setFertilizerUnits] = useState<SelectOption<FertilizerUnit>[]>([]);
  const [densityUnits, setDensityUnits] = useState<SelectOption<DensityUnit>[]>([]);
  const [liqDensityFactors, setLiqDensityFactors] = useState<any[]>([]);
  const [balanceCalcRow, setBalanceCacRow] = useState<BalanceCalcRow>({
    reqN: Math.min(balanceRow.reqN, 0),
    reqP2o5: Math.min(balanceRow.reqP2o5, 0),
    reqK2o: Math.min(balanceRow.reqK2o, 0),
  });

  const [formState, setFormState] = useState<NMPFileFertilizer>(
    initialModalData || EMPTY_FERTILIZER_FORM_DATA,
  );
  const [formCustomFertilizer, setFormCustomFertilizer] =
    useState<Fertilizer>(EMPTY_CUSTOM_FERTILIZER);

  const apiCache = useContext(APICacheContext);

  const [calculatedData, setCalculateData] = useState<CropNutrients | null>(
    initialModalData
      ? { N: initialModalData.reqN, P2O5: initialModalData.reqP2o5, K2O: initialModalData.reqK2o }
      : null,
  );

  const dryOrLiquidUnitOptions: SelectOption<FertilizerUnit>[] = fertilizerUnits.filter(
    (ele) =>
      ele.value.dryliquid ===
      fertilizerTypes.find((fertType) => fertType.id === formState.fertilizerTypeId)?.value
        .dryliquid,
  );

  const isLiquidFertilizer = useMemo(
    () =>
      fertilizerTypes.find((ele) => ele.id === formState.fertilizerTypeId)?.value.dryliquid ===
      'liquid',
    [fertilizerTypes, formState.fertilizerTypeId],
  );

  const isCustomFertilizer = useMemo(
    () => fertilizerTypes.find((ele) => ele.id === formState.fertilizerTypeId)?.value.custom,
    [fertilizerTypes, formState.fertilizerTypeId],
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
        setFertilizerTypes(
          fertilizerTs.map((ele) => ({ id: ele.id, label: ele.name, value: ele })),
        );

        // Fetch fertilizers sequentially, after fertilizer types
        apiCache
          .callEndpoint('api/fertilizers/')
          .then((secondResponse: { status?: any; data: any }) => {
            if (secondResponse.status === 200) {
              const ferts: Fertilizer[] = secondResponse.data;
              const fertOptions = ferts.map((ele) => ({ id: ele.id, label: ele.name, value: ele }));
              setFertilizers(fertOptions);

              // If the fertilizerTypeId is already set, set the filtered options as well
              if (formState.fertilizerTypeId) {
                setFilteredFertilizers(
                  fertOptions.filter(
                    (ele) =>
                      ele.value.dryliquid ===
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
        setFertilizerUnits(
          (data as FertilizerUnit[]).map((ele) => ({ id: ele.id, label: ele.name, value: ele })),
        );
      }
    });

    apiCache.callEndpoint('api/densityunits/').then((response) => {
      if (response.status === 200) {
        const { data } = response;
        setDensityUnits(
          (data as DensityUnit[]).map((ele) => ({ id: ele.id, label: ele.name, value: ele })),
        );
      }
    });

    apiCache.callEndpoint('api/liquidfertilizerdensities/').then((response) => {
      if (response.status === 200) {
        const { data } = response;
        setLiqDensityFactors(data);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleModalCalculate = () => {
    let fertilizer;
    let densityConvFactor;

    // Liquid fertilizer requires extra fields
    if (isLiquidFertilizer) {
      densityConvFactor = densityUnits.find((ele) => ele.id === formState.densityUnitId)!.value
        .convfactor;
    }

    // Regular fertilizer and custom fertilizer have different logic
    if (isCustomFertilizer) {
      fertilizer = formCustomFertilizer;
    } else {
      fertilizer = fertilizers.find((ele) => ele.id === formState.fertilizerId)?.value;
      if (fertilizer === undefined)
        throw new Error(`Fertilizer ${formState.fertilizerId} is missing from list.`);
    }

    const fertilizerUnit = fertilizerUnits.find(
      (fertTypeEle) => fertTypeEle.id === formState.applUnitId,
    );
    if (fertilizerUnit === undefined)
      throw new Error(`Fertilizer unit ${formState.applUnitId} is missing from list.`);

    const cropNutrients = calcFertBalance(
      fertilizer,
      formState.applicationRate,
      fertilizerUnit.value,
      formState.density,
      densityConvFactor,
    );
    setCalculateData(cropNutrients);
    setBalanceCacRow({
      reqN: Math.min(0, balanceRow.reqN + cropNutrients.N),
      reqP2o5: Math.min(0, balanceRow.reqP2o5 + cropNutrients.P2O5),
      reqK2o: Math.min(0, balanceRow.reqK2o + cropNutrients.K2O),
    });
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

  const handleInputChanges = (updates: { [key: string]: string | number | undefined }) => {
    Object.entries(updates).forEach(([name, value]) => {
      let changes = structuredClone(updates);

      if (['potassium', 'phosphorous', 'nitrogen'].includes(name)) {
        setFormCustomFertilizer((prev) => ({ ...prev, ...changes }));
      }

      if (name === 'fertilizerTypeId') {
        setFilteredFertilizers(
          fertilizers.filter(
            (ele) =>
              ele.value.dryliquid ===
              fertilizerTypes.find((fertType) => fertType.id === value)?.value.dryliquid,
          ),
        );

        if (value === DRY_CUSTOM_ID || value === LIQUID_CUSTOM_ID) {
          setFormCustomFertilizer((prev) => {
            // Reset if we're switching type
            if (formState.fertilizerTypeId !== value) {
              return {
                ...EMPTY_CUSTOM_FERTILIZER,
                dryliquid: value === DRY_CUSTOM_ID ? 'dry' : 'liquid',
              };
            }
            return {
              ...prev,
              dryliquid: value === DRY_CUSTOM_ID ? 'dry' : 'liquid',
            };
          });
        } else {
          // Reset for other values
          setFormCustomFertilizer(EMPTY_CUSTOM_FERTILIZER);
        }

        // Reset other values on changes
        changes = {
          ...EMPTY_FERTILIZER_FORM_DATA,
          fertilizerTypeId: value,
        };
      }

      if (name === 'fertilizerId') {
        changes.name = filteredFertilizers.find((f) => f.id === value)!.label;
        // Load liquid densities.
        if (isLiquidFertilizer && !isCustomFertilizer) {
          const densityValue = liqDensityFactors.find((ele) => ele.fertilizerid === value);

          changes.density = densityValue.value;
          changes.densityUnitId = densityValue.densityunitid;
        }
      }

      if (name === 'densityUnitId') {
        if (isLiquidFertilizer && !isCustomFertilizer) {
          const densityValue = liqDensityFactors.find(
            (ele) => ele.fertilizerid === formState.fertilizerId && ele.densityunitid === value,
          );
          changes.density = densityValue.value;
          changes.densityUnitId = value;
        }
        changes.densityUnitId = value;
      }

      setFormState((prev) => ({ ...prev, ...changes }));
    });
  };

  return (
    <Modal
      title="Add fertilizer"
      onOpenChange={onClose}
      {...props}
    >
      <Form
        onCancel={onClose}
        onCalculate={handleModalCalculate}
        onConfirm={handleSubmit}
        isConfirmDisabled={!calculatedData}
      >
        <Grid
          container
          spacing={2}
        >
          <Grid size={formGridBreakpoints}>
            <Select
              isRequired
              items={fertilizerTypes}
              label="Fertilizer Type"
              placeholder="Select Fertilizer Type"
              selectedKey={formState.fertilizerTypeId}
              onSelectionChange={(e) => handleInputChanges({ fertilizerTypeId: e as number })}
            />
          </Grid>
          {isCustomFertilizer ? (
            <Grid size={{ xs: 12 }}>
              <Grid
                container
                spacing={2}
              >
                <Grid size={{ xs: 4 }}>
                  <NumberField
                    isRequired
                    label="N (%)"
                    value={formCustomFertilizer.nitrogen}
                    onChange={(e) => handleInputChanges({ nitrogen: e })}
                    minValue={0}
                    maxValue={100}
                  />
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <NumberField
                    isRequired
                    label={
                      <span>
                        P<sub>2</sub>O<sub>5</sub> (%)
                      </span>
                    }
                    value={formCustomFertilizer.phosphorous}
                    onChange={(e) => handleInputChanges({ phosphorous: e })}
                    minValue={0}
                    maxValue={100}
                  />
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <NumberField
                    isRequired
                    label={
                      <span>
                        K<sub>2</sub>O (%)
                      </span>
                    }
                    value={formCustomFertilizer.potassium}
                    onChange={(e) => handleInputChanges({ potassium: e })}
                    minValue={0}
                    maxValue={100}
                  />
                </Grid>
              </Grid>
            </Grid>
          ) : (
            <Grid size={formGridBreakpoints}>
              <Select
                isRequired
                items={filteredFertilizers}
                label="Fertilizer"
                placeholder="Select Fertilizer"
                selectedKey={formState.fertilizerId}
                onSelectionChange={(e) => handleInputChanges({ fertilizerId: e as number })}
              />
            </Grid>
          )}
          <Grid size={{ xs: 6 }}>
            <NumberField
              isRequired
              label="Application Rate"
              value={formState.applicationRate}
              onChange={(e) => handleInputChanges({ applicationRate: e })}
              minValue={0}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Select
              isRequired
              items={dryOrLiquidUnitOptions}
              label="Application Units"
              placeholder="Select Units"
              selectedKey={formState.applUnitId}
              onSelectionChange={(e) => handleInputChanges({ applUnitId: e as number })}
            />
          </Grid>
          {isLiquidFertilizer && (
            <>
              <Grid size={{ xs: 6 }}>
                <NumberField
                  isRequired
                  label="Density"
                  value={formState.density}
                  onChange={(e) => handleInputChanges({ density: e })}
                  minValue={0}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Select
                  isRequired
                  items={densityUnits}
                  label="Density Units"
                  placeholder="Select Units"
                  selectedKey={formState.densityUnitId}
                  onSelectionChange={(e) => handleInputChanges({ densityUnitId: e as number })}
                />
              </Grid>
            </>
          )}
          <Grid size={formGridBreakpoints}>
            <Select
              items={FERTILIZER_METHODS}
              label="Method"
              selectedKey={formState.applicationMethod}
              onSelectionChange={(e) => handleInputChanges({ applicationMethod: e as number })}
            />
          </Grid>
          <Grid size={formGridBreakpoints}>
            <InputField
              label="Date"
              type="date"
              name="applDate"
              value={formState.applDate || ''}
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
              <Grid
                size={{ xs: 12, md: 6 }}
                sx={{ maxWidth: '400px', justifyItems: 'center' }}
              >
                <div css={{ fontWeight: 'bold', textAlign: 'center', maxWidth: '300px' }}>
                  Available This Year (lb/ac)
                  <DataGrid
                    sx={{ ...customTableStyle }}
                    columns={NUTRIENT_COLUMNS}
                    rows={calculatedData !== null ? [calculatedData] : [{ N: 0, P2O5: 0, K2O: 0 }]}
                    getRowId={() => crypto.randomUUID()}
                    disableRowSelectionOnClick
                    disableColumnMenu
                    hideFooterPagination
                    hideFooter
                  />
                </div>
              </Grid>
              <Grid
                size={{ xs: 6 }}
                sx={{ maxWidth: '400px', justifyItems: 'center' }}
              >
                <div css={{ fontWeight: 'bold', textAlign: 'center', maxWidth: '300px' }}>
                  Still Required This Year (lb/ac)
                  <DataGrid
                    sx={{ ...customTableStyle }}
                    columns={BALANCE_COLUMNS}
                    rows={[balanceCalcRow]}
                    getRowId={() => crypto.randomUUID()}
                    disableRowSelectionOnClick
                    disableColumnMenu
                    hideFooterPagination
                    hideFooter
                  />
                </div>
              </Grid>
            </Grid>
          </div>
        </Grid>
      </Form>
    </Modal>
  );
}
