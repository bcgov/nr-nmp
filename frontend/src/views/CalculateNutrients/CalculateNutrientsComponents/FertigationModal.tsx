/**
 * @summary The field table on the calculate nutrients page
 */
import React, { useContext, useEffect, useMemo, useState } from 'react';
import Grid from '@mui/material/Grid';
import { Select, Form, NumberField } from '@/components/common';
import Modal, { ModalProps } from '@/components/common/Modal/Modal';
import type {
  DensityUnit,
  Fertilizer,
  FertilizerType,
  FertilizerUnit,
  NMPFileFieldData,
  Schedule,
  SelectOption,
} from '@/types';
import { formGridBreakpoints } from '@/common.styles';
import { NMPFileFertigation } from '@/types/calculateNutrients';
import { APICacheContext } from '@/context/APICacheContext';
import {
  DRY_CUSTOM_ID,
  EMPTY_CUSTOM_FERTILIZER,
  INJECTION_RATE_UNITS,
  LIQUID_CUSTOM_ID,
  SCHEDULE_OPTIONS,
} from '@/constants';

type FertigationModalProps = {
  fieldIndex: number;
  initialModalData?: NMPFileFertigation;
  rowEditIndex?: number;
  field: NMPFileFieldData;
  setFields: React.Dispatch<React.SetStateAction<NMPFileFieldData[]>>;
  onClose: () => void;
};

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
  applicationRate: undefined,
  applUnitId: undefined,
  density: undefined,
  densityUnitId: undefined,
  tankVolume: 0,
  solubility: 0,
  amountToDissolve: 0,
  injectionRate: 0,
  eventsPerSeason: 0,
  applicationPeriod: 0,
  schedule: undefined,
};

export default function FertigationModal({
  initialModalData,
  onClose,
  ...props
}: FertigationModalProps & Omit<ModalProps, 'title' | 'children' | 'onOpenChange'>) {
  const [fertilizerTypes, setFertilizerTypes] = useState<SelectOption<FertilizerType>[]>([]);
  const [fertilizers, setFertilizers] = useState<SelectOption<Fertilizer>[]>([]);
  const [filteredFertilizers, setFilteredFertilizers] = useState<SelectOption<Fertilizer>[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [dryUnits, setDryUnits] = useState<SelectOption<FertilizerUnit>[]>([]);
  const [liquidUnits, setLiquidUnits] = useState<SelectOption<FertilizerUnit>[]>([]);
  const [densityUnits, setDensityUnits] = useState<SelectOption<DensityUnit>[]>([]);
  const [formData, setFormData] = useState<NMPFileFertigation>(
    initialModalData || EMPTY_FERTIGATION_FORM_DATA,
  );
  const [formCustomFertilizer, setFormCustomFertilizer] =
    useState<Fertilizer>(EMPTY_CUSTOM_FERTILIZER);
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
        const dryUnitz: SelectOption<FertilizerUnit>[] = [];
        const liquidUnitz: SelectOption<FertilizerUnit>[] = [];
        unitOptions.forEach((u) =>
          u.value.dryliquid === 'dry' ? dryUnitz.push(u) : liquidUnitz.push(u),
        );
        setDryUnits(dryUnitz);
        setLiquidUnits(liquidUnitz);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = () => {
    onClose();
  };

  const handleModalCalculate = () => {
    console.log('Hello!');
  };

  const handleInputChanges = (updates: Partial<NMPFileFertigation>) => {
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
            setFormCustomFertilizer((pr) => {
              // Reset if we're switching type
              if (formData.fertilizerTypeId !== value) {
                return {
                  ...EMPTY_CUSTOM_FERTILIZER,
                  dryliquid: value === DRY_CUSTOM_ID ? 'dry' : 'liquid',
                };
              }
              return {
                ...pr,
                dryliquid: value === DRY_CUSTOM_ID ? 'dry' : 'liquid',
              };
            });
          } else {
            // Reset for other values
            setFormCustomFertilizer(EMPTY_CUSTOM_FERTILIZER);
          }

          // Reset values on changes
          next = { ...EMPTY_FERTIGATION_FORM_DATA };
        }

        if (name === 'fertilizerId') {
          next.name = filteredFertilizers.find((f) => f.id === value)!.label;
        }
      });

      // Apply the updates
      return { ...next, ...updates };
    });
  };

  const handleCustomChanges = (name: keyof Fertilizer, value: number) => {
    setFormCustomFertilizer((prev) => ({ ...prev, [name]: value }));
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
        // isConfirmDisabled={!calculatedData}
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
                    onChange={(e) => handleCustomChanges('nitrogen', e)}
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
                    onChange={(e) => handleCustomChanges('phosphorous', e)}
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
                    onChange={(e) => handleCustomChanges('potassium', e)}
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
                  minValue={0}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Select
                  isRequired
                  items={liquidUnits}
                  label="Units"
                  placeholder="Select Units"
                  selectedKey={formData.applUnitId}
                  onSelectionChange={(e) => handleInputChanges({ applUnitId: e as number })}
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
                  minValue={0}
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
              value={formData.applicationRate}
              onChange={(e) => handleInputChanges({ applicationRate: e })}
              minValue={0}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Select
              isRequired
              items={INJECTION_RATE_UNITS}
              label="Units"
              placeholder="Select Units"
              selectedKey={formData.applUnitId}
              onSelectionChange={(e) => handleInputChanges({ applUnitId: e as number })}
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
              minValue={0}
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
          </Grid>
        </Grid>
      </Form>
    </Modal>
  );
}
