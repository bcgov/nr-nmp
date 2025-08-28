/**
 * @summary The field table on the calculate nutrients page
 */
import { useContext, useEffect, useState, Dispatch, SetStateAction, useMemo } from 'react';
import Grid from '@mui/material/Grid';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import LoopIcon from '@mui/icons-material/Loop';
import { APICacheContext } from '@/context/APICacheContext';
import { customTableStyle, formGridBreakpoints } from '@/common.styles';
import { Form, NumberField, Select } from '@/components/common';
import Modal, { ModalProps } from '@/components/common/Modal/Modal';
// Data not seeded in DB.
import SEASON_APPLICATION from '../unseededData';
import { DEFAULT_NMPFILE_APPLIED_MANURE, EMPTY_CROP_NUTRIENTS } from '@/constants';

import {
  CropNutrients,
  NMPFileFieldData,
  NMPFileNutrientAnalysis,
  NMPFileAppliedManure,
  SelectOption,
  Units,
  ManureType,
  Manure,
  AmmoniaRetention,
  NitrogenMineralization,
} from '@/types';
import { getNutrientInputs } from '@/calculations/ManureAndCompost/ManureAndImports/Calculations';
import useAppState from '@/hooks/useAppState';

type AddManureModalProps = {
  fieldIndex: number;
  initialModalData?: NMPFileAppliedManure;
  rowEditIndex?: number;
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

export default function ManureModal({
  fieldIndex,
  initialModalData,
  rowEditIndex,
  onCancel,
  field,
  setFields,
  ...props
}: AddManureModalProps & Omit<ModalProps, 'title' | 'children' | 'onOpenChange'>) {
  const { state } = useAppState();
  const manuresWithNutrients = state.nmpFile.years[0].NutrientAnalyses;

  const apiCache = useContext(APICacheContext);
  const [manureForm, setManureForm] = useState<NMPFileAppliedManure>(
    initialModalData || DEFAULT_NMPFILE_APPLIED_MANURE,
  );
  const selectedNutrientAnalysis = useMemo(
    () => manuresWithNutrients.find((m) => m.sourceUuid === manureForm.sourceUuid),
    [manuresWithNutrients, manureForm.sourceUuid],
  );
  /*
  const [materialRemaining, setMaterialRemaining] = useState<number | undefined>(
    selectedNutrientAnalysis ? selectedNutrientAnalysis.materialRemaining : undefined,
  );
  useEffect(() => {
    if (selectedNutrientAnalysis) {
      setMaterialRemaining(selectedNutrientAnalysis.materialRemaining);
    }
  }, [selectedNutrientAnalysis]);
  */

  const [manureUnits, setManureUnits] = useState<SelectOption<Units>[]>([]);
  const [manures, setManures] = useState<Manure[]>([]);
  const selectedManure = useMemo(
    () => manures.find((m) => m.id === manureForm.manureId),
    [manures, manureForm.manureId],
  );

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

  const [availableThisYearTable, setAvailableThisYearTable] =
    useState<CropNutrients>(EMPTY_CROP_NUTRIENTS);
  const [availableLongTermTable, setAvailableLongTermTable] =
    useState<CropNutrients>(EMPTY_CROP_NUTRIENTS);
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
    if (valuePercent !== undefined) {
      setManureForm((prev) => ({ ...prev, nh4Retention: valuePercent }));
    }
  }, [selectedManure, ammoniaRetentions, manureForm.applicationId]);

  useEffect(() => {
    if (!selectedManure) return;
    const valueDecimal = nmineralizations.find(
      (n) =>
        n.nmineralizationid === selectedManure.nmineralizationid &&
        n.locationid === state.nmpFile.farmDetails.RegionLocationId,
    )?.firstyearvalue;
    const valuePercent = valueDecimal ? valueDecimal * 100 : undefined;
    setDefaultOrganicN(valuePercent);
    if (valuePercent !== undefined) {
      setManureForm((prev) => ({ ...prev, nAvailable: valuePercent }));
    }
  }, [state.nmpFile.farmDetails.RegionLocationId, selectedManure, nmineralizations]);

  useEffect(() => {
    apiCache.callEndpoint('api/units/').then((response: { status?: any; data: any }) => {
      if (response.status === 200) {
        const { data } = response;
        setManureUnits(
          (data as Units[]).map((unit) => ({
            value: unit,
            id: unit.id,
            label: unit.name,
          })),
        );
      }
    });

    apiCache.callEndpoint('api/manures/').then((response: { status?: any; data: any }) => {
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

    apiCache.callEndpoint('api/nmineralizations/').then((response: { status?: any; data: any }) => {
      if (response.status === 200) {
        setNMineralizations(response.data);
      }
    });
  }, [apiCache]);

  const handleModalClose = () => {
    setAvailableThisYearTable(EMPTY_CROP_NUTRIENTS);
    setAvailableLongTermTable(EMPTY_CROP_NUTRIENTS);
    setStillReqTable(EMPTY_CROP_NUTRIENTS);
    onCancel();
  };

  const handleSubmit = () => {
    setFields((prevFields) => {
      const newFields = [...prevFields];
      const newField = newFields[fieldIndex];
      if (rowEditIndex !== undefined) {
        // Replace manure at index
        const newManures = [...newField.Manures];
        newManures[rowEditIndex] = { ...manureForm };
        newField.Manures = newManures;
      } else {
        // Append to end of list
        newField.Manures = [...newField.Manures, { ...manureForm }];
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
      state.nmpFile.farmDetails.FarmRegion,
      manureForm.applicationRate,
      manureUnits.find((opt) => opt.id === manureForm.applUnitId)!.value,
      manureForm.nh4Retention,
      manureForm.nAvailable,
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
      N: field.Crops[0].reqN + (field.Crops[1]?.reqN || 0),
      P2O5: field.Crops[0].reqP2o5 + (field.Crops[1]?.reqP2o5 || 0),
      K2O: field.Crops[0].reqK2o + (field.Crops[1]?.reqK2o || 0),
    });
  };

  const handleChanges = (changes: Partial<NMPFileAppliedManure>) => {
    setManureForm((prev) => ({ ...prev, ...changes }));
  };

  return (
    <Modal
      title="Add Manure"
      onOpenChange={handleModalClose}
      {...props}
    >
      <Form
        onCancel={handleModalClose}
        onCalculate={handleCalculate}
        onConfirm={handleSubmit}
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
              items={manureUnits}
              onSelectionChange={(e) => handleChanges({ applUnitId: e as number })}
              autoselectFirst
            />
          </Grid>
          <Grid size={formGridBreakpoints}>
            <NumberField
              label="Ammonium-N Retention (%)"
              value={manureForm.nh4Retention}
              onChange={(e) => handleChanges({ nh4Retention: e })}
              maxValue={100}
              iconRight={
                defaultAmmonia !== undefined && manureForm.nh4Retention !== defaultAmmonia ? (
                  <button
                    type="button"
                    css={{ backgroundColor: '#ffa500' }}
                    onClick={() => handleChanges({ nh4Retention: defaultAmmonia })}
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
              onChange={(e) => handleChanges({ nAvailable: e })}
              maxValue={100}
              iconRight={
                defaultOrganicN !== undefined && manureForm.nAvailable !== defaultOrganicN ? (
                  <button
                    type="button"
                    css={{ backgroundColor: '#ffa500' }}
                    onClick={() => handleChanges({ nAvailable: defaultOrganicN })}
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
        </Grid>
      </Form>
    </Modal>
  );
}
