/**
 * @summary The field table on the calculate nutrients page
 */
import React, { useContext, useEffect, useMemo, useState } from 'react';
import Grid from '@mui/material/Grid';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Select, Form, NumberField, InputField } from '@/components/common';
import Modal, { ModalProps } from '@/components/common/Modal/Modal';
import type {
  CalculateNutrientsRow,
  CropNutrients,
  DensityUnit,
  Fertilizer,
  FertilizerType,
  FertilizerUnit,
  LiquidFertilizerDensity,
  NMPFileField,
  Schedule,
  SelectOption,
} from '@/types';
import { customTableStyle } from '@/common.styles';
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
} from '../../../../calculations/CalculateNutrients/Fertigation/calculations';
import {
  getProductVolumePerApplication,
  getTimePerApplication,
  calculateSolidFertigation,
} from '@/calculations/CalculateNutrients/Fertigation/calculations';
import { renderBalanceCell } from '../../utils';
import {
  AMOUNT_TO_DISSOLVE_UNITS,
  SOLUBILITY_RATE_UNITS,
  TANK_VOLUME_UNITS,
  DRY_FERTILIZER_SOLUBILITIES,
} from '@/constants/CalculateNutrients';
import {
  modalContentStyles,
  calculationDisplayStyles,
  calculationItemStyles,
  calculationLabelStyles,
  calculationValueStyles,
  concentrationDisplayStyles,
  concentrationItemStyles,
  concentrationHeaderStyles,
  solubilityHeaderStyles,
  solubilityStatusSoluble,
  solubilityStatusNotSoluble,
  solubilityStatusNormal,
  dryApplicationTimeStyles,
  nutrientTablesContainerStyles,
  nutrientTableItemStyles,
  nutrientTableHeaderStyles,
} from './fertigationModal.styles';
import { printNum } from '@/utils/utils';

