/**
 * @summary The field table on the calculate nutrients page
 */
import React, { useState } from 'react';
import Grid from '@mui/material/Grid';
import { NMPFileFieldData, NMPFileOtherNutrient } from '@/types';
import { ModalContent, SectionTitle } from './modal.styles';
import Modal, { ModalProps } from '@/components/common/Modal/Modal';
import { NumberField, TextField, Form } from '@/components/common';

type OtherModalProps = {
  fieldIndex: number;
  initialModalData?: NMPFileOtherNutrient;
  rowEditIndex?: number;
  setFields: React.Dispatch<React.SetStateAction<NMPFileFieldData[]>>;
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

export default function OtherModal({
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
          const newOther = [...prev.OtherNutrients];
          newOther[rowEditIndex] = { ...formData };
          return { ...prev, OtherNutrients: newOther };
        }

        // For case where this is a new nutrient source
        return {
          ...prev,
          OtherNutrients: [
            ...prev.OtherNutrients,
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

  // Question: Is there a uniqueness rule for these?
  const handleNameChange = (newName: string) => {
    setFormData((prev) => ({ ...prev, name: newName }));
  };

  const handleNutrientChange = (prop: keyof NMPFileOtherNutrient, value: number) => {
    setFormData((prev) => ({ ...prev, [prop]: value }));
  };

  return (
    <Modal
      title="Other Details - Add"
      onOpenChange={onClose}
      {...props}
    >
      <ModalContent css={{ width: '100%' }}>
        <Form
          onCancel={onClose}
          onConfirm={handleSubmit}
          confirmButtonText="Add to Field"
        >
          <Grid
            container
            spacing={2}
          >
            <Grid size={12}>
              <TextField
                isRequired
                label="Nutrient Source"
                type="text"
                value={formData.name || undefined} // Turn empty string into undefined
                onChange={(v) => handleNameChange(v)}
              />
            </Grid>
            <SectionTitle>Available This Year (lb/ac)</SectionTitle>
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
                  label={
                    <span>
                      P<sub>2</sub>O<sub>5</sub>
                    </span>
                  }
                  value={formData.reqP2o5}
                  onChange={(v) => handleNutrientChange('reqP2o5', v)}
                />
              </Grid>
              <Grid size="grow">
                <NumberField
                  isRequired
                  label={
                    <span>
                      K<sub>2</sub>O
                    </span>
                  }
                  value={formData.reqK2o}
                  onChange={(v) => handleNutrientChange('reqK2o', v)}
                />
              </Grid>
            </Grid>
            <SectionTitle>Available Long Term (lb/ac)</SectionTitle>
            <Grid container>
              <Grid size="grow">
                <NumberField
                  isRequired
                  label="N"
                  value={formData.remN}
                  onChange={(v) => handleNutrientChange('remN', v)}
                />
              </Grid>
              <Grid size="grow">
                <NumberField
                  isRequired
                  label={
                    <span>
                      P<sub>2</sub>O<sub>5</sub>
                    </span>
                  }
                  value={formData.remP2o5}
                  onChange={(v) => handleNutrientChange('remP2o5', v)}
                />
              </Grid>
              <Grid size="grow">
                <NumberField
                  isRequired
                  label={
                    <span>
                      K<sub>2</sub>O
                    </span>
                  }
                  value={formData.remK2o}
                  onChange={(v) => handleNutrientChange('remK2o', v)}
                />
              </Grid>
            </Grid>
          </Grid>
        </Form>
      </ModalContent>
    </Modal>
  );
}
