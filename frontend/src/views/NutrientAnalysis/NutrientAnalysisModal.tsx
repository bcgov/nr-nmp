/**
 * @summary This is the Add Animal list Tab
 */
import { useContext, useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import { Checkbox } from '@bcgov/design-system-react-components';
import { ModalProps } from '@/components/common/Modal/Modal';
import { ManureNutrients, NMPFileFarmManureData, Manure, SelectOption } from '@/types';
import { formGridBreakpoints } from '@/common.styles';
import { Form, Select, Modal, TextField, NumberField } from '@/components/common';
import { APICacheContext } from '@/context/APICacheContext';
import NMPFileImportedManureData from '@/types/NMPFileImportedManureData';
import NMPFileGeneratedManureData from '@/types/NMPFileGeneratedManureData';

type NutrientAnalysisModalProps = {
  initialModalData?: NMPFileFarmManureData;
  manures: (NMPFileImportedManureData | NMPFileGeneratedManureData)[];
  handleSubmit: (data: NMPFileFarmManureData) => void;
  onCancel: () => void;
};

const EMPTY_MANURE_NUTRIENTS: ManureNutrients = {
  Moisture: '',
  N: 0,
  NH4N: 0,
  P2O5: 0,
  K2O: 0,
  ManureId: 0,
  SolidLiquid: '',
};

const EMPTY_MANURE_DATA: NMPFileFarmManureData = {
  materialSource: '',
  materialType: '',
  bookLab: '',
  UniqueMaterialName: '',
  Nutrients: EMPTY_MANURE_NUTRIENTS,
};

export default function NutrientAnalysisModal({
  initialModalData,
  handleSubmit,
  manures,
  onCancel,
  ...props
}: NutrientAnalysisModalProps & Omit<ModalProps, 'title' | 'children' | 'onOpenChange'>) {
  const [formData, setFormData] = useState<NMPFileFarmManureData>(
    initialModalData || EMPTY_MANURE_DATA,
  );
  const apiCache = useContext(APICacheContext);

  const [manureOptions, setManureOptions] = useState<SelectOption<Manure>[]>([]);

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

  const handleInputChanges = (
    changes: Partial<NMPFileFarmManureData> | Partial<ManureNutrients>,
  ) => {
    setFormData((prev: NMPFileFarmManureData): NMPFileFarmManureData => {
      let next = { ...prev };
      Object.entries(changes).forEach(([name, value]) => {
        if (name === 'materialSource') {
          next = {
            ...EMPTY_MANURE_DATA,
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

          const Nutrients: ManureNutrients = {
            Moisture: selectedManure.moisture,
            N: selectedManure.nitrogen,
            NH4N: selectedManure.ammonia,
            P2O5: selectedManure.phosphorous,
            K2O: selectedManure.potassium,
            ManureId: selectedManure.id,
            SolidLiquid: selectedManure.solidliquid || '',
          };
          next.materialType = value ? value.toString() : '';
          next.UniqueMaterialName = updatedUniqueMaterialName;
          next.Nutrients = Nutrients;
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
          next.Nutrients = {
            ManureId: selectedManure.id,
            Moisture: selectedManure.moisture,
            N: selectedManure.nitrogen,
            NH4N: selectedManure.ammonia,
            P2O5: selectedManure.phosphorous,
            K2O: selectedManure.potassium,
            SolidLiquid: selectedManure.solidliquid,
          };
        }

        // update nutrients if changed
        if (name in next.Nutrients) {
          next.Nutrients = {
            ...next.Nutrients,
            [name]: value,
          };
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
              items={manures.map((ele: NMPFileImportedManureData | NMPFileGeneratedManureData) => ({
                id: ele.UniqueMaterialName,
                label: ele.UniqueMaterialName,
              }))}
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
                value={
                  Number.isNaN(formData.Nutrients.Moisture)
                    ? undefined
                    : Number(formData.Nutrients.Moisture)
                }
                onChange={(e) => handleInputChanges({ Moisture: String(e) })}
                minValue={0}
                maxValue={100}
              />
            ) : (
              <TextField
                isDisabled
                label="Moisture (%)"
                value={formData.Nutrients.Moisture}
              />
            )}
          </Grid>
          <Grid size={{ xs: 4 }}>
            <NumberField
              isDisabled={formData.bookLab !== 'lab'}
              isRequired={formData.bookLab === 'lab'}
              label="N"
              value={formData.Nutrients.N}
              onChange={(e) => handleInputChanges({ N: e })}
              minValue={0}
            />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <NumberField
              isDisabled={formData.bookLab !== 'lab'}
              isRequired={formData.bookLab === 'lab'}
              label="NH4-N (%)"
              value={formData.Nutrients.NH4N}
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
              value={formData.Nutrients.P2O5}
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
              value={formData.Nutrients.K2O}
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
