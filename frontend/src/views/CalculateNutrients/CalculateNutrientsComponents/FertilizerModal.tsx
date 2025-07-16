/**
 * @summary This is the NewFertilizerModal component
 */
import React, { FormEvent, Key, useContext, useEffect, useMemo, useState } from 'react';
import Grid from '@mui/material/Grid';
import { Button, ButtonGroup, Form, TextField } from '@bcgov/design-system-react-components';
import Divider from '@mui/material/Divider';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Modal, { ModalProps } from '@/components/common/Modal/Modal';
import { customTableStyle, formCss, formGridBreakpoints } from '@/common.styles';
import { APICacheContext } from '@/context/APICacheContext';
import { InputField, Select } from '@/components/common';

import type {
  Fertilizer,
  FertilizerType,
  FertilizerUnit,
  CropNutrients,
  NMPFileFieldData,
  CalculateNutrientsColumn,
} from '@/types';
import { calcFertBalance, renderBalanceCell } from '../utils';
import { NMPFileFertilizer } from '@/types/calculateNutrients';

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

const DRY_CUSTOM_ID = 2;
const LIQUID_CUSTOM_ID = 4;

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

const EMPTY_CUSTOM_FERTILIZER: Fertilizer = {
  id: 0,
  name: 'Custom fertilizer',
  dryliquid: 'dry',
  nitrogen: 0,
  phosphorous: 0,
  potassium: 0,
  sortnum: 0,
};

