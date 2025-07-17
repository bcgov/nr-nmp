/**
 * @summary This is the Add Animal list Tab
 */
import { FormEvent, Key, useContext, useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import { Checkbox, Select, TextField } from '@bcgov/design-system-react-components';
import Modal, { ModalProps } from '@/components/common/Modal/Modal';
import { ManureNutrients, NMPFileFarmManureData, Manure } from '@/types';
import { formCss, formGridBreakpoints } from '@/common.styles';
import Form from '@/components/common/Form/Form';
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

  const [manureData, setManureData] = useState<Manure[]>([]);

  useEffect(() => {
    apiCache.callEndpoint('api/manures/').then((response: { status?: any; data: any }) => {
      if (response.status === 200) {
        const { data } = response;
        setManureData(data);
      }
    });
  }, [apiCache]);

  const handleModalSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSubmit(formData);
  };

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
          const selectedManure = manureData.find((manure) => manure.name === value);
          if (!selectedManure) {
            throw new Error(`Manure type "${value}" not found.`);
          }

          const Nutrients: ManureNutrients = {
            Moisture: String(selectedManure.moisture),
            N: selectedManure.nitrogen,
            NH4N: selectedManure.ammonia,
            P2O5: selectedManure.phosphorous,
            K2O: selectedManure.potassium,
            ManureId: selectedManure.id,
            SolidLiquid: selectedManure.solidLiquid || '',
          };
          next.materialType = value ? value.toString() : '';
          next.UniqueMaterialName = updatedUniqueMaterialName;
          next.Nutrients = Nutrients;
        }

        // reset nutrient values when book value is selected
        if (name === 'bookLab' && next.bookLab !== value) {
          const selectedManure = manureData.find((manure) => manure.name === next.materialType);
          if (!selectedManure) {
            throw new Error(`Manure type "${value}" not found.`);
          }
          next.bookLab = value ? value.toString() : '';
          next.Nutrients = {
            ManureId: selectedManure.id,
            Moisture: String(selectedManure.moisture),
            N: selectedManure.nitrogen,
            NH4N: selectedManure.ammonia,
            P2O5: selectedManure.phosphorous,
            K2O: selectedManure.potassium,
            SolidLiquid: selectedManure.solidLiquid,
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
        css={formCss}
        onSubmit={handleModalSubmit}
        onCancel={onCancel}
      >
        <Grid
          container
          spacing={2}
        >
          <Grid size={formGridBreakpoints}>
            <Select
              isRequired
              name="materialSource"
              items={manures.map((ele: NMPFileImportedManureData | NMPFileGeneratedManureData) => ({
                id: ele.UniqueMaterialName,
                label: ele.UniqueMaterialName,
              }))}
              label="Source of Material"
              placeholder="Select Source of Material"
              selectedKey={formData.materialSource}
              onSelectionChange={(e: Key) => {
                handleInputChanges({ materialSource: e as string });
              }}
            />
          </Grid>
          <Grid size={formGridBreakpoints}>
            <Select
              isRequired
              name="name"
              items={manureData.map((ele) => ({ id: ele.name, label: ele.name }))}
              label="Material Type"
              placeholder="Select Material Type"
              selectedKey={formData.materialType}
              onSelectionChange={(e: Key) => {
                handleInputChanges({ materialType: e as string, bookLab: 'book' });
              }}
            />
          </Grid>
          <Grid size={formGridBreakpoints}>
            <Checkbox
              isRequired={!formData.bookLab}
              isDisabled={!(formData.materialSource && formData.materialType)}
              value="book"
              isSelected={formData.bookLab === 'book'}
              onChange={(s: boolean) => {
                handleInputChanges({ bookLab: s ? 'book' : '' });
              }}
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
              onChange={(s: boolean) => {
                handleInputChanges({ bookLab: s ? 'lab' : '' });
              }}
            >
              Lab Value
            </Checkbox>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              isDisabled={formData.bookLab !== 'lab'}
              isRequired={formData.bookLab === 'lab'}
              label="Material name"
              name="UniqueMaterialName"
              value={formData.UniqueMaterialName}
              onChange={(e: string) => {
                handleInputChanges({ UniqueMaterialName: e });
              }}
              maxLength={100}
            />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <TextField
              isDisabled={formData.bookLab !== 'lab'}
              isRequired={formData.bookLab === 'lab'}
              label="Moisture (%)"
              name="Moisture"
              value={formData.Nutrients.Moisture}
              onChange={(e: string) => {
                handleInputChanges({ Moisture: e });
              }}
              maxLength={5}
            />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <TextField
              isDisabled={formData.bookLab !== 'lab'}
              isRequired={formData.bookLab === 'lab'}
              label="N"
              name="Moisture"
              type="number"
              value={formData.Nutrients?.N?.toString()}
              onChange={(e: string) => {
                handleInputChanges({ N: Number(e) });
              }}
              maxLength={3}
            />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <TextField
              isDisabled={formData.bookLab !== 'lab'}
              isRequired={formData.bookLab === 'lab'}
              label="NH4-N (%)"
              name="NH4N"
              type="number"
              value={formData.Nutrients?.NH4N?.toString()}
              onChange={(e: string) => {
                handleInputChanges({ NH4N: Number(e) });
              }}
              maxLength={3}
            />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <TextField
              isDisabled={formData.bookLab !== 'lab'}
              isRequired={formData.bookLab === 'lab'}
              label="P (%)"
              name="P2O5"
              type="number"
              value={formData.Nutrients?.P2O5?.toString()}
              onChange={(e: string) => {
                handleInputChanges({ P2O5: Number(e) });
              }}
              maxLength={3}
            />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <TextField
              isDisabled={formData.bookLab !== 'lab'}
              isRequired={formData.bookLab === 'lab'}
              label="K (%)"
              name="K2O"
              type="number"
              value={formData.Nutrients?.K2O?.toString()}
              onChange={(e: string) => {
                handleInputChanges({ K2O: Number(e) });
              }}
              maxLength={3}
            />
          </Grid>
        </Grid>
      </Form>
    </Modal>
  );
}
