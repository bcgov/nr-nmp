/**
 * @summary This is the Add Animal list Tab
 */
import { useContext, useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import { Checkbox } from '@bcgov/design-system-react-components';
import { ModalProps } from '@/components/common/Modal/Modal';
import {
  Manure,
  SelectOption,
  NMPFileNutrientAnalysisData,
  NMPFileManureStorageSystem,
} from '@/types';
import { formGridBreakpoints } from '@/common.styles';
import { Form, Select, Modal, TextField, NumberField } from '@/components/common';
import { APICacheContext } from '@/context/APICacheContext';
import NMPFileImportedManureData from '@/types/NMPFileImportedManureData';
import NMPFileGeneratedManureData from '@/types/NMPFileGeneratedManureData';

type NutrientAnalysisModalProps = {
  initialModalData?: NMPFileNutrientAnalysisData;
  manures: (NMPFileImportedManureData | NMPFileGeneratedManureData)[];
  storageSystems: NMPFileManureStorageSystem[];
  handleSubmit: (data: NMPFileNutrientAnalysisData) => void;
  onCancel: () => void;
};

const EMPTY_NUTRIENT_ANALYSIS: NMPFileNutrientAnalysisData = {
  materialSource: '',
  Moisture: '',
  N: 0,
  NH4N: 0,
  P2O5: 0,
  K2O: 0,
  ManureId: 0,
  SolidLiquid: '',
  linkedUuid: '',
  materialType: '',
  bookLab: '',
  UniqueMaterialName: '',
};

export default function NutrientAnalysisModal({
  initialModalData,
  handleSubmit,
  manures,
  storageSystems,
  onCancel,
  ...props
}: NutrientAnalysisModalProps & Omit<ModalProps, 'title' | 'children' | 'onOpenChange'>) {
  const [formData, setFormData] = useState<NMPFileNutrientAnalysisData>(
    initialModalData || EMPTY_NUTRIENT_ANALYSIS,
  );
  const apiCache = useContext(APICacheContext);

  const [manureOptions, setManureOptions] = useState<SelectOption<Manure>[]>([]);
  const storageOptions: SelectOption<NMPFileManureStorageSystem>[] = storageSystems?.map(
    (storageEle) => ({
      id: storageEle.uuid,
      label: storageEle.name,
      value: storageEle,
    }),
  );

  useEffect(() => {
    apiCache.callEndpoint('api/manures/').then((response: { status?: any; data: any }) => {
      if (response.status === 200) {
        const { data } = response;
        setManureOptions(
          (data as Manure[]).map((ele) => ({ id: ele.name, label: ele.name, value: ele })),
        );
      }
    });
  }, [apiCache]);

  function setValue<K extends keyof NMPFileNutrientAnalysisData>(
    nutrients: NMPFileNutrientAnalysisData,
    key: K,
    value: NMPFileNutrientAnalysisData[K],
  ): NMPFileNutrientAnalysisData {
    const newNutrients = nutrients;
    newNutrients[key] = value;
    return newNutrients;
  }

  const materialSourceOptions = () => {
    if (storageOptions?.length) {
      return storageOptions;
    }
    return manures.map((ele: NMPFileImportedManureData | NMPFileGeneratedManureData) => ({
      id: ele.UniqueMaterialName,
      label: ele.UniqueMaterialName,
    }));
  };

  const handleInputChanges = (changes: Partial<NMPFileNutrientAnalysisData>) => {
    setFormData((prev: NMPFileNutrientAnalysisData): NMPFileNutrientAnalysisData => {
      let next: NMPFileNutrientAnalysisData = { ...prev };
      Object.entries(changes).forEach(([name, value]) => {
        if (name === 'materialSource') {
          next = {
            ...EMPTY_NUTRIENT_ANALYSIS,
            bookLab: '',
            ...changes,
          };
        }
        if (name === 'materialType') {
          const updatedUniqueMaterialName =
            next.UniqueMaterialName === '' ||
            next.UniqueMaterialName !== `Custom - ${next.materialType}`
              ? `Custom - ${value}`
              : next.UniqueMaterialName;
          const selectedManure = manureOptions.find((manure) => manure.value.name === value)?.value;
          if (!selectedManure) {
            throw new Error(`Manure type "${value}" not found.`);
          }
          next.Moisture = selectedManure.moisture;
          next.N = selectedManure.nitrogen;
          next.NH4N = selectedManure.ammonia;
          next.P2O5 = selectedManure.phosphorous;
          next.K2O = selectedManure.potassium;
          next.ManureId = selectedManure.id;
          next.materialType = value ? value.toString() : '';
          next.UniqueMaterialName = updatedUniqueMaterialName;
        }

        // reset nutrient values when book value is selected
        if (name === 'bookLab' && next.bookLab !== value) {
          const selectedManure = manureOptions.find(
            (manure) => manure.value.name === next.materialType,
          )?.value;
          if (!selectedManure) {
            throw new Error(`Manure type "${value}" not found.`);
          }
          next.bookLab = value ? value.toString() : '';
          next.ManureId = selectedManure.id;
          next.Moisture = selectedManure.moisture;
          next.N = selectedManure.nitrogen;
          next.NH4N = selectedManure.ammonia;
          next.P2O5 = selectedManure.phosphorous;
          next.K2O = selectedManure.potassium;
          next.SolidLiquid = selectedManure.solidliquid;
        }

        // update nutrients if changed
        if (name in ['Moisture', 'N', 'NH4N', 'P2O5', 'K2O', 'SolidLiquid']) {
          // Necessary to bypass TS issue
          next = setValue(next, name as keyof NMPFileNutrientAnalysisData, value);
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
        onConfirm={() => handleSubmit(formData)}
        onCancel={onCancel}
      >
        <Grid
          container
          spacing={2}
        >
          <Grid size={formGridBreakpoints}>
            <Select
              isRequired
              items={materialSourceOptions()}
              label="Source of Material"
              placeholder="Select Source of Material"
              selectedKey={formData.materialSource}
              onSelectionChange={(e) => handleInputChanges({ materialSource: e as string })}
            />
          </Grid>
          <Grid size={formGridBreakpoints}>
            <Select
              isRequired
              items={manureOptions}
              label="Material Type"
              placeholder="Select Material Type"
              selectedKey={formData.materialType}
              onSelectionChange={(e) => {
                const opt = manureOptions.find((r) => r.id === e)!;
                handleInputChanges({
                  materialType: e as string,
                  bookLab: 'book',
                  nMineralizationId: opt.value.nmineralizationid,
                });
              }}
              noSort
            />
          </Grid>
          <Grid size={formGridBreakpoints}>
            <Checkbox
              isRequired={!formData.bookLab}
              isDisabled={!(formData.materialSource && formData.materialType)}
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
              isDisabled={!(formData.materialSource && formData.materialType)}
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
              value={formData.UniqueMaterialName}
              onChange={(e: string) => handleInputChanges({ UniqueMaterialName: e })}
              maxLength={100}
            />
          </Grid>
          <Grid size={{ xs: 4 }}>
            {formData.bookLab === 'lab' ? (
              <NumberField
                isRequired
                label="Moisture (%)"
                value={Number.isNaN(formData.Moisture) ? undefined : Number(formData.Moisture)}
                onChange={(e) => handleInputChanges({ Moisture: String(e) })}
                minValue={0}
                maxValue={100}
              />
            ) : (
              <TextField
                isDisabled
                label="Moisture (%)"
                value={formData.Moisture}
              />
            )}
          </Grid>
          <Grid size={{ xs: 4 }}>
            <NumberField
              isDisabled={formData.bookLab !== 'lab'}
              isRequired={formData.bookLab === 'lab'}
              label="N"
              value={formData.N}
              onChange={(e) => handleInputChanges({ N: e })}
              minValue={0}
            />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <NumberField
              isDisabled={formData.bookLab !== 'lab'}
              isRequired={formData.bookLab === 'lab'}
              label="NH4-N (%)"
              value={formData.NH4N}
              onChange={(e) => handleInputChanges({ NH4N: e })}
              minValue={0}
              maxValue={100}
            />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <NumberField
              isDisabled={formData.bookLab !== 'lab'}
              isRequired={formData.bookLab === 'lab'}
              label="P (%)"
              value={formData.P2O5}
              onChange={(e) => handleInputChanges({ P2O5: e })}
              minValue={0}
              maxValue={100}
            />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <NumberField
              isDisabled={formData.bookLab !== 'lab'}
              isRequired={formData.bookLab === 'lab'}
              label="K (%)"
              value={formData.K2O}
              onChange={(e) => handleInputChanges({ K2O: e })}
              minValue={0}
              maxValue={100}
            />
          </Grid>
        </Grid>
      </Form>
    </Modal>
  );
}
