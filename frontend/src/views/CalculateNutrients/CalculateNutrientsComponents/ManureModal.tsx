/**
 * @summary The field table on the calculate nutrients page
 */
import { useContext, useEffect, useState, Dispatch, SetStateAction, useMemo } from 'react';
import Grid from '@mui/material/Grid';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
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
  NMPFileFieldData,
  NMPFileNutrientAnalysis,
  NMPFileAppliedManure,
  SelectOption,
  Units,
  ManureType,
} from '@/types';
import { getNutrientInputs } from '@/calculations/ManureAndCompost/ManureAndImports/Calculations';
import useAppState from '@/hooks/useAppState';
import { MANURE_IMPORTS } from '@/constants/routes';

type AddManureModalProps = {
  fieldIndex: number;
  initialModalData?: NMPFileAppliedManure;
  manuresWithNutrients: NMPFileNutrientAnalysis[];
  rowEditIndex?: number;
  field: NMPFileFieldData;
  setFields: Dispatch<SetStateAction<NMPFileFieldData[]>>;
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

// TODO: Calculate Material Remaining. This is a fairly complex calculation because the user
// can select multiple kinds of units and the manure amount unit varies on if it's solid/liquid.
// For generated and imported manures, the number is stored in AnnualAmountUSGallonsVolume or
// AnnualAmountTonsWeight depending on type. For storage systems, the annual amount is calculated
// by summing up the manuresInSystem annual amounts. Note that these annual amount values are stored
// in separate arrays from the nutrient analysis

// TODO: Ingest ammonia retention table

export default function ManureModal({
  fieldIndex,
  initialModalData,
  manuresWithNutrients,
  rowEditIndex,
  onCancel,
  field,
  setFields,
  navigateAway,
  ...props
}: AddManureModalProps & Omit<ModalProps, 'title' | 'children' | 'onOpenChange'>) {
  const [manureForm, setManureForm] = useState<NMPFileAppliedManure>(
    initialModalData || DEFAULT_NMPFILE_APPLIED_MANURE,
  );
  const apiCache = useContext(APICacheContext);
  const { state } = useAppState();

  const [manureUnits, setManureUnits] = useState<SelectOption<Units>[]>([]);

  const filteredApplicationMethods = useMemo(() => {
    if (!manureForm.solidLiquid) return [];
    return SEASON_APPLICATION.filter(
      (a) =>
        a.ManureType === 3 ||
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

  // get fertilizer types, names, and conversion units
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
  }, [apiCache, manureForm.materialType]);

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
    const farmManure = state.nmpFile.years[0].NutrientAnalyses[0];
    if (!farmManure) {
      console.error('No farm manure data available for calculation.');
      return;
    }
    const nutrientInputs = await getNutrientInputs(
      farmManure,
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
      {manuresWithNutrients.length > 0 ? (
        <Form
          onCancel={handleModalClose}
          onCalculate={handleCalculate}
          onConfirm={handleSubmit}
        >
          <Grid size={formGridBreakpoints}>
            <Select
              isRequired
              label="Material Type"
              placeholder="Select a material type"
              selectedKey={manureForm.manureId}
              items={manuresWithNutrients.map((ele: NMPFileNutrientAnalysis) => ({
                id: ele.manureId,
                label: ele.materialType,
              }))}
              onSelectionChange={(e) => {
                const manureWNutrients = manuresWithNutrients.find((m) => m.manureId === e)!;
                handleChanges({
                  manureId: e as number,
                  materialType: manureWNutrients.materialType,
                  solidLiquid: manureWNutrients.solidLiquid,
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
            />
          </Grid>
          <Grid size={formGridBreakpoints}>
            <NumberField
              label="Organic N Available (%)"
              value={manureForm.nAvailable}
              onChange={(e) => handleChanges({ nAvailable: e })}
              maxValue={100}
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
