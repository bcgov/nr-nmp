/**
 * @summary This is the Add Animal list Tab
 */
import { useContext, useEffect, useMemo, useState } from 'react';
import Grid from '@mui/material/Grid';
import { Checkbox } from '@bcgov/design-system-react-components';
import { ModalProps } from '@/components/common/Modal/Modal';
import {
  Manure,
  SelectOption,
  NMPFileNutrientAnalysis,
  NMPFileManureStorageSystem,
  ManureType,
  NMPFileManure,
} from '@/types';
import { formGridBreakpoints, ModalInstructions } from '@/common.styles';
import { Form, Select, Modal, TextField, NumberField } from '@/components/common';
import { APICacheContext } from '@/context/APICacheContext';
import { getStandardizedAnnualManureAmount } from '@/utils/utils';

type NutrientAnalysisModalProps = {
  initialModalData?: NMPFileNutrientAnalysis;
  manures: NMPFileManure[];
  storageSystems: NMPFileManureStorageSystem[];
  // Passed in to filter manures and storageSystems
  currentNutrientAnalyses: NMPFileNutrientAnalysis[];
  handleSubmit: (data: NMPFileNutrientAnalysis) => void;
  onCancel: () => void;
};

const EMPTY_NUTRIENT_ANALYSIS: NMPFileNutrientAnalysis = {
  sourceUuid: '',
  sourceName: '',
  moisture: '',
  N: 0,
  NH4N: 0,
  P: 0,
  K: 0,
  solidLiquid: '',
  manureId: 0,
  manureName: '',
  bookLab: '',
  uniqueMaterialName: '',
  annualAmount: 0,
  // materialRemaining: 100, // 100%
};

