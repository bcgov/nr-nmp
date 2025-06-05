/**
 * @summary The field table on the calculate nutrients page
 */
import { useState } from 'react';
import { TextField } from '@bcgov/design-system-react-components';
import Grid from '@mui/material/Grid';
import Form from '@/components/common/Form/Form';
import { OtherFormData } from '@/types';
import { ModalContent, SectionTitle } from './modal.styles';
import Modal, { ModalProps } from '@/components/common/Modal/Modal';
import { EMPTY_NUTRIENT_COLUMNS } from '@/constants';

type OtherModalProps = {
  initialModalData: OtherFormData | undefined;
  rowEditIndex: number | undefined;
  onClose: () => void;
};

const defaultFormData: OtherFormData = {
  name: '',
  nutrients: { ...EMPTY_NUTRIENT_COLUMNS },
};

export default function OtherModal({
  initialModalData,
  // rowEditIndex,
  // setNutrientRows, // Hypothetical function for setting the rows
  onClose,
  ...props
}: OtherModalProps & Omit<ModalProps, 'title' | 'children' | 'onOpenChange'>) {
  const [formData, setFormData] = useState(initialModalData || defaultFormData);

  const handleSubmit = () => {
    onClose();
  };

  // Question: Is there a uniqueness rule for these?
  const handleNameChange = (newName: string) => {
    setFormData((prev) => ({ ...prev, name: newName }));
  };

  const handleNutrientChange = (
    type: 'agronomic' | 'cropRemoval',
    nutrient: 'N' | 'P2O5' | 'K2O',
    value: string,
  ) => {
    setFormData((prev) => {
      const newNutrients = { ...prev.nutrients };
      newNutrients[type][nutrient] = Number(value);
      return { name: prev.name, nutrients: newNutrients };
    });
  };

  return (
    <Modal
      title="Other Details - Add"
      onOpenChange={() => {}}
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
                  value={formData.nutrients.agronomic.N.toString()}
                  onChange={(v) => handleNutrientChange('agronomic', 'N', v)}
                />
              </Grid>
              <Grid size="grow">
                <span className="bcds-react-aria-TextField--Label">
                  P<sub>2</sub>O<sub>5</sub>
                </span>
                <TextField
                  isRequired
                  type="number"
                  value={formData.nutrients.agronomic.P2O5.toString()}
                  onChange={(v) => handleNutrientChange('agronomic', 'P2O5', v)}
                />
              </Grid>
              <Grid size="grow">
                <span className="bcds-react-aria-TextField--Label">
                  K<sub>2</sub>O
                </span>
                <TextField
                  isRequired
                  type="number"
                  value={formData.nutrients.agronomic.K2O.toString()}
                  onChange={(v) => handleNutrientChange('agronomic', 'K2O', v)}
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
                  value={formData.nutrients.cropRemoval.N.toString()}
                  onChange={(v) => handleNutrientChange('cropRemoval', 'N', v)}
                />
              </Grid>
              <Grid size="grow">
                <span className="bcds-react-aria-TextField--Label">
                  P<sub>2</sub>O<sub>5</sub>
                </span>
                <TextField
                  isRequired
                  type="number"
                  value={formData.nutrients.cropRemoval.P2O5.toString()}
                  onChange={(v) => handleNutrientChange('cropRemoval', 'P2O5', v)}
                />
              </Grid>
              <Grid size="grow">
                <span className="bcds-react-aria-TextField--Label">
                  K<sub>2</sub>O
                </span>
                <TextField
                  isRequired
                  type="number"
                  value={formData.nutrients.cropRemoval.K2O.toString()}
                  onChange={(v) => handleNutrientChange('cropRemoval', 'K2O', v)}
                />
              </Grid>
            </Grid>
          </Grid>
        </Form>
      </ModalContent>
    </Modal>
  );
}