type FertigationModalProps = {
  fieldIndex: number;
  initialModalData?: NMPFileFertigation;
  rowEditIndex?: number;
  balanceRow: CalculateNutrientsRow;
  field: NMPFileField;
  setFields: React.Dispatch<React.SetStateAction<NMPFileField[]>>;
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
  applUnitId: 0,
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
  dryAction: undefined,
  nutrientConcentrationN: 0,
  nutrientConcentrationP2O5: 0,
  nutrientConcentrationK2O: 0,
  kglNutrientConcentrationN: 0,
  kglNutrientConcentrationP2O5: 0,
  kglNutrientConcentrationK2O: 0,
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
    () => state.nmpFile.years[0].fields[fieldIndex],
    [state.nmpFile, fieldIndex],
  );
  const [fertilizerTypes, setFertilizerTypes] = useState<SelectOption<FertilizerType>[]>([]);
  const [fertilizers, setFertilizers] = useState<SelectOption<Fertilizer>[]>([]);
  const [filteredFertilizers, setFilteredFertilizers] = useState<SelectOption<Fertilizer>[]>([]);
  const [liquidUnits, setLiquidUnits] = useState<SelectOption<FertilizerUnit>[]>([]);
  const [densityUnits, setDensityUnits] = useState<SelectOption<DensityUnit>[]>([]);
  const [liqDensityFactors, setLiqDensityFactors] = useState<LiquidFertilizerDensity[]>([]);
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

  const isDryFertilizer = useMemo(
    () =>
      fertilizerTypes.find((ele) => ele.id === formData.fertilizerTypeId)?.value.dryliquid ===
      'dry',
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
        const newFertigations = [...newField.fertigations];
        newFertigations[rowEditIndex] = { ...formData };
        newField.fertigations = newFertigations;
      } else {
        newField.fertigations = [...newField.fertigations, { ...formData }];
      }
      return newFields;
    });

    onClose();
  };

  const handleModalCalculate = () => {
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
        field.area,
      );
      const volumeForSeason = volume * formData.eventsPerSeason;
      const applicationTime = getTimePerApplication(
        formData.applicationRate!,
        applicationUnit,
        field.area,
        formData.injectionRate,
        injectionUnit,
      );
      const weight = getProductWeightInPounds(
        formData.applicationRate!,
        applicationUnit,
        field.area,
        formData.density!,
        densityUnit,
      );
      const reqN =
        Math.round(getAppliedNutrientPerApplication(weight, field.area, nutrients.N) * 10) / 10;
      const reqP2o5 =
        Math.round(getAppliedNutrientPerApplication(weight, field.area, nutrients.P2O5) * 10) / 10;
      const reqK2o =
        Math.round(getAppliedNutrientPerApplication(weight, field.area, nutrients.K2O) * 10) / 10;
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

    if (isDryFertilizer) {
      if (!formData.tankUnitId) {
        throw new Error('Tank volume and units are required for dry fertigation');
      }
      if (!formData.solubilityUnitId) {
        throw new Error('Solubility and units are required for dry fertigation');
      }
      if (!formData.amountToDissolveUnitId) {
        throw new Error('Amount to dissolve and units are required for dry fertigation');
      }

      const solidCalc = calculateSolidFertigation(
        formData.amountToDissolve,
        formData.amountToDissolveUnitId,
        formData.tankVolume,
        formData.tankUnitId,
        formData.solubility,
        formData.solubilityUnitId,
        formData.injectionRate,
        formData.injectionUnitId!,
        field.area,
        formData.eventsPerSeason,
        nutrients.N,
        nutrients.P2O5,
        nutrients.K2O,
      );

      setFormData((prev) => ({
        ...prev,
        applicationTime: solidCalc.fertigationTime,
        reqN: solidCalc.calcN,
        remN: solidCalc.calcN,
        reqP2o5: solidCalc.calcP2O5,
        remP2o5: solidCalc.calcP2O5,
        reqK2o: solidCalc.calcK2O,
        remK2o: solidCalc.calcK2O,
        // Store additional dry fertigation results
        dryAction: solidCalc.dryAction,
        nutrientConcentrationN: solidCalc.nutrientConcentrationN,
        nutrientConcentrationP2O5: solidCalc.nutrientConcentrationP2O5,
        nutrientConcentrationK2O: solidCalc.nutrientConcentrationK2O,
        kglNutrientConcentrationN: solidCalc.kglNutrientConcentrationN,
        kglNutrientConcentrationP2O5: solidCalc.kglNutrientConcentrationP2O5,
        kglNutrientConcentrationK2O: solidCalc.kglNutrientConcentrationK2O,
      }));

      setBalanceCacRow({
        reqN: Math.min(0, balanceRow.reqN + solidCalc.calcN),
        reqP2o5: Math.min(0, balanceRow.reqP2o5 + solidCalc.calcP2O5),
        reqK2o: Math.min(0, balanceRow.reqK2o + solidCalc.calcK2O),
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
                  fertilizerTypes.find((fertType) => fertType.id === value)?.value.dryliquid &&
                ele.value.fertigation === true,
            ),
          );

          // Reset values on changes
          next = { ...EMPTY_FERTIGATION_FORM_DATA };

          if (value === DRY_CUSTOM_ID || value === LIQUID_CUSTOM_ID) {
            next.customNutrients = EMPTY_CROP_NUTRIENTS;
            next.name = 'Custom fertilizer';
          } else {
            next.customNutrients = undefined;
          }
        }

        if (name === 'fertilizerId') {
          next.name = filteredFertilizers.find((f) => f.id === value)!.label;
          // Load liquid densities.
          if (isLiquidFertilizer && !isCustomFertilizer) {
            const densityValue = liqDensityFactors.find((ele) => ele.fertilizerid === value)!;

            next.density = densityValue.value;
            next.densityUnitId = densityValue.densityunitid;
          }

          // Auto-populate solubility for dry fertilizers
          if (isDryFertilizer && next.solubilityUnitId) {
            const solubilityData = DRY_FERTILIZER_SOLUBILITIES.find(
              (item) =>
                item.fertilizerId === value && item.solubilityUnitId === next.solubilityUnitId,
            );
            if (solubilityData) {
              next.solubility = solubilityData.value;
            }
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

        if (name === 'solubilityUnitId') {
          // Auto-populate solubility when units change for dry fertilizers
          if (isDryFertilizer && next.fertilizerId) {
            const solubilityData = DRY_FERTILIZER_SOLUBILITIES.find(
              (item) => item.fertilizerId === next.fertilizerId && item.solubilityUnitId === value,
            );
            if (solubilityData) {
              next.solubility = solubilityData.value;
            }
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
      <div css={modalContentStyles}>
        <Form
          onCancel={onClose}
          onConfirm={handleSubmit}
          onCalculate={handleModalCalculate}
          isConfirmDisabled={!isCalculationCurrent}
        >
          <Grid
            container
            spacing={1.5}
          >
            <Grid size={{ xs: 12, md: 6 }}>
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
                  spacing={1.5}
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
              <Grid size={{ xs: 12, md: 6 }}>
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
            {isDryFertilizer && (
              <>
                <Grid size={{ xs: 6 }}>
                  <NumberField
                    isRequired
                    label="Tank Volume"
                    value={formData.tankVolume}
                    onChange={(e) => handleInputChanges({ tankVolume: e })}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Select
                    isRequired
                    items={TANK_VOLUME_UNITS}
                    label="Units"
                    placeholder="Select Units"
                    selectedKey={formData.tankUnitId}
                    onSelectionChange={(e) => handleInputChanges({ tankUnitId: e as number })}
                    noSort
                    autoselectFirst
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <NumberField
                    isRequired
                    label="Solubility"
                    value={formData.solubility}
                    onChange={(e) => handleInputChanges({ solubility: e })}
                    minValue={0}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Select
                    isRequired
                    items={SOLUBILITY_RATE_UNITS}
                    label="Units"
                    placeholder="Select Units"
                    selectedKey={formData.solubilityUnitId}
                    onSelectionChange={(e) => handleInputChanges({ solubilityUnitId: e as number })}
                    noSort
                    autoselectFirst
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <NumberField
                    isRequired
                    label="Amount to Dissolve"
                    value={formData.amountToDissolve}
                    onChange={(e) => handleInputChanges({ amountToDissolve: e })}
                    minValue={0}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Select
                    isRequired
                    items={AMOUNT_TO_DISSOLVE_UNITS}
                    label="Units"
                    placeholder="Select Units"
                    selectedKey={formData.amountToDissolveUnitId}
                    onSelectionChange={(e) =>
                      handleInputChanges({ amountToDissolveUnitId: e as number })
                    }
                    noSort
                    autoselectFirst
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <div css={concentrationDisplayStyles}>
                    <div css={concentrationItemStyles}>
                      <div css={concentrationHeaderStyles}>
                        Nutrient Concentration (lb/US gallon)
                      </div>
                      <DataGrid
                        sx={{ ...customTableStyle, fontSize: '12px' }}
                        columns={NUTRIENT_COLUMNS}
                        rows={[
                          {
                            reqN: formData.nutrientConcentrationN || 0,
                            reqP2o5: formData.nutrientConcentrationP2O5 || 0,
                            reqK2o: formData.nutrientConcentrationK2O || 0,
                          },
                        ]}
                        getRowId={() => crypto.randomUUID()}
                        disableRowSelectionOnClick
                        disableColumnMenu
                        hideFooterPagination
                        hideFooter
                      />
                    </div>
                    <div css={concentrationItemStyles}>
                      <div css={concentrationHeaderStyles}>Nutrient Concentration (kg/L)</div>
                      <DataGrid
                        sx={{ ...customTableStyle, fontSize: '12px' }}
                        columns={NUTRIENT_COLUMNS}
                        rows={[
                          {
                            reqN: formData.kglNutrientConcentrationN || 0,
                            reqP2o5: formData.kglNutrientConcentrationP2O5 || 0,
                            reqK2o: formData.kglNutrientConcentrationK2O || 0,
                          },
                        ]}
                        getRowId={() => crypto.randomUUID()}
                        disableRowSelectionOnClick
                        disableColumnMenu
                        hideFooterPagination
                        hideFooter
                      />
                    </div>
                  </div>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <div css={solubilityHeaderStyles}>Solubility Assessment</div>
                  {formData.dryAction ? (
                    <div
                      css={
                        formData.dryAction === 'Soluble'
                          ? solubilityStatusSoluble
                          : solubilityStatusNotSoluble
                      }
                    >
                      Status: {formData.dryAction}
                    </div>
                  ) : (
                    <div css={solubilityStatusNormal}>Normal</div>
                  )}
                </Grid>
              </>
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
            <Grid size={{ xs: 12, md: 6 }}>
              <NumberField
                isRequired
                label="Fertigation Applications Per Season"
                value={formData.eventsPerSeason}
                onChange={(e) => handleInputChanges({ eventsPerSeason: e })}
                minValue={1}
                step={1}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Select
                isRequired
                items={SCHEDULE_OPTIONS}
                label="Application Frequency"
                selectedKey={formData.schedule}
                onSelectionChange={(e) => handleInputChanges({ schedule: e as Schedule })}
                noSort
                autoselectFirst
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <InputField
                type="date"
                value={formData.startDate || ''}
                onChange={(e) => handleInputChanges({ startDate: e.target.value })}
                required
              />
            </Grid>
          </Grid>
          {isLiquidFertilizer && (
            <div css={calculationDisplayStyles}>
              <div css={calculationItemStyles}>
                <span css={calculationLabelStyles}>
                  Total Product Volume per Application
                  {formData.applUnitName
                    ? ` (${formData.applUnitName.slice(0, formData.applUnitName.indexOf('/'))})`
                    : ''}
                </span>
                <div css={calculationValueStyles}>{printNum(formData.volume, 2)}</div>
              </div>
              <div css={calculationItemStyles}>
                <span css={calculationLabelStyles}>
                  Total Product Volume for Growing Season
                  {formData.applUnitName
                    ? ` (${formData.applUnitName.slice(0, formData.applUnitName.indexOf('/'))})`
                    : ''}
                </span>
                <div css={calculationValueStyles}>{printNum(formData.volumeForSeason, 2)}</div>
              </div>
              <div css={calculationItemStyles}>
                <span css={calculationLabelStyles}>Time per Application (minutes)</span>
                <div css={calculationValueStyles}>{printNum(formData.applicationTime, 2)}</div>
              </div>
            </div>
          )}
          {isDryFertilizer && (
            <div css={dryApplicationTimeStyles}>
              <span css={calculationLabelStyles}>Time per Application (minutes)</span>
              <div css={calculationValueStyles}>{printNum(formData.applicationTime, 2)}</div>
            </div>
          )}
          <div css={nutrientTablesContainerStyles}>
            <div css={nutrientTableItemStyles}>
              <div css={nutrientTableHeaderStyles}>Applied Nutrients per Fertigation (lb/ac)</div>
              <DataGrid
                sx={{ ...customTableStyle, fontSize: '12px' }}
                columns={NUTRIENT_COLUMNS}
                rows={[formData]}
                getRowId={() => crypto.randomUUID()}
                disableRowSelectionOnClick
                disableColumnMenu
                hideFooterPagination
                hideFooter
              />
            </div>
            <div css={nutrientTableItemStyles}>
              <div css={nutrientTableHeaderStyles}>Total Applied Nutrients (lb/ac)</div>
              <DataGrid
                sx={{ ...customTableStyle, fontSize: '12px' }}
                columns={NUTRIENT_COLUMNS}
                rows={[totalNutrientRow]}
                getRowId={() => crypto.randomUUID()}
                disableRowSelectionOnClick
                disableColumnMenu
                hideFooterPagination
                hideFooter
              />
            </div>
            <div css={nutrientTableItemStyles}>
              <div css={nutrientTableHeaderStyles}>Still Required This Year (lb/ac)</div>
              <DataGrid
                sx={{ ...customTableStyle, fontSize: '12px' }}
                columns={BALANCE_COLUMNS}
                rows={[balanceCalcRow]}
                getRowId={() => crypto.randomUUID()}
                disableRowSelectionOnClick
                disableColumnMenu
                hideFooterPagination
                hideFooter
              />
            </div>
          </div>
        </Form>
      </div>
    </Modal>
  );
}
