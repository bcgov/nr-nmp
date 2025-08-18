/**
 * @summary The field table on the calculate nutrients page
 */
import React, { useContext, useEffect, useMemo, useState } from 'react';
import Grid from '@mui/material/Grid';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Select, Form, NumberField, InputField } from '@/components/common';
import Modal, { ModalProps } from '@/components/common/Modal/Modal';
import type {
  CalculateNutrientsColumn,
  CropNutrients,
  DensityUnit,
  Fertilizer,
  FertilizerType,
  FertilizerUnit,
  NMPFileFieldData,
  Schedule,
  SelectOption,
} from '@/types';
import { customTableStyle, formGridBreakpoints } from '@/common.styles';
import { NMPFileFertigation } from '@/types';
import { APICacheContext } from '@/context/APICacheContext';
import {
  DRY_CUSTOM_ID,
  EMPTY_CROP_NUTRIENTS,
  INJECTION_RATE_UNITS,
  INJECTION_UNIT_OPTIONS,
  LIQUID_CUSTOM_ID,
  SCHEDULE_OPTIONS,
} from '@/constants';
import useAppState from '@/hooks/useAppState';
import {
  getAppliedNutrientPerApplication,
  getProductWeightInPounds,
} from '../../../calculations/CalculateNutrients/Fertigation/calculations';
import {
  getProductVolumePerApplication,
  getTimePerApplication,
} from '@/calculations/CalculateNutrients/Fertigation/calculations';
import { renderBalanceCell } from '../utils';

type FertigationModalProps = {
  fieldIndex: number;
  initialModalData?: NMPFileFertigation;
  rowEditIndex?: number;
  balanceRow: CalculateNutrientsColumn;
  field: NMPFileFieldData;
  setFields: React.Dispatch<React.SetStateAction<NMPFileFieldData[]>>;
  onClose: () => void;
};

type NutrientRow = {
  reqN: number;
  reqP2o5: number;
  reqK2o: number;
};

