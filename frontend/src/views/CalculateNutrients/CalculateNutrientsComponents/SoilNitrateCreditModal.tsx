/**
 * @summary The field table on the calculate nutrients page
 */
import React, { useState } from 'react';
import Grid from '@mui/material/Grid';
import { NMPFileField, NMPFileSoilNitrateCredit } from '@/types';
import { ModalContent } from './modal.styles';
import Modal, { ModalProps } from '@/components/common/Modal/Modal';
import { NumberField, Form } from '@/components/common';

type SoilNitrateCreditModalProps = {
  fieldIndex: number;
  initialModalData?: NMPFileSoilNitrateCredit;
  rowEditIndex?: number;
  setFields: React.Dispatch<React.SetStateAction<NMPFileField[]>>;
  onClose: () => void;
};

const defaultFormData: NMPFileSoilNitrateCredit = {
  name: '',
  reqN: 0,
  reqP2o5: 0,
  reqK2o: 0,
  remN: 0,
  remP2o5: 0,
  remK2o: 0,
  isCustomValue: false,
};

export default function SoilNitrateCreditModal({
  fieldIndex,
  initialModalData,
  rowEditIndex,
  setFields,
  onClose,
  ...props
}: SoilNitrateCreditModalProps & Omit<ModalProps, 'title' | 'children' | 'onOpenChange'>) {
  const [formData, setFormData] = useState(initialModalData || defaultFormData);

  const handleSubmit = () => {
    setFields((prevFields) => {
      const newFields = prevFields.map((prev, index) => {
        if (index !== fieldIndex) return prev;

        if (rowEditIndex !== undefined) {
          return { ...prev, soilNitrateCredit: formData };
        }

        // For case where this is a new nutrient source
        return {
          ...prev,
          soilNitrateCredit: formData,
        };
      });

      return newFields;
    });

    onClose();
  };

  const handleNutrientChange = (prop: keyof NMPFileSoilNitrateCredit, value: number) => {
    setFormData((prev) => ({ ...prev, [prop]: value, isCustomValue: true }));
  };

  return (
    <Modal
      title="Soil Nitrate - Edit"
      onOpenChange={onClose}
      {...props}
    >
      <ModalContent css={{ width: '100%' }}>
        <Form
          onCancel={onClose}
          onConfirm={handleSubmit}
          confirmButtonText="Save changes"
        >
          <Grid
            container
            spacing={2}
          >
            <Grid size={12}>
              <div style={{ textAlign: 'center' }}>
                Available nitrogen at the start of the growing season
              </div>
            </Grid>
            <Grid container>
              <Grid size="grow">
                <NumberField
                  isRequired
                  label="N (lb/ac)"
                  value={formData.reqN}
                  onChange={(v) => handleNutrientChange('reqN', v)}
                />
              </Grid>
            </Grid>
          </Grid>
        </Form>
      </ModalContent>
    </Modal>
  );
}
