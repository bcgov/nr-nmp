/**
 * @summary The field table on the calculate nutrients page
 */
import { useContext, useEffect, useState, Dispatch, SetStateAction, useMemo } from 'react';
import Grid from '@mui/material/Grid';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import LoopIcon from '@mui/icons-material/Loop';
import { Button, ButtonGroup } from '@bcgov/design-system-react-components';
import { APICacheContext } from '@/context/APICacheContext';
import { customTableStyle, formGridBreakpoints } from '@/common.styles';
import { Form, NumberField, Select } from '@/components/common';
import Modal, { ModalProps } from '@/components/common/Modal/Modal';
// Data not seeded in DB.
import SEASON_APPLICATION from '../unseededData';
import { DEFAULT_NMPFILE_APPLIED_MANURE, EMPTY_CROP_NUTRIENTS } from '@/constants';

import {
  CropNutrients,
  NMPFileField,
  NMPFileNutrientAnalysis,
  NMPFileAppliedManure,
  SelectOption,
  Units,
  ManureType,
  Manure,
  AmmoniaRetention,
  NitrogenMineralization,
  MaterialRemainingData,
  SolidMaterialApplicationTonPerAcreRateConversions,
  LiquidMaterialApplicationUsGallonsPerAcreRateConversions,
} from '@/types';
import { getNutrientInputs } from '@/calculations/ManureAndCompost/ManureAndImports/Calculations';
import useAppState from '@/hooks/useAppState';
import { MANURE_IMPORTS } from '@/constants/routes';
import { calculateMaterialRemaining } from '@/calculations/MaterialRemaining/Calculations';
import { MaterialRemainingDisplay } from '@/components/MaterialRemaining';

