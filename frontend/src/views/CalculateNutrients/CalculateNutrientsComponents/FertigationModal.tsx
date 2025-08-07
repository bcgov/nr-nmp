/**
 * @summary The field table on the calculate nutrients page
 */
import React, { useContext, useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import { Select, Form } from '@/components/common';
import Modal, { ModalProps } from '@/components/common/Modal/Modal';
import type { FertilizerType, NMPFileFieldData, SelectOption } from '@/types';
import { formGridBreakpoints } from '@/common.styles';
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
  const [fertilizerTypes, setFertilizerTypes] = useState<SelectOption<FertilizerType>[]>([]);
  const [formData, setFormData] = useState<NMPFileFertigation>(
    initialModalData || EMPTY_FERTIGATION_FORM_DATA,
  );
  const apiCache = useContext(APICacheContext);

  useEffect(() => {
    apiCache.callEndpoint('api/fertilizertypes/').then((response: { status?: any; data: any }) => {
      if (response.status === 200) {
        const fertilizerTs: FertilizerType[] = response.data;
        setFertilizerTypes(
          fertilizerTs.map((ele) => ({ id: ele.id, label: ele.name, value: ele })),
        );
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = () => {
    onClose();
  };

  const handleModalCalculate = () => {
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
              onSelectionChange={(e) => {
                handleInputChanges({ fertilizerTypeId: e as number });
              }}
            />
          </Grid>
        </Grid>
      </Form>
    </Modal>
  );
}