const NUTRIENT_COLUMNS: GridColDef[] = [
  {
    field: 'reqN',
    headerName: 'N',
    sortable: false,
    resizable: false,
  },
  {
    field: 'reqP2o5',
    headerName: 'P2O5',
    sortable: false,
    resizable: false,
  },
  {
    field: 'reqK2o',
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

const EMPTY_FERTIGATION_FORM_DATA: NMPFileFertigation = {
  name: '',
  reqN: 0,
  reqP2o5: 0,
  reqK2o: 0,
  remN: 0,
  remP2o5: 0,
  remK2o: 0,
  fertilizerTypeId: 0,
  fertilizerId: 0,
  applicationRate: 0,
  applUnitId: undefined,
  density: 0,
  densityUnitId: undefined,
  tankVolume: 0,
  solubility: 0,
  amountToDissolve: 0,
  injectionRate: 0,
  injectionUnitId: undefined,
  eventsPerSeason: 1,
  applicationPeriod: 0,
  schedule: undefined,
  volume: 0,
  volumeForSeason: 0,
  applicationTime: 0,
};

export default function FertigationModal({
  fieldIndex,
  initialModalData,
  rowEditIndex,
  balanceRow,
  setFields,
  onClose,
  ...props
}: FertigationModalProps & Omit<ModalProps, 'title' | 'children' | 'onOpenChange'>) {
  const { state } = useAppState();
  const field = useMemo(
    () => state.nmpFile.years[0].Fields![fieldIndex],
    [state.nmpFile, fieldIndex],
  );
  const [fertilizerTypes, setFertilizerTypes] = useState<SelectOption<FertilizerType>[]>([]);
  const [fertilizers, setFertilizers] = useState<SelectOption<Fertilizer>[]>([]);
  const [filteredFertilizers, setFilteredFertilizers] = useState<SelectOption<Fertilizer>[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [dryUnits, setDryUnits] = useState<SelectOption<FertilizerUnit>[]>([]);
  const [liquidUnits, setLiquidUnits] = useState<SelectOption<FertilizerUnit>[]>([]);
  const [densityUnits, setDensityUnits] = useState<SelectOption<DensityUnit>[]>([]);
  const [liqDensityFactors, setLiqDensityFactors] = useState<any[]>([]);
  const [formData, setFormData] = useState<NMPFileFertigation>(
    initialModalData || EMPTY_FERTIGATION_FORM_DATA,
  );
  const [isCalculationCurrent, setIsCalculationCurrent] = useState<boolean>(
    initialModalData !== undefined,
  );
  const [balanceCalcRow, setBalanceCacRow] = useState<NutrientRow>({
    reqN: Math.min(balanceRow.reqN, 0),
    reqP2o5: Math.min(balanceRow.reqP2o5, 0),
    reqK2o: Math.min(balanceRow.reqK2o, 0),
  });
  const totalNutrientRow = useMemo<NutrientRow>(
    () => ({
      reqN: formData.reqN * formData.eventsPerSeason,
      reqP2o5: formData.reqP2o5 * formData.eventsPerSeason,
      reqK2o: formData.reqK2o * formData.eventsPerSeason,
    }),
    [formData],
  );
  const apiCache = useContext(APICacheContext);

  const isLiquidFertilizer = useMemo(
    () =>
      fertilizerTypes.find((ele) => ele.id === formData.fertilizerTypeId)?.value.dryliquid ===
      'liquid',
    [fertilizerTypes, formData.fertilizerTypeId],
  );

  const isCustomFertilizer = useMemo(
    () => fertilizerTypes.find((ele) => ele.id === formData.fertilizerTypeId)?.value.custom,
    [fertilizerTypes, formData.fertilizerTypeId],
  );

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
              if (formData.fertilizerTypeId) {
                setFilteredFertilizers(
                  fertOptions.filter(
                    (ele) =>
                      ele.value.dryliquid ===
                      fertilizerTs.find((fertType) => fertType.id === formData.fertilizerTypeId)
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
        const units: FertilizerUnit[] = response.data;
        const unitOptions = units.map((ele) => ({ id: ele.id, label: ele.name, value: ele }));
        const unitsDry: SelectOption<FertilizerUnit>[] = [];
        const unitsLiquid: SelectOption<FertilizerUnit>[] = [];
        unitOptions.forEach((u) =>
          u.value.dryliquid === 'dry' ? unitsDry.push(u) : unitsLiquid.push(u),
        );
        setDryUnits(unitsDry);
        setLiquidUnits(unitsLiquid);
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

  const handleSubmit = () => {
    setFields((prevFields) => {
      const newFields = [...prevFields];
      const newField = newFields[fieldIndex];
      if (rowEditIndex !== undefined) {
        const newFertigations = [...newField.Fertigations];
        newFertigations[rowEditIndex] = { ...formData };
        newField.Fertigations = newFertigations;
      } else {
        newField.Fertigations = [...newField.Fertigations, { ...formData }];
      }
      return newFields;
    });

    onClose();
  };

  const handleModalCalculate = () => {
    debugger;
    let nutrients: CropNutrients;
    if (formData.customNutrients) {
      nutrients = formData.customNutrients;
    } else {
      const f = fertilizers.find((ele) => ele.id === formData.fertilizerId)?.value;
      if (f === undefined)
        throw new Error(`Fertilizer ${formData.fertilizerId} is missing from list.`);
      nutrients = { N: f.nitrogen, P2O5: f.phosphorous, K2O: f.potassium };
    }

    // Common to liquid and dry calc
    const injectionUnit = INJECTION_RATE_UNITS.find(
      (unit) => unit.id === formData.injectionUnitId!,
    )!;

    if (isLiquidFertilizer) {
      const applicationUnit = liquidUnits.find((u) => u.id === formData.applUnitId)?.value;
      if (!applicationUnit)
        throw new Error(`Fertilizer unit ${formData.applUnitId} is missing from list.`);
      const densityUnit = densityUnits.find((u) => u.id === formData.densityUnitId)?.value;
      if (!densityUnit)
        throw new Error(`Density unit ${formData.densityUnitId} is missing from list.`);

      const volume = getProductVolumePerApplication(
        formData.applicationRate!,
        applicationUnit,
        field.Area,
      );
      const volumeForSeason = volume * formData.eventsPerSeason;
      const applicationTime = getTimePerApplication(
        formData.applicationRate!,
        applicationUnit,
        field.Area,
        formData.injectionRate,
        injectionUnit,
      );
      const weight = getProductWeightInPounds(
        formData.applicationRate!,
        applicationUnit,
        field.Area,
        formData.density!,
        densityUnit,
      );
      const reqN =
        Math.round(getAppliedNutrientPerApplication(weight, field.Area, nutrients.N) * 10) / 10;
      const reqP2o5 =
        Math.round(getAppliedNutrientPerApplication(weight, field.Area, nutrients.P2O5) * 10) / 10;
      const reqK2o =
        Math.round(getAppliedNutrientPerApplication(weight, field.Area, nutrients.K2O) * 10) / 10;
      setFormData((prev) => ({
        ...prev,
        volume,
        volumeForSeason,
        applicationTime,
        reqN,
        remN: reqN,
        reqP2o5,
        remP2o5: reqP2o5,
        reqK2o,
        remK2o: reqK2o,
      }));
      setBalanceCacRow({
        reqN: Math.min(0, balanceRow.reqN + reqN),
        reqP2o5: Math.min(0, balanceRow.reqP2o5 + reqP2o5),
        reqK2o: Math.min(0, balanceRow.reqK2o + reqK2o),
      });
    }

    setIsCalculationCurrent(true);
  };

  const handleInputChanges = (updates: Partial<NMPFileFertigation>) => {
    setIsCalculationCurrent(false);
    setFormData((prev) => {
      let next = { ...prev };

      // Make additional changes depending on the updates
      Object.entries(updates).forEach(([name, value]) => {
        if (name === 'fertilizerTypeId') {
          setFilteredFertilizers(
            fertilizers.filter(
              (ele) =>
                ele.value.dryliquid ===
                fertilizerTypes.find((fertType) => fertType.id === value)?.value.dryliquid,
            ),
          );

          if (value === DRY_CUSTOM_ID || value === LIQUID_CUSTOM_ID) {
            next.customNutrients = EMPTY_CROP_NUTRIENTS;
          } else {
            next.customNutrients = undefined;
          }

          // Reset values on changes
          next = { ...EMPTY_FERTIGATION_FORM_DATA };
        }

        if (name === 'fertilizerId') {
          next.name = filteredFertilizers.find((f) => f.id === value)!.label;
          // Load liquid densities.
          if (isLiquidFertilizer && !isCustomFertilizer) {
            const densityValue = liqDensityFactors.find((ele) => ele.fertilizerid === value);

            next.density = densityValue.value;
            next.densityUnitId = densityValue.densityunitid;
          }
        }

        if (name === 'densityUnitId') {
          if (isLiquidFertilizer && !isCustomFertilizer) {
            const densityValue = liqDensityFactors.find(
              (ele) => ele.fertilizerid === formData.fertilizerId && ele.densityunitid === value,
            );
            // densityValue is undef when a fertilizer is unselected
            next.density = densityValue ? densityValue.value : 0;
          }
        }
      });

      // Apply the updates
      return { ...next, ...updates };
    });
  };

  const handleCustomChanges = (name: keyof CropNutrients, value: number) => {
    setIsCalculationCurrent(false);
    setFormData((prev) => ({
      ...prev,
      customNutrients: { ...prev.customNutrients!, [name]: value },
    }));
  };

  return (
    <Modal
      title="Add Fertigation"
      onOpenChange={onClose}
      {...props}
    >
      <Form
        onCancel={onClose}
        onConfirm={handleSubmit}
        onCalculate={handleModalCalculate}
        isConfirmDisabled={!isCalculationCurrent}
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
              selectedKey={formData.fertilizerTypeId}
              onSelectionChange={(e) => handleInputChanges({ fertilizerTypeId: e as number })}
            />
          </Grid>
          {formData.customNutrients ? (
            <Grid size={{ xs: 12 }}>
              <Grid
                container
                spacing={2}
              >
                <Grid size={{ xs: 4 }}>
                  <NumberField
                    isRequired
                    label="N (%)"
                    value={formData.customNutrients.N}
                    onChange={(e) => handleCustomChanges('N', e)}
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
                    value={formData.customNutrients.P2O5}
                    onChange={(e) => handleCustomChanges('P2O5', e)}
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
                    value={formData.customNutrients.K2O}
                    onChange={(e) => handleCustomChanges('K2O', e)}
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
                selectedKey={formData.fertilizerId}
                onSelectionChange={(e) => handleInputChanges({ fertilizerId: e as number })}
              />
            </Grid>
          )}
          {isLiquidFertilizer && (
            <>
              <Grid size={{ xs: 6 }}>
                <NumberField
                  isRequired
                  label="Application Rate"
                  value={formData.applicationRate}
                  onChange={(e) => handleInputChanges({ applicationRate: e })}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Select
                  isRequired
                  items={liquidUnits}
                  label="Units"
                  placeholder="Select Units"
                  selectedKey={formData.applUnitId}
                  onSelectionChange={(e) =>
                    handleInputChanges({
                      applUnitId: e as number,
                      applUnitName: liquidUnits.find((u) => u.id === e)!.label,
                    })
                  }
                  noSort
                  autoselectFirst
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <NumberField
                  isRequired
                  label="Density"
                  value={formData.density}
                  onChange={(e) => handleInputChanges({ density: e })}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Select
                  isRequired
                  items={densityUnits}
                  label="Units"
                  placeholder="Select Units"
                  selectedKey={formData.densityUnitId}
                  onSelectionChange={(e) => handleInputChanges({ densityUnitId: e as number })}
                  noSort
                  autoselectFirst
                />
              </Grid>
            </>
          )}
          <Grid size={{ xs: 6 }}>
            <NumberField
              isRequired
              label="Injection Rate"
              value={formData.injectionRate}
              onChange={(e) => handleInputChanges({ injectionRate: e })}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Select
              isRequired
              items={INJECTION_UNIT_OPTIONS}
              label="Units"
              placeholder="Select Units"
              selectedKey={formData.injectionUnitId}
              onSelectionChange={(e) => handleInputChanges({ injectionUnitId: e as number })}
              noSort
              autoselectFirst
            />
          </Grid>
          <Grid size={formGridBreakpoints}>
            <NumberField
              isRequired
              label="Fertigation Applications Per Season"
              value={formData.eventsPerSeason}
              onChange={(e) => handleInputChanges({ eventsPerSeason: e })}
              minValue={1}
              step={1}
            />
          </Grid>
          <Grid size={formGridBreakpoints}>
            <Select
              isRequired
              items={SCHEDULE_OPTIONS}
              label="Application Frequency"
              selectedKey={formData.schedule}
              onSelectionChange={(e) => handleInputChanges({ schedule: e as Schedule })}
              noSort
              autoselectFirst
            />
            <InputField
              type="date"
              value={formData.startDate || ''}
              onChange={(e) => handleInputChanges({ startDate: e.target.value })}
            />
          </Grid>
        </Grid>
        {isLiquidFertilizer && (
          <>
            <Grid
              container
              spacing={2}
            >
              <Grid size={4}>
                <span className="bcds-react-aria-Text primary small">
                  Total Product Volume per Application
                  {formData.applUnitName
                    ? ` (${formData.applUnitName.slice(0, formData.applUnitName.indexOf('/'))})`
                    : ''}
                </span>
                <div>
                  <span css={{ display: 'block', marginTop: '8px' }}>
                    {formData.volume.toFixed(2)}
                  </span>
                </div>
              </Grid>
              <Grid size={4}>
                <span className="bcds-react-aria-Text primary small">
                  Total Product Volume for Growing Season
                  {formData.applUnitName
                    ? ` (${formData.applUnitName.slice(0, formData.applUnitName.indexOf('/'))})`
                    : ''}
                </span>
                <div>
                  <span css={{ display: 'block', marginTop: '8px' }}>
                    {formData.volumeForSeason.toFixed(2)}
                  </span>
                </div>
              </Grid>
              <Grid size={4}>
                <span className="bcds-react-aria-Text primary small">
                  Time per Application (minutes)
                </span>
                <div>
                  <span css={{ display: 'block', marginTop: '8px' }}>
                    {formData.applicationTime.toFixed(2)}
                  </span>
                </div>
              </Grid>
            </Grid>
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
                  size={{ xs: 12, md: 4 }}
                  sx={{ maxWidth: '400px', justifyItems: 'center' }}
                >
                  <div css={{ fontWeight: 'bold', textAlign: 'center', maxWidth: '300px' }}>
                    Applied Nutrients per Fertigation (lb/ac)
                    <DataGrid
                      sx={{ ...customTableStyle }}
                      columns={NUTRIENT_COLUMNS}
                      rows={[formData]}
                      getRowId={() => crypto.randomUUID()}
                      disableRowSelectionOnClick
                      disableColumnMenu
                      hideFooterPagination
                      hideFooter
                    />
                  </div>
                </Grid>
                <Grid
                  size={{ xs: 12, md: 4 }}
                  sx={{ maxWidth: '400px', justifyItems: 'center' }}
                >
                  <div css={{ fontWeight: 'bold', textAlign: 'center', maxWidth: '300px' }}>
                    Total Applied Nutrients (lb/ac)
                    <DataGrid
                      sx={{ ...customTableStyle }}
                      columns={NUTRIENT_COLUMNS}
                      rows={[totalNutrientRow]}
                      getRowId={() => crypto.randomUUID()}
                      disableRowSelectionOnClick
                      disableColumnMenu
                      hideFooterPagination
                      hideFooter
                    />
                  </div>
                </Grid>
                <Grid
                  size={{ xs: 12, md: 4 }}
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
          </>
        )}
      </Form>
    </Modal>
  );
}