const FERTILIZER_METHOD: Array<{ id: string; label: string }> = [
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
  const [fertilizerTypes, setFertilizerTypes] = useState<FertilizerType[]>([]);
  const [fertilizerOptions, setFertilizerOptions] = useState<Fertilizer[]>([]);
  const [filteredFertilizersOptions, setFilteredFertilizerOptions] = useState<Fertilizer[]>([]);
  const [fertilizerUnits, setFertilizerUnits] = useState<FertilizerUnit[]>([]);
  const [densityUnits, setDensityUnits] = useState<any[]>([]);
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

  const dryOrLiquidUnitOptions = fertilizerUnits.filter(
    (ele) =>
      ele.dryliquid ===
      fertilizerTypes.find((fertType) => fertType.id === formState.fertilizerTypeId)?.dryliquid,
  );

  const isLiquidFertilizer = useMemo(
    () =>
      fertilizerTypes.find((ele) => ele.id === formState.fertilizerTypeId)?.dryliquid === 'liquid',
    [fertilizerTypes, formState.fertilizerTypeId],
  );

  const isCustomFertilizer = useMemo(
    () => fertilizerTypes.find((ele) => ele.id === formState.fertilizerTypeId)?.custom,
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

    apiCache.callEndpoint('api/densityunits/').then((response) => {
      if (response.status === 200) {
        const { data } = response;
        setDensityUnits(data);
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

  const isCustomFertilizerValid = () =>
    // isFinite checks if value is truthy or zero, and a number.
    Number.isFinite(formCustomFertilizer.nitrogen) &&
    Number.isFinite(formCustomFertilizer.phosphorous) &&
    Number.isFinite(formCustomFertilizer.potassium);

  // custom fertilizers should have a zero or falsy fertilizerId
  const isRegularFertilizerValid = () => !!formState.fertilizerId;

  const isCommonFertilizerFieldsValid = () => {
    if (
      !formState.applUnitId ||
      !formState.applicationRate ||
      fertilizerOptions.length === 0 ||
      fertilizerUnits.length === 0
    )
      return false;
    return true;
  };

  const isLiquidFertilizerFieldsValid = () => {
    if (formState.densityUnitId && formState.density) return true;
    return false;
  };

  const handleModalCalculate = (e: FormEvent) => {
    e.preventDefault();
    let fertilizer;
    let densityConvFactor;

    // Liquid fertilizer requires extra fields
    if (isLiquidFertilizer) {
      if (!isLiquidFertilizerFieldsValid()) return;

      densityConvFactor = densityUnits.find((ele) => ele.id === formState.densityUnitId).convfactor;
    }

    if (!isCommonFertilizerFieldsValid()) return;

    // Regular fertilizer and custom fertilizer have different logic
    if (isCustomFertilizer) {
      // Logic for custom fertilizer

      // Check validity
      if (!isCustomFertilizerValid()) {
        throw new Error('Invalid custom fertilizer input');
      }
      fertilizer = formCustomFertilizer;
    } else {
      // Logic for regular fertilizer

      // Check validity
      if (!isRegularFertilizerValid()) return;

      fertilizer = fertilizerOptions.find((ele) => ele.id === formState.fertilizerId);
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
      fertilizerUnit,
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
      // eslint-disable-next-line prefer-const
      let changes = structuredClone(updates);

      if (['potassium', 'phosphorous', 'nitrogen'].includes(name)) {
        setFormCustomFertilizer((prev) => ({ ...prev, ...changes }));
      }

      if (name === 'fertilizerTypeId') {
        setFilteredFertilizerOptions(
          fertilizerOptions.filter(
            (ele) =>
              ele.dryliquid ===
              fertilizerTypes.find((fertType) => fertType.id === value)?.dryliquid,
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
        changes.name = filteredFertilizersOptions.find((f) => f.id === value)!.name;
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
                handleInputChanges({ fertilizerTypeId: e as number });
              }}
            />
          </Grid>
          {isCustomFertilizer ? (
            <Grid size={{ xs: 12 }}>
              <div>
                <Grid
                  container
                  spacing={2}
                >
                  <Grid size={{ xs: 4 }}>
                    <TextField
                      isRequired
                      label="N (%)"
                      type="number"
                      name="nitrogen"
                      value={formCustomFertilizer?.nitrogen.toString()}
                      onChange={(e: string) => {
                        handleInputChanges({ nitrogen: parseInt(e, 10) });
                      }}
                      maxLength={5}
                    />
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <TextField
                      isRequired
                      label="P2O5 (%)"
                      type="number"
                      name="phosphorous"
                      value={formCustomFertilizer?.phosphorous.toString()}
                      onChange={(e: string) => {
                        handleInputChanges({ phosphorous: parseInt(e, 10) });
                      }}
                      maxLength={5}
                    />
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <TextField
                      isRequired
                      label="K2O (%)"
                      type="number"
                      name="potassium"
                      value={formCustomFertilizer?.potassium.toString()}
                      onChange={(e: string) => {
                        handleInputChanges({ potassium: parseInt(e, 10) });
                      }}
                      maxLength={5}
                    />
                  </Grid>
                </Grid>
              </div>
            </Grid>
          ) : (
            <Grid size={formGridBreakpoints}>
              <Select
                isRequired
                name="Fertilizer"
                items={filteredFertilizersOptions.map((ele) => ({ id: ele.id, label: ele.name }))}
                label="Fertilizer"
                placeholder="Select Fertilizer"
                selectedKey={formState.fertilizerId}
                onSelectionChange={(e: Key) => {
                  handleInputChanges({ fertilizerId: e as number });
                }}
              />
            </Grid>
          )}
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
                handleInputChanges({ applUnitId: e as number });
              }}
            />
          </Grid>
          {isLiquidFertilizer && (
            <>
              <Grid size={{ xs: 6 }}>
                <TextField
                  isRequired
                  label="Density"
                  type="number"
                  name="Moisture"
                  value={formState?.density?.toString()}
                  onChange={(e: string) => {
                    handleInputChanges({ density: Number(e) });
                  }}
                  maxLength={5}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Select
                  isRequired
                  name="densityUnitId"
                  items={densityUnits.map((ele) => ({ id: ele.id, label: ele.name }))}
                  label="Density Units"
                  placeholder="Select Units"
                  selectedKey={formState?.densityUnitId}
                  onSelectionChange={(e: Key) => {
                    handleInputChanges({ densityUnitId: e as number });
                  }}
                />
              </Grid>
            </>
          )}
          <Grid size={formGridBreakpoints}>
            <Select
              name="applicationMethod"
              items={FERTILIZER_METHOD}
              label="Method (optional)"
              selectedKey={formState.applicationMethod}
              onSelectionChange={(e: Key) => {
                handleInputChanges({ applicationMethod: e as number });
              }}
            />
          </Grid>
          <Grid size={formGridBreakpoints}>
            <span className="bcds-react-aria-Select--Label">Date (optional)</span>
            <InputField
              label=""
              type="date"
              name="applDate"
              value={formState.applDate || 0}
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
