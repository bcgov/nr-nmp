/**
 * @summary This is the NewFertilizerModal component
 */
import { FormEvent, Key, useContext, useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import {
  Button,
  ButtonGroup,
  Form,
  Select,
  TextField,
} from '@bcgov/design-system-react-components';
import Divider from '@mui/material/Divider';
import Modal, { ModalProps } from '@/components/common/Modal/Modal';
import { NMPFileFarmManureData } from '@/types/NMPFileFarmManureData';
import { formCss, formGridBreakpoints } from '@/common.styles';
import { APICacheContext } from '@/context/APICacheContext';
import { InputField } from '@/components/common';

import type { FertilizerFormData } from '../types';
import { Fertilizer } from '@/types';

interface FertilizerOption extends Fertilizer {
  label: string;
}

type FertilizerModalProps = {
  initialModalData: FertilizerFormData | undefined;
  handleSubmit?: (data: NMPFileFarmManureData) => void;
  onCancel: () => void;
};

const EMPTY_FERTILIZER_FORM_DATA: FertilizerFormData = {
  fieldName: '',
  fertilizerType: 0,
  fertilizerId: 0,
  applicationRate: 1,
  applUnit: 1,
  liquidDensity: 1,
  densityUnits: 0,
  availableNutrients: { N: 0, P2O5: 0, K2O: 0 },
  nutrientsStillRequired: { N: 0, P2O5: 0, K2O: 0 },
};

const FERTILIZER_METHOD: Array<{ id: string; label: string }> = [
  { id: 'Broadcast', label: 'Broadcast' },
  { id: 'Banded', label: 'Banded' },
  { id: 'With planter', label: 'With planter' },
  { id: 'Sidedress', label: 'Sidedress' },
  { id: 'Fertigation', label: 'Fertigation' },
  { id: 'Follar', label: 'Follar' },
];

export default function FertilizerModal({
  initialModalData,
  // Import field and handleSubmit from parent component when ready
  // field,
  // handleSubmit,
  onCancel,
  ...props
}: FertilizerModalProps & Omit<ModalProps, 'title' | 'children' | 'onOpenChange'>) {
  const [fertilizerTypes, setFertilizerTypes] = useState<
    {
      id: number;
      label: string;
      name: string;
      dryliquid: string;
      custom: boolean;
    }[]
  >([]);
  const [fertilizerOptions, setFertilizerOptions] = useState<FertilizerOption[]>([]);
  const [filteredFertilizersOptions, setFilteredFertilizerOptions] = useState<FertilizerOption[]>(
    [],
  );
  const [fertilizerUnits, setFertilizerUnits] = useState<
    {
      id: number;
      name: string;
      dryliquid: string;
      conversiontoimperialgallonsperacre: number;
    }[]
  >([]);

  const [formData, setFormData] = useState<FertilizerFormData>(
    initialModalData ?? EMPTY_FERTILIZER_FORM_DATA,
  );
  const apiCache = useContext(APICacheContext);

  const dryOrLiquidUnitOptions = fertilizerUnits.filter(
    (ele) =>
      ele.dryliquid ===
      fertilizerTypes.find((fertType) => fertType.id === formData.fertilizerType)?.dryliquid,
  );

  // const getConversionCoefficient = (unitId: number) => {
  //   const unit = fertilizerUnits.find((fUnit) => fUnit.id === unitId);
  //   return unit ? unit.conversiontoimperialgallonsperacre : 1;
  // };

  useEffect(() => {
    apiCache.callEndpoint('api/fertilizertypes/').then((response: { status?: any; data: any }) => {
      if (response.status === 200) {
        const { data } = response;
        setFertilizerTypes(data);
      }
    });
    apiCache.callEndpoint('api/fertilizers/').then((response: { status?: any; data: any }) => {
      if (response.status === 200) {
        const { data } = response;
        setFertilizerOptions(data);
      }
    });
    apiCache.callEndpoint('api/fertilizerunits/').then((response: { status?: any; data: any }) => {
      if (response.status === 200) {
        const { data } = response;
        console.log('fertilizerunits', data);
        setFertilizerUnits(data);
      }
    });
  }, [apiCache, fertilizerTypes, fertilizerOptions]);

  const handleModalSubmit = (e: FormEvent) => {
    e.preventDefault();
    // handleSubmit(formData);
  };

  const handleInputChanges = (changes: { [name: string]: string | number | undefined }) => {
    const name = Object.keys(changes)[0];
    const value = changes[name];
    console.log('handleInputChanges', name, value);
    if (name === 'fertilizerType') {
      setFilteredFertilizerOptions(
        fertilizerOptions.filter(
          (ele) =>
            ele.dryliquid === fertilizerTypes.find((fertType) => fertType.id === value)?.dryliquid,
        ),
      );
    }
    setFormData((prev) => ({ ...prev, ...changes }));
  };

  // This was in the old FertilizerModal file
  // const densityOptions = [
  //   { value: 0, label: 'kg/US Gallon' },
  //   { value: 1, label: 'kg/L' },
  //   { value: 2, label: 'lb/US gallon' },
  //   { value: 3, label: 'lb/imp. gallon' },
  // ];
  /* {(formData.fertilizerType === 3 || 4) && (
    <>
      <TextField
        label="Density"
        type="number"
        name="liquidDensity"
        value={formData.liquidDensity}
        onChange={(e) => handleChange(e)}
        flex="0.5"
      />
      <Select
        label="Density Units"
        name="densityUnits"
        value={formData.densityUnits}
        options={densityOptions}
        onChange={(e: any) => handleChange(e)}
      />
    </>
  )} */
  /* <div>
    <h3>Available Nutrients (lb/ac)</h3>
    <table>
      <tbody>
        <tr>
          <td>
            <h4>N</h4>
            <p>{formData.availableNutrients.N}</p>
          </td>
          <td>
            <h4>P2O5</h4>
            <p>{formData.availableNutrients.P}</p>
          </td>
          <td>
            <h4>k2O</h4>
            <p>{formData.availableNutrients.K}</p>
          </td>
        </tr>
      </tbody>
    </table>
  </div> */

  return (
    <Modal
      title="Add fertilizer"
      onOpenChange={onCancel}
      {...props}
    >
      <Form
        css={formCss}
        onSubmit={handleModalSubmit}
      >
        <Grid
          container
          spacing={2}
        >
          <Grid size={formGridBreakpoints}>
            <Select
              isRequired
              name="fertilizerType"
              items={fertilizerTypes.map((ele) => ({ id: ele.id, label: ele.name }))}
              label="Fertilizer Type"
              placeholder="Select Fertilizer Type"
              selectedKey={formData.fertilizerType}
              onSelectionChange={(e: Key) => {
                handleInputChanges({ fertilizerType: parseInt(e.toString(), 10) });
              }}
            />
          </Grid>
          <Grid size={formGridBreakpoints}>
            <Select
              isRequired
              name="name"
              items={filteredFertilizersOptions.map((ele) => ({ id: ele.id, label: ele.name }))}
              label="Fertilizer"
              placeholder="Select Fertilizer"
              // selectedKey={formData.MaterialType}
              onSelectionChange={(e: Key) => {
                handleInputChanges({ fertilizerId: e.toString() });
              }}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField
              label="Application Rate"
              name="Moisture"
              // value={formData?.Nutrients.Moisture}
              onChange={(e: string) => {
                handleInputChanges({ applicationRate: e });
              }}
              maxLength={5}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Select
              isRequired
              name="applUnit"
              items={dryOrLiquidUnitOptions.map((ele) => ({ id: ele.id, label: ele.name }))}
              label="Application Units"
              placeholder="Select Units"
              selectedKey={formData.applUnit}
              onSelectionChange={(e: Key) => {
                handleInputChanges({ applUnit: parseInt(e.toString(), 10) });
              }}
            />
          </Grid>
          <Grid size={formGridBreakpoints}>
            <Select
              isRequired
              name="name"
              items={FERTILIZER_METHOD}
              label="Method (optional)"
              placeholder="Select Method"
              // selectedKey={formData.MaterialType}
              onSelectionChange={(e: Key) => {
                // TBD current NMP requires this, need to double check the data logic when implementing later
                console.log(e);
              }}
            />
          </Grid>
          <Grid size={formGridBreakpoints}>
            <span className="bcds-react-aria-Select--Label">Date (optional)</span>
            <InputField
              label=""
              type="date"
              name="sampleDate"
              value=""
              onChange={(e: any) => {
                // TBD current NMP requires this, need to double check the data logic when implementing later
                console.log(e);
              }}
            />
          </Grid>
        </Grid>
        <Divider
          aria-hidden="true"
          component="div"
          css={{ marginTop: '1rem', marginBottom: '1rem' }}
        />
        <ButtonGroup
          alignment="end"
          orientation="horizontal"
        >
          <Button
            type="reset"
            variant="secondary"
            onPress={onCancel}
            aria-label="reset"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            aria-label="submit"
          >
            Confirm
          </Button>
        </ButtonGroup>
      </Form>
    </Modal>
  );
}
