/**
 * @summary The field table on the calculate nutrients page
 */
import React, { FormEvent, useContext, useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import { Button, ButtonGroup, Form } from '@bcgov/design-system-react-components';
import { Select } from '@/components/common';
import Modal, { ModalProps } from '@/components/common/Modal/Modal';
import type { FertilizerType, NMPFileFieldData } from '@/types';
import { formCss, formGridBreakpoints } from '@/common.styles';
import { NMPFileFertigation } from '@/types/calculateNutrients';
import { APICacheContext } from '@/context/APICacheContext';

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
  applicationRate: 1,
  density: 0,
  tankVolume: 0,
  solubility: 0,
  amountToDissolve: 0,
  injectionRate: 0,
  eventsPerSeason: 0,
  applicationPeriod: 0,
};

export default function FertigationModal({
  initialModalData,
  onClose,
  ...props
}: FertigationModalProps & Omit<ModalProps, 'title' | 'children' | 'onOpenChange'>) {
  const [fertilizerTypes, setFertilizerTypes] = useState<FertilizerType[]>([]);
  const [formData, setFormData] = useState<NMPFileFertigation>(
    initialModalData || EMPTY_FERTIGATION_FORM_DATA,
  );
  const apiCache = useContext(APICacheContext);

  useEffect(() => {
    apiCache.callEndpoint('api/fertilizertypes/').then((response: { status?: any; data: any }) => {
      if (response.status === 200) {
        const fertilizerTs: FertilizerType[] = response.data;
        setFertilizerTypes(fertilizerTs);
      }
    });
  });

  const handleSubmit = () => {
    onClose();
  };

  const handleModalCalculate = (e: FormEvent) => {
    e.preventDefault();
    setFormData((prev) => ({
      ...prev,
      fertilizerTypeId: formData.fertilizerTypeId,
    }));
  };

  const handleInputChanges = (changes: { [name: string]: string | number | undefined }) => {
    setFormData((prev) => ({ ...prev, ...changes }));
  };

  return (
    <Modal
      title="Add Fertigation"
      onOpenChange={onClose}
      {...props}
    >
      <Form
        css={formCss}
        onSubmit={handleModalCalculate}
      >
        <Grid
          container
          spacing={2}
        >
          <Grid size={formGridBreakpoints}>
            <Select
              isRequired
              name="fertilizerTypeId"
              items={fertilizerTypes.map((ele) => ({ id: ele.id, label: ele.name }))}
              label="Fertilizer Type"
              placeholder="Select Fertilizer Type"
              selectedKey={formData.fertilizerTypeId}
              onSelectionChange={(e) => {
                handleInputChanges({ fertilizerTypeId: e as number });
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
            onPress={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
          >
            Calculate
          </Button>
          <Button
            // isDisabled={!calculatedData}
            variant="primary"
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </ButtonGroup>
      </Form>
    </Modal>
  );
}