export default function NutrientAnalysisModal({
  initialModalData,
  handleSubmit,
  manures,
  storageSystems,
  currentNutrientAnalyses,
  onCancel,
  ...props
}: NutrientAnalysisModalProps & Omit<ModalProps, 'title' | 'children' | 'onOpenChange'>) {
  const [formData, setFormData] = useState<NMPFileNutrientAnalysis>(
    initialModalData || EMPTY_NUTRIENT_ANALYSIS,
  );
  const apiCache = useContext(APICacheContext);

  const [manureOptions, setManureOptions] = useState<SelectOption<Manure>[]>([]);
  const filteredManureOptions = useMemo(() => {
    if (manureOptions.length === 0 || !formData.solidLiquid) return [];
    return manureOptions.filter((m) => m.value.solidliquid === formData.solidLiquid);
  }, [manureOptions, formData.solidLiquid]);
  const sourceUuidOptions = [
    ...storageSystems
      .filter(
        (ele) =>
          // Don't filter out an id that's currently being edited
          (initialModalData && ele.uuid === initialModalData.sourceUuid) ||
          // Filter out ids that already have a nutrient analysis
          !currentNutrientAnalyses.some((n) => n.sourceUuid === ele.uuid),
      )
      .map((storageEle) => ({
        id: storageEle.uuid,
        label: storageEle.name,
        value: storageEle,
      })),

    ...manures
      .filter(
        (ele) =>
          !ele.assignedToStoredSystem &&
          // Don't filter out an id that's currently being edited
          ((initialModalData && ele.uuid === initialModalData.sourceUuid) ||
            // Filter out ids that already have a nutrient analysis
            !currentNutrientAnalyses.some((n) => n.sourceUuid === ele.uuid)),
      )
      .map((ele: NMPFileManure) => ({
        id: ele.uuid,
        label: ele.uniqueMaterialName,
        value: ele,
      })),
  ];

  useEffect(() => {
    apiCache.callEndpoint('api/manures/').then((response: { status?: any; data: Manure[] }) => {
      if (response.status === 200) {
        const { data } = response;
        setManureOptions(data.map((ele) => ({ id: ele.name, label: ele.name, value: ele })));
      }
    });
  }, [apiCache]);

  const handleInputChanges = (changes: Partial<NMPFileNutrientAnalysis>) => {
    setFormData((prev: NMPFileNutrientAnalysis): NMPFileNutrientAnalysis => {
      let next = { ...prev };
      Object.entries(changes).forEach(([name, value]) => {
        if (name === 'sourceName') {
          next = {
            ...EMPTY_NUTRIENT_ANALYSIS,
            bookLab: '',
            ...changes,
          };
        }
        if (name === 'manureName') {
          const updatedUniqueMaterialName =
            next.uniqueMaterialName === '' ||
            next.uniqueMaterialName !== `Custom - ${next.manureName}`
              ? `Custom - ${value}`
              : next.uniqueMaterialName;
          const selectedManure = manureOptions.find((manure) => manure.value.name === value)?.value;
          if (!selectedManure) {
            throw new Error(`Manure type "${value}" not found.`);
          }
          next.moisture = selectedManure.moisture;
          next.N = selectedManure.nitrogen;
          next.NH4N = selectedManure.ammonia;
          next.P = selectedManure.phosphorous;
          next.K = selectedManure.potassium;
          next.manureId = selectedManure.id;
          next.manureName = value ? value.toString() : '';
          next.uniqueMaterialName = updatedUniqueMaterialName;
        }

        // reset nutrient values when book value is selected
        if (name === 'bookLab' && next.bookLab !== value) {
          const selectedManure = manureOptions.find(
            (manure) => manure.value.name === next.manureName,
          )?.value;
          if (!selectedManure) {
            throw new Error(`Manure type "${value}" not found.`);
          }
          next.bookLab = value ? value.toString() : '';
          next.moisture = selectedManure.moisture;
          next.N = selectedManure.nitrogen;
          next.NH4N = selectedManure.ammonia;
          next.P = selectedManure.phosphorous;
          next.K = selectedManure.potassium;
        }
      });

      return { ...next, ...changes };
    });
  };

  return (
    <Modal
      title="Nutrient Analysis"
      onOpenChange={onCancel}
      {...props}
    >
      <Form
        onConfirm={() => {
          handleSubmit(formData);
        }}
        onCancel={onCancel}
      >
        <ModalInstructions>
          Enter all values for materials on an “as-received” basis.
        </ModalInstructions>
        <Grid
          container
          spacing={2}
        >
          <Grid size={formGridBreakpoints}>
            <Select
              isRequired
              items={sourceUuidOptions}
              label="Source of Material"
              placeholder="Select Source of Material"
              value={formData.sourceUuid}
              onChange={(e) => {
                const selectedSource = sourceUuidOptions.find((ele) => ele.id === e);
                if (!selectedSource) {
                  throw new Error(`Source manure or storage "${e}" not found.`);
                }
                handleInputChanges({
                  sourceName: selectedSource.label,
                  sourceUuid: e as string,
                  solidLiquid: ManureType[selectedSource.value.manureType!] as any, // type shenanigans
                  // TODO: Add this calculation to reducer updates
                  annualAmount: getStandardizedAnnualManureAmount(selectedSource.value),
                });
              }}
            />
          </Grid>
          <Grid size={formGridBreakpoints}>
            <Select
              isRequired
              items={filteredManureOptions}
              label="Material Type"
              placeholder="Select Material Type"
              value={formData.manureName}
              onChange={(e) => {
                const opt = manureOptions.find((r) => r.id === e)!;
                handleInputChanges({
                  manureName: e as string,
                  bookLab:
                    (e as string) === '(Other, solid)' || (e as string) === '(Other, liquid)'
                      ? 'lab'
                      : 'book',
                  nMineralizationId: opt.value.nmineralizationid,
                });
              }}
              noSort
            />
          </Grid>
          <Grid size={formGridBreakpoints}>
            <Checkbox
              isRequired={!formData.bookLab}
              isDisabled={
                !(formData.sourceUuid && formData.manureId) ||
                formData.manureName === '(Other, solid)' ||
                formData.manureName === '(Other, liquid)'
              }
              value="book"
              isSelected={formData.bookLab === 'book'}
              onChange={(s: boolean) => handleInputChanges({ bookLab: s ? 'book' : '' })}
            >
              Book Value
            </Checkbox>
          </Grid>
          <Grid size={formGridBreakpoints}>
            <Checkbox
              isRequired={!formData.bookLab}
              isDisabled={!(formData.sourceUuid && formData.manureId)}
              value="lab"
              isSelected={formData.bookLab === 'lab'}
              onChange={(s: boolean) => handleInputChanges({ bookLab: s ? 'lab' : '' })}
            >
              Lab Value
            </Checkbox>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              isDisabled={formData.bookLab !== 'lab'}
              isRequired={formData.bookLab === 'lab'}
              label="Material name"
              value={formData.uniqueMaterialName}
              onChange={(e: string) => handleInputChanges({ uniqueMaterialName: e })}
              maxLength={100}
            />
          </Grid>
          <Grid size={{ xs: 4 }}>
            {formData.bookLab === 'lab' ? (
              <NumberField
                isRequired
                label="Moisture (%)"
                value={Number.isNaN(formData.moisture) ? undefined : Number(formData.moisture)}
                onChange={(e) => handleInputChanges({ moisture: String(e) })}
                step={0.1}
                maxValue={100}
              />
            ) : (
              <TextField
                isDisabled
                label="Moisture (%)"
                value={formData.moisture}
              />
            )}
          </Grid>
          <Grid size={{ xs: 4 }}>
            <NumberField
              isDisabled={formData.bookLab !== 'lab'}
              isRequired={formData.bookLab === 'lab'}
              label="N (%)"
              value={formData.N}
              onChange={(e) => handleInputChanges({ N: e })}
              maxValue={100}
            />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <NumberField
              isDisabled={formData.bookLab !== 'lab'}
              isRequired={formData.bookLab === 'lab'}
              label="NH₄-N (ppm)"
              value={formData.NH4N}
              onChange={(e) => handleInputChanges({ NH4N: e })}
            />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <NumberField
              isDisabled={formData.bookLab !== 'lab'}
              isRequired={formData.bookLab === 'lab'}
              label="P (%)"
              value={formData.P}
              onChange={(e) => handleInputChanges({ P: e })}
              maxValue={100}
            />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <NumberField
              isDisabled={formData.bookLab !== 'lab'}
              isRequired={formData.bookLab === 'lab'}
              label="K (%)"
              value={formData.K}
              onChange={(e) => handleInputChanges({ K: e })}
              maxValue={100}
            />
          </Grid>
        </Grid>
      </Form>
    </Modal>
  );
}
