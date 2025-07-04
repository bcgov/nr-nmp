/**
 * @summary The field table on the calculate nutrients page
 */
import React, { useState } from 'react';
import { TextField } from '@bcgov/design-system-react-components';
import Grid from '@mui/material/Grid';
import Form from '@/components/common/Form/Form';
import { NMPFileFieldData, NMPFileOtherNutrient } from '@/types';
import { ModalContent, SectionTitle } from './modal.styles';
import Modal, { ModalProps } from '@/components/common/Modal/Modal';
import { textFieldStyle } from '@/common.styles';

type OtherModalProps = {
  fieldIndex: number;
  initialModalData: NMPFileOtherNutrient | undefined;
  rowEditIndex: number | undefined;
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

  const handleNutrientChange = (prop: keyof NMPFileOtherNutrient, value: string) => {
    setFormData((prev) => ({ ...prev, [prop]: Number(value) }));
  };

  return (
    <Modal
      title="Other Details - Add"
      onOpenChange={onClose}
      {...props}
    >
      <ModalContent css={{ width: '100%' }}>
        <Form
          onCancel={() => onClose()}
          onSubmit={() => handleSubmit()}
          submitButtonText="Add to Field"
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
            <SectionTitle className="bcds-react-aria-TextField--Label">
              Available This Year (lb/ac)
            </SectionTitle>
            <Grid container>
              <Grid size="grow">
                <span className="bcds-react-aria-TextField--Label">N</span>
                <TextField
                  isRequired
                  type="number"
                  aria-label="N"
                  value={formData.reqN.toString()}
                  onChange={(v) => handleNutrientChange('reqN', v)}
                  css={textFieldStyle}
                />
              </Grid>
              <Grid size="grow">
                <span className="bcds-react-aria-TextField--Label">
                  P<sub>2</sub>O<sub>5</sub>
                </span>
                <TextField
                  isRequired
                  type="number"
                  aria-label="P2O5"
                  value={formData.reqP2o5.toString()}
                  onChange={(v) => handleNutrientChange('reqP2o5', v)}
                  css={textFieldStyle}
                />
              </Grid>
              <Grid size="grow">
                <span className="bcds-react-aria-TextField--Label">
                  K<sub>2</sub>O
                </span>
                <TextField
                  isRequired
                  type="number"
                  aria-label="K2O"
                  value={formData.reqK2o.toString()}
                  onChange={(v) => handleNutrientChange('reqK2o', v)}
                  css={textFieldStyle}
                />
              </Grid>
            </Grid>
            <SectionTitle className="bcds-react-aria-TextField--Label">
              Available Long Term (lb/ac)
            </SectionTitle>
            <Grid container>
              <Grid size="grow">
                <span className="bcds-react-aria-TextField--Label">N</span>
                <TextField
                  isRequired
                  type="number"
                  aria-label="N"
                  value={formData.remN.toString()}
                  onChange={(v) => handleNutrientChange('remN', v)}
                  css={textFieldStyle}
                />
              </Grid>
              <Grid size="grow">
                <span className="bcds-react-aria-TextField--Label">
                  P<sub>2</sub>O<sub>5</sub>
                </span>
                <TextField
                  isRequired
                  type="number"
                  aria-label="P2O5"
                  value={formData.remP2o5.toString()}
                  onChange={(v) => handleNutrientChange('remP2o5', v)}
                  css={textFieldStyle}
                />
              </Grid>
              <Grid size="grow">
                <span className="bcds-react-aria-TextField--Label">
                  K<sub>2</sub>O
                </span>
                <TextField
                  isRequired
                  type="number"
                  aria-label="K2O"
                  value={formData.remK2o.toString()}
                  onChange={(v) => handleNutrientChange('remK2o', v)}
                  css={textFieldStyle}
                />
              </Grid>
            </Grid>
          </Grid>
        </Form>
      </ModalContent>
    </Modal>
  );
}