type AddManureModalProps = {
  fieldIndex: number;
  initialModalData?: NMPFileAppliedManure;
  rowEditIndex?: number;
  field: NMPFileField;
  fields: NMPFileField[];
  setFields: Dispatch<SetStateAction<NMPFileField[]>>;
  onCancel: () => void;
  navigateAway: (navigateTo: string) => void;
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

export default function ManureModal({
  fieldIndex,
  initialModalData,
  rowEditIndex,
  onCancel,
  field,
  fields,
  setFields,
  navigateAway,
  ...props
}: AddManureModalProps & Omit<ModalProps, 'title' | 'children' | 'onOpenChange'>) {
  const { state } = useAppState();
  const manuresWithNutrients = state.nmpFile.years[0].nutrientAnalyses;

  const apiCache = useContext(APICacheContext);
  const [manureForm, setManureForm] = useState<NMPFileAppliedManure>(
    initialModalData || DEFAULT_NMPFILE_APPLIED_MANURE,
  );
  const selectedNutrientAnalysis = useMemo(
    () => manuresWithNutrients.find((m) => m.sourceUuid === manureForm.sourceUuid),
    [manuresWithNutrients, manureForm.sourceUuid],
  );
  const [isCalculationCurrent, setIsCalculationCurrent] = useState<boolean>(
    initialModalData !== undefined,
  );

  // Material remaining calculations with current form data
  const [pendingApplication, setPendingApplication] = useState<NMPFileAppliedManure | null>(null);

  // Create modified year data that includes the pending application
  const yearDataWithPendingApplication = useMemo(() => {
    const currentYearData = {
      ...state.nmpFile.years[0],
      fields,
    };

    if (!pendingApplication || !isCalculationCurrent) {
      return currentYearData;
    }

    // Create a modified version of the field with the pending application
    const modifiedFields = [...fields];
    const targetField = modifiedFields[fieldIndex];

    if (targetField) {
      let updatedManures;
      if (rowEditIndex !== undefined) {
        updatedManures = [...(targetField.manures || [])];
        updatedManures[rowEditIndex] = pendingApplication;
      } else {
        updatedManures = [...(targetField.manures || []), pendingApplication];
      }

      const modifiedField = {
        ...targetField,
        manures: updatedManures,
      };
      modifiedFields[fieldIndex] = modifiedField;
    }

    return {
      ...currentYearData,
      fields: modifiedFields,
    };
  }, [
    state.nmpFile.years,
    fields,
    pendingApplication,
    isCalculationCurrent,
    fieldIndex,
    rowEditIndex,
  ]);

  // Get material type from storage system or imported manure
  const selectedMaterialType = useMemo(() => {
    if (!manureForm.solidLiquid) return null;

    // Convert string to ManureType enum
    return manureForm.solidLiquid === 'Liquid' ? ManureType.Liquid : ManureType.Solid;
  }, [manureForm.solidLiquid]);

  const [manureUnits, setManureUnits] = useState<SelectOption<Units>[]>([]);

  const [materialRemainingData, setMaterialRemainingData] = useState<MaterialRemainingData | null>(
    null,
  );

  const [solidConversions, setSolidConversions] = useState<
    SolidMaterialApplicationTonPerAcreRateConversions[]
  >([]);
  const [liquidConversions, setLiquidConversions] = useState<
    LiquidMaterialApplicationUsGallonsPerAcreRateConversions[]
  >([]);

  const hasMaterialRemainingData = materialRemainingData !== null;

  const filteredManureUnits = useMemo(
    () => manureUnits.filter((u) => u.value.solidliquid === manureForm.solidLiquid),
    [manureUnits, manureForm.solidLiquid],
  );

  const [manures, setManures] = useState<Manure[]>([]);
  const selectedManure = useMemo(
    () => manures.find((m) => m.id === manureForm.manureId),
    [manures, manureForm.manureId],
  );

  const manureData = useMemo(() => {
    const data: { [manureId: number]: { moisture?: number } } = {};

    manures.forEach((manure) => {
      if (manure.moisture !== undefined && manure.moisture !== null) {
        const moistureValue = parseFloat(manure.moisture);
        if (!Number.isNaN(moistureValue)) {
          data[manure.id] = { moisture: moistureValue };
        }
      }
    });

    return Object.keys(data).length > 0 ? data : undefined;
  }, [manures]);

  useEffect(() => {
    if (
      !yearDataWithPendingApplication ||
      !selectedMaterialType ||
      manureUnits.length === 0 ||
      solidConversions.length === 0 ||
      liquidConversions.length === 0
    ) {
      setMaterialRemainingData(null);
      return;
    }

    try {
      const result = calculateMaterialRemaining(
        yearDataWithPendingApplication,
        solidConversions,
        liquidConversions,
        manureData,
        manureUnits.map((unit) => unit.value),
      );
      setMaterialRemainingData(result);
    } catch (err) {
      console.error('Failed to calculate material remaining data:', err);
      setMaterialRemainingData(null);
    }
  }, [
    yearDataWithPendingApplication,
    selectedMaterialType,
    manureUnits,
    solidConversions,
    liquidConversions,
    manureData,
  ]);

  const [ammoniaRetentions, setAmmoniaRetentions] = useState<AmmoniaRetention[]>([]);
  const [defaultAmmonia, setDefaultAmmonia] = useState<number | undefined>(undefined);

  const [nmineralizations, setNMineralizations] = useState<NitrogenMineralization[]>([]);
  const [defaultOrganicN, setDefaultOrganicN] = useState<number | undefined>(undefined);

  const filteredApplicationMethods = useMemo(() => {
    if (!manureForm.solidLiquid) return [];
    return SEASON_APPLICATION.filter(
      (a) =>
        a.ManureType === 3 || // 3 here means solid or liquid
        a.ManureType === ManureType[manureForm.solidLiquid as keyof typeof ManureType],
    ).map((a) => ({
      id: a.Id,
      label: a.Name,
    }));
  }, [manureForm.solidLiquid]);

  const availableThisYearTable: CropNutrients = useMemo(
    () => ({
      N: manureForm.reqN,
      P2O5: manureForm.reqP2o5,
      K2O: manureForm.reqK2o,
    }),
    [manureForm],
  );
  const availableLongTermTable: CropNutrients = useMemo(
    () => ({
      N: manureForm.remN,
      P2O5: manureForm.remP2o5,
      K2O: manureForm.remK2o,
    }),
    [manureForm],
  );
  // TODO: Replace this with a calculation based on the balance row
  const [stillReqTable, setStillReqTable] = useState<CropNutrients>(EMPTY_CROP_NUTRIENTS);

  // Set the default values for NH4 and organic N //
  useEffect(() => {
    if (!selectedManure) return;
    const valueDecimal = ammoniaRetentions.find(
      (a) =>
        a.drymatter === selectedManure.drymatterid &&
        a.seasonapplicationid === manureForm.applicationId,
    )?.value;
    const valuePercent = valueDecimal ? valueDecimal * 100 : undefined;
    setDefaultAmmonia(valuePercent);
    // TODO: DON'T set this if the user just opened the editing modal (resets the saved value)
    if (valuePercent !== undefined) {
      setManureForm((prev) => ({
        ...prev,
        nh4Retention: valuePercent,
        nh4RetentionAdjusted: false,
      }));
    }
  }, [selectedManure, ammoniaRetentions, manureForm.applicationId]);

  useEffect(() => {
    if (!selectedManure) return;
    const valueDecimal = nmineralizations.find(
      (n) =>
        n.nmineralizationid === selectedManure.nmineralizationid &&
        n.locationid === state.nmpFile.farmDetails.regionLocationId,
    )?.firstyearvalue;
    const valuePercent = valueDecimal ? valueDecimal * 100 : undefined;
    setDefaultOrganicN(valuePercent);
    // TODO: DON'T set this if the user just opened the editing modal (resets the saved value)
    if (valuePercent !== undefined) {
      setManureForm((prev) => ({ ...prev, nAvailable: valuePercent, nAvailableAdjusted: false }));
    }
  }, [state.nmpFile.farmDetails.regionLocationId, selectedManure, nmineralizations]);

  useEffect(() => {
    apiCache.callEndpoint('api/units/').then((response: { status?: any; data: Units[] }) => {
      if (response.status === 200) {
        const { data } = response;
        setManureUnits(
          data.map((unit) => ({
            value: unit,
            id: unit.id,
            label: unit.name,
          })),
        );
      }
    });

    apiCache.callEndpoint('api/manures/').then((response: { status?: any; data: Manure[] }) => {
      if (response.status === 200) {
        setManures(response.data);
      }
    });

    apiCache
      .callEndpoint('api/ammoniaretentions/')
      .then((response: { status?: any; data: any }) => {
        if (response.status === 200) {
          setAmmoniaRetentions(response.data);
        }
      });

    apiCache
      .callEndpoint('api/nmineralizations/')
      .then((response: { status?: any; data: NitrogenMineralization[] }) => {
        if (response.status === 200) {
          setNMineralizations(response.data);
        }
      });

    apiCache
      .callEndpoint('api/solidmaterialapplicationtonperacrerateconversions/')
      .then(
        (response: { status?: any; data: SolidMaterialApplicationTonPerAcreRateConversions[] }) => {
          if (response.status === 200) {
            setSolidConversions(response.data);
          }
        },
      );

    apiCache
      .callEndpoint('api/liquidmaterialapplicationusgallonsperacrerateconversions/')
      .then(
        (response: {
          status?: any;
          data: LiquidMaterialApplicationUsGallonsPerAcreRateConversions[];
        }) => {
          if (response.status === 200) {
            setLiquidConversions(response.data);
          }
        },
      );
  }, [apiCache]);

  const handleModalClose = () => {
    setStillReqTable(EMPTY_CROP_NUTRIENTS);
    onCancel();
  };

  const handleSubmit = () => {
    setFields((prevFields) => {
      const newFields = [...prevFields];
      const newField = newFields[fieldIndex];
      if (rowEditIndex !== undefined) {
        // Replace manure at index
        const newManures = [...newField.manures];
        newManures[rowEditIndex] = { ...manureForm };
        newField.manures = newManures;
      } else {
        // Append to end of list
        newField.manures = [...newField.manures, { ...manureForm }];
      }
      return newFields;
    });

    handleModalClose();
  };

  const handleCalculate = async () => {
    if (!selectedNutrientAnalysis) {
      console.error('No nutrient analysis available for calculation.');
      return;
    }
    const nutrientInputs = await getNutrientInputs(
      selectedNutrientAnalysis,
      state.nmpFile.farmDetails.farmRegion,
      manureForm.applicationRate,
      manureUnits.find((opt) => opt.id === manureForm.applUnitId)!.value,
      manureForm.nh4Retention,
      manureForm.nAvailable,
    );
    const updatedForm = {
      ...manureForm,
      reqN: nutrientInputs.N_FirstYear,
      reqP2o5: nutrientInputs.P2O5_FirstYear,
      reqK2o: nutrientInputs.K2O_FirstYear,
      remN: nutrientInputs.N_LongTerm,
      remP2o5: nutrientInputs.P2O5_LongTerm,
      remK2o: nutrientInputs.K2O_LongTerm,
    };

    setManureForm(updatedForm);
    // Store the pending application for material remaining display
    setPendingApplication(updatedForm);
    // TODO: Calculate the balance column correctly!
    setStillReqTable({
      N: field.crops[0].reqN + (field.crops[1]?.reqN || 0),
      P2O5: field.crops[0].reqP2o5 + (field.crops[1]?.reqP2o5 || 0),
      K2O: field.crops[0].reqK2o + (field.crops[1]?.reqK2o || 0),
    });
    setIsCalculationCurrent(true);
  };

  const handleChanges = (changes: Partial<NMPFileAppliedManure>) => {
    setIsCalculationCurrent(false);
    setPendingApplication(null); // Clear pending application when form changes
    setManureForm((prev) => ({ ...prev, ...changes }));
  };

  return (
    <Modal
      title="Add Manure"
      onOpenChange={handleModalClose}
      {...props}
    >
      {manuresWithNutrients.length > 0 ? (
        <Form
          onCancel={handleModalClose}
          onCalculate={handleCalculate}
          onConfirm={handleSubmit}
          isConfirmDisabled={!isCalculationCurrent}
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
                selectedKey={manureForm.manureId}
                items={manuresWithNutrients.map((ele: NMPFileNutrientAnalysis) => ({
                  id: ele.manureId,
                  label: ele.manureName,
                }))}
                onSelectionChange={(e) => {
                  const manureWNutrients = manuresWithNutrients.find((m) => m.manureId === e)!;
                  handleChanges({
                    manureId: e as number,
                    manureName: manureWNutrients.manureName,
                    name: manureWNutrients.manureName,
                    solidLiquid: manureWNutrients.solidLiquid,
                    sourceUuid: manureWNutrients.sourceUuid,
                  });
                }}
              />
            </Grid>
            <Grid size={formGridBreakpoints}>
              <Select
                isRequired
                label="Application Season/Method"
                placeholder="Select an application method"
                selectedKey={manureForm.applicationId}
                items={filteredApplicationMethods}
                onSelectionChange={(e) => handleChanges({ applicationId: e as number })}
              />
            </Grid>
            <Grid size={formGridBreakpoints}>
              <NumberField
                isRequired
                label="Application Rate"
                value={manureForm.applicationRate}
                onChange={(e) => handleChanges({ applicationRate: e })}
              />
            </Grid>
            <Grid size={formGridBreakpoints}>
              <Select
                isRequired
                label="Units"
                placeholder="Select a unit"
                selectedKey={manureForm.applUnitId}
                items={filteredManureUnits}
                onSelectionChange={(e) => handleChanges({ applUnitId: e as number })}
                autoselectFirst
                noSort
              />
            </Grid>
            <Grid size={formGridBreakpoints}>
              <NumberField
                label="Ammonium-N Retention (%)"
                value={manureForm.nh4Retention}
                onChange={(e) =>
                  handleChanges({ nh4Retention: e, nh4RetentionAdjusted: e !== defaultAmmonia })
                }
                maxValue={100}
                iconRight={
                  defaultAmmonia !== undefined && manureForm.nh4Retention !== defaultAmmonia ? (
                    <button
                      type="button"
                      css={{ backgroundColor: '#ffa500' }}
                      onClick={() =>
                        handleChanges({ nh4Retention: defaultAmmonia, nh4RetentionAdjusted: false })
                      }
                    >
                      <LoopIcon />
                    </button>
                  ) : undefined
                }
              />
            </Grid>
            <Grid size={formGridBreakpoints}>
              <NumberField
                label="Organic N Available (%)"
                value={manureForm.nAvailable}
                onChange={(e) =>
                  handleChanges({ nAvailable: e, nAvailableAdjusted: e !== defaultOrganicN })
                }
                maxValue={100}
                iconRight={
                  defaultOrganicN !== undefined && manureForm.nAvailable !== defaultOrganicN ? (
                    <button
                      type="button"
                      css={{ backgroundColor: '#ffa500' }}
                      onClick={() =>
                        handleChanges({ nAvailable: defaultOrganicN, nAvailableAdjusted: false })
                      }
                    >
                      <LoopIcon />
                    </button>
                  ) : undefined
                }
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

            {/* Material Remaining Information */}
            {hasMaterialRemainingData && manureForm.sourceUuid && (
              <Grid size={12}>
                <MaterialRemainingDisplay
                  materialRemainingData={materialRemainingData!}
                  selectedSourceUuid={manureForm.sourceUuid}
                />
              </Grid>
            )}
          </Grid>
        </Form>
      ) : (
        <div style={{ color: 'red' }}>
          <div style={{ padding: '1rem' }}>
            Warning, no manure or compose sources have been added this farm with assigned nutrient
            analyses.
          </div>
          <div style={{ padding: '1rem' }}>
            Return to the manure section and add either animals or an imported manure, then assign a
            nutrient analysis to the manures before adding manure applications to a field.
          </div>
          <ButtonGroup
            alignment="end"
            orientation="horizontal"
          >
            <Button
              variant="secondary"
              onPress={handleModalClose}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              onPress={() => {
                navigateAway(MANURE_IMPORTS);
              }}
            >
              Return to manure
            </Button>
          </ButtonGroup>
        </div>
      )}
    </Modal>
  );
}
