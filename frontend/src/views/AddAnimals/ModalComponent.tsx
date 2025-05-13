/**
 * @summary This is the Add Animal list Tab
 */
import { ComponentProps, FormEvent, Key, useState } from 'react';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import {
  Button,
  ButtonGroup,
  Dialog,
  Modal,
  Form,
  Select,
} from '@bcgov/design-system-react-components';
import { formCss, modalHeaderStyle, modalPaddingStyle } from '../../common.styles';
{
  /* Importing additional animal form subcomponents here */
}
import BeefCattle from './AnimalFormComponents/BeefCattle';
import DairyCattle from './AnimalFormComponents/DairyCattle';
import { AnimalData, initialEmptyData } from './types';

// need a row id
type tempAnimalData = AnimalData & { id?: string };

const animalOptions = [
  { id: '1', label: 'Beef Cattle' },
  { id: '2', label: 'Dairy Cattle' },
];

type ModalComponentProps = {
  initialModalData: tempAnimalData;
  handleDialogClose: () => void;
  handleSubmit: (formData: tempAnimalData) => void;
};

export default function ModalComponent({
  initialModalData,
  handleDialogClose,
  handleSubmit,
  ...props
}: ModalComponentProps & ComponentProps<typeof Modal>) {
  const [formData, setFormData] = useState<tempAnimalData>(initialModalData);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    // Prevent default browser page refresh.
    e.preventDefault();
    handleSubmit(formData);
  };

  const handleInputChange = (name: string, value: string | number | undefined) => {
    setFormData((prev: tempAnimalData) => {
      const updatedData = { ...prev, [name]: value };
      return updatedData;
    });
  };

  return (
    <Modal {...props}>
      <Dialog
        isCloseable
        role="dialog"
        aria-labelledby="add-animal-dialog"
      >
        <div css={modalPaddingStyle}>
          <span css={modalHeaderStyle}>Add animal</span>
          <Divider
            aria-hidden="true"
            component="div"
            css={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}
          />
          <Form
            css={formCss}
            onSubmit={onSubmit}
          >
            <Grid
              container
              spacing={2}
            >
              <Grid size={12}>
                <Select
                  isRequired
                  name="animalId"
                  items={animalOptions}
                  label="Animal Type"
                  placeholder="Select Animal Type"
                  selectedKey={formData?.animalId}
                  onSelectionChange={(e: Key) => {
                    // Reset form data first, then update.
                    setFormData(initialEmptyData);
                    handleInputChange('animalId', e.toString());
                  }}
                />
              </Grid>
              {/* Insert additional animal form subcomponents here */}
              {formData?.animalId === '1' && (
                <BeefCattle
                  handleInputChange={handleInputChange}
                  initialFormData={formData}
                />
              )}
              {formData?.animalId === '2' && (
                <DairyCattle
                  handleInputChange={handleInputChange}
                  initialFormData={formData}
                />
              )}
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
                onPress={handleDialogClose}
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
        </div>
      </Dialog>
    </Modal>
  );
}
