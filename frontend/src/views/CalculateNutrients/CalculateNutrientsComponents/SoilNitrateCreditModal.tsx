/**
 * @summary The field table on the calculate nutrients page
 */
import React, { useState } from 'react';
import Grid from '@mui/material/Grid';
import { NMPFileField, NMPFileOtherNutrient, NMPFileSoilNitrateCredit } from '@/types';
import { ModalContent, SectionTitle } from './modal.styles';
import Modal, { ModalProps } from '@/components/common/Modal/Modal';
import { NumberField, Form } from '@/components/common';

type OtherModalProps = {
  fieldIndex: number;
  initialModalData?: NMPFileOtherNutrient;
  rowEditIndex?: number;
  setFields: React.Dispatch<React.SetStateAction<NMPFileField[]>>;
  onClose: () => void;
};

const defaultFormData: NMPFileOtherNutrient = {
  name: '',
  reqN: 0,
  reqP2o5: 0,
  reqK2o: 0,
  remN: 0,
  remP2o5: 0,
  remK2o: 0,
};

export default function SoilNitrateCreditModal({
  fieldIndex,
  initialModalData,
  rowEditIndex,
  setFields,
  onClose,
  ...props
}: OtherModalProps & Omit<ModalProps, 'title' | 'children' | 'onOpenChange'>) {
  const [formData, setFormData] = useState(initialModalData || defaultFormData);

  const handleSubmit = () => {
    setFields((prevFields) => {
      const newFields = prevFields.map((prev, index) => {
        if (index !== fieldIndex) return prev;

        if (rowEditIndex !== undefined) {
          const newSoilNitrateCredit = [...prev.soilNitrateCredit];
          newSoilNitrateCredit[rowEditIndex] = { ...formData };
          return { ...prev, soilNitrateCredit: newSoilNitrateCredit };
        }

        // For case where this is a new nutrient source
        return {
          ...prev,
          soilNitrateCredit: [
            ...prev.soilNitrateCredit,
            {
              ...formData,
            },
          ],
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
          confirmButtonText="Add to calculations"
        >
          <Grid
            container
            spacing={2}
          >
            <SectionTitle>Custom Nitrate Credit (lb/ac)</SectionTitle>
            <Grid container>
              <Grid size="grow">
                <NumberField
                  isRequired
                  label="N"
                  value={formData.reqN}
                  onChange={(v) => handleNutrientChange('reqN', v)}
                />
              </Grid>
              <Grid size="grow">
                <NumberField
                  isRequired
                  label="P₂O₅"
                  isDisabled
                  value={formData.reqP2o5}
                  onChange={(v) => handleNutrientChange('reqP2o5', v)}
                />
              </Grid>
              <Grid size="grow">
                <NumberField
                  isRequired
                  label="K₂O"
                  isDisabled
                  value={formData.reqK2o}
                  onChange={(v) => handleNutrientChange('reqK2o', v)}
                />
              </Grid>
            </Grid>
          </Grid>
        </Form>
      </ModalContent>
    </Modal>
  );
}
