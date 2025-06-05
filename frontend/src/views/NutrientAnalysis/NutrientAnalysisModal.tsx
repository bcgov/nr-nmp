/**
 * @summary This is the Add Animal list Tab
 */
import { FormEvent, Key, useContext, useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import { Checkbox, Select, TextField } from '@bcgov/design-system-react-components';
import Modal, { ModalProps } from '@/components/common/Modal/Modal';
import { ManureNutrients, NMPFileFarmManureData, ManureType } from '@/types';
import { formCss, formGridBreakpoints } from '@/common.styles';
import Form from '@/components/common/Form/Form';
import { APICacheContext } from '@/context/APICacheContext';
import NMPFileImportedManureData from '@/types/NMPFileImportedManureData';
import NMPFileGeneratedManureData from '@/types/NMPFileGeneratedManureData';

type NutrientAnalysisModalProps = {
  initialModalData: NMPFileFarmManureData | undefined;
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
};

const EMPTY_MANURE_DATA: NMPFileFarmManureData = {
  ManureSource: '',
  MaterialType: '',
  BookLab: '',
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
    initialModalData ?? EMPTY_MANURE_DATA,
  );
  const apiCache = useContext(APICacheContext);

  const [manureTypesData, setManureTypesData] = useState<ManureType[]>([]);

  useEffect(() => {
    apiCache.callEndpoint('api/manures/').then((response: { status?: any; data: any }) => {
      if (response.status === 200) {
        const { data } = response;
        setManureTypesData(data);
      }
    });
  }, [apiCache]);

  const handleModalSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSubmit(formData);
  };

  const handleInputChanges = (changes: { [name: string]: string | number | undefined }) => {
    const name = Object.keys(changes)[0];
    const value = changes[name];

    setFormData((prev: NMPFileFarmManureData): NMPFileFarmManureData => {
      if (name === 'ManureSource') {
        return {
          ...EMPTY_MANURE_DATA,
          BookLab: '',
          ...changes,
        };
      }
      if (name === 'MaterialType') {
        const updatedUniqueMaterialName =
          prev.UniqueMaterialName === '' ||
          prev.UniqueMaterialName !== `Custom - ${prev.MaterialType}`
            ? `Custom - ${value}`
            : prev.UniqueMaterialName;
        const selectedManure = manureTypesData.find((manure) => manure.name === value);
        if (!selectedManure) {
          throw new Error(`Manure type "${value}" not found.`);
        }

        const Nutrients: ManureNutrients = {
          Moisture: String(selectedManure.moisture),
          N: selectedManure.nitrogen,
          NH4N: selectedManure.ammonia,
          P2O5: selectedManure.phosphorous,
          K2O: selectedManure.potassium,
        };
        return {
          ...prev,
          MaterialType: value ? value.toString() : '',
          UniqueMaterialName: updatedUniqueMaterialName,
          Nutrients,
        };
      }

      // reset nutrient values when book value is selected
      if (name === 'BookLab' && prev.BookLab !== value) {
        const selectedManure = manureTypesData.find((manure) => manure.name === prev.MaterialType);
        if (!selectedManure) {
          throw new Error(`Manure type "${value}" not found.`);
        }
        return {
          ...prev,
          BookLab: value ? value.toString() : '',
          Nutrients: {
            Moisture: String(selectedManure.moisture),
            N: selectedManure.nitrogen,
            NH4N: selectedManure.ammonia,
            P2O5: selectedManure.phosphorous,
            K2O: selectedManure.potassium,
          },
        };
      }

      // update nutrients if changed
      if (name in prev.Nutrients) {
        return {
          ...prev,
          Nutrients: {
            ...prev.Nutrients,
            [name]: value === '' ? '' : Number(value),
          },
        };
      }

      return { ...prev, ...changes };
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
              name="ManureSource"
              items={manures.map((ele: NMPFileImportedManureData | NMPFileGeneratedManureData) => ({
                id: ele.UniqueMaterialName,
                label: ele.UniqueMaterialName,
              }))}
              label="Manure Source"
              placeholder="Select Manure Source"
              selectedKey={formData.ManureSource}
              onSelectionChange={(e: Key) => {
                handleInputChanges({ ManureSource: e.toString() });
              }}
            />
          </Grid>
          <Grid size={formGridBreakpoints}>
            <Select
              isRequired
              name="name"
              items={manureTypesData.map((ele) => ({ id: ele.name, label: ele.name }))}
              label="Manure Type"
              placeholder="Select Manure Type"
              selectedKey={formData.MaterialType}
              onSelectionChange={(e: Key) => {
                handleInputChanges({ MaterialType: e.toString() });
              }}
            />
          </Grid>
          <Grid size={formGridBreakpoints}>
            <Checkbox
              isRequired={!formData?.BookLab}
              isDisabled={!(formData.ManureSource && formData.MaterialType)}
              value="book"
              isSelected={formData?.BookLab === 'book'}
              onChange={(s: boolean) => {
                handleInputChanges({ BookLab: s ? 'book' : '' });
              }}
            >
              Book Value
            </Checkbox>
          </Grid>
          <Grid size={formGridBreakpoints}>
            <Checkbox
              isRequired={!formData?.BookLab}
              isDisabled={!(formData.ManureSource && formData.MaterialType)}
              value="lab"
              isSelected={formData?.BookLab === 'lab'}
              onChange={(s: boolean) => {
                handleInputChanges({ BookLab: s ? 'lab' : '' });
              }}
            >
              Lab Value
            </Checkbox>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              isDisabled={formData?.BookLab !== 'lab'}
              isRequired={formData?.BookLab === 'lab'}
              label="Material name"
              name="UniqueMaterialName"
              value={formData?.UniqueMaterialName}
              onChange={(e: string) => {
                handleInputChanges({ UniqueMaterialName: e });
              }}
              maxLength={100}
            />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <TextField
              isDisabled={formData?.BookLab !== 'lab'}
              isRequired={formData?.BookLab === 'lab'}
              label="Moisture (%)"
              name="Moisture"
              value={formData?.Nutrients.Moisture}
              onChange={(e: string) => {
                handleInputChanges({ Moisture: e });
              }}
              maxLength={5}
            />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <TextField
              isDisabled={formData?.BookLab !== 'lab'}
              isRequired={formData?.BookLab === 'lab'}
              label="N"
              name="Moisture"
              type="number"
              value={formData?.Nutrients?.N?.toString()}
              onChange={(e: string) => {
                handleInputChanges({ N: e });
              }}
              maxLength={3}
            />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <TextField
              isDisabled={formData?.BookLab !== 'lab'}
              isRequired={formData?.BookLab === 'lab'}
              label="NH4-N (%)"
              name="NH4N"
              type="number"
              value={formData?.Nutrients?.NH4N?.toString()}
              onChange={(e: string) => {
                handleInputChanges({ NH4N: e });
              }}
              maxLength={3}
            />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <TextField
              isDisabled={formData?.BookLab !== 'lab'}
              isRequired={formData?.BookLab === 'lab'}
              label="P (%)"
              name="P"
              type="number"
              value={formData?.Nutrients?.P2O5?.toString()}
              onChange={(e: string) => {
                handleInputChanges({ P: e });
              }}
              maxLength={3}
            />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <TextField
              isDisabled={formData?.BookLab !== 'lab'}
              isRequired={formData?.BookLab === 'lab'}
              label="K (%)"
              name="K"
              type="number"
              value={formData?.Nutrients?.K2O?.toString()}
              onChange={(e: string) => {
                handleInputChanges({ K: e });
              }}
              maxLength={3}
            />
          </Grid>
        </Grid>
      </Form>
    </Modal>
  );
}
