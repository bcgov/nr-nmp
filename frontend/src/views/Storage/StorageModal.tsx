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
  TextField,
} from '@bcgov/design-system-react-components';
import {
  formCss,
  modalHeaderStyle,
  modalPaddingStyle,
  formGridBreakpoints,
} from '../../common.styles';
import { NMPFileImportedManureData } from '@/types';

const manureTypeOptions = [
  { label: 'Liquid', id: 1 },
  { label: 'Solid', id: 2 },
];

type ModalComponentProps = {
  initialModalData: NMPFileImportedManureData;
  handleDialogClose: () => void;
  handleSubmit: (formData: NMPFileImportedManureData) => void;
  storageList: any;
};

export default function StorageModal({
  initialModalData,
  handleDialogClose,
  handleSubmit,
  storageList,
  ...props
}: ModalComponentProps & ComponentProps<typeof Modal>) {
  const [formData, setFormData] = useState<NMPFileImportedManureData>(initialModalData);
  const [isEditingExistingEntry] = useState<boolean>(!!initialModalData?.UniqueMaterialName);

  const notUniqueNameCheck = () => {
    if (isEditingExistingEntry) return false;
    return storageList.some(
      (ele: NMPFileImportedManureData) => ele.UniqueMaterialName === formData.UniqueMaterialName,
    );
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    // Prevent default browser page refresh.
    e.preventDefault();

    if (notUniqueNameCheck()) {
      console.error('not unique name');
    } else {
      handleSubmit(formData);
      handleDialogClose();
    }
  };

  const handleInputChange = (name: string, value: string | number | undefined) => {
    setFormData((prev: NMPFileImportedManureData) => {
      const updatedData = { ...prev, [name]: value };
      return updatedData;
    });
  };

  return (
    <Modal {...props}>
      <Dialog
        isCloseable
        role="dialog"
        aria-labelledby="add-storage-dialog"
      >
        <div css={modalPaddingStyle}>
          <span css={modalHeaderStyle}>Add Storage System</span>
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
              <Grid size={formGridBreakpoints}>
                <span
                  className={`bcds-react-aria-Select--Label ${notUniqueNameCheck() ? '--error' : ''}`}
                />
                <Grid size={formGridBreakpoints}>
                  <Select
                    isRequired
                    label="Manure Type"
                    placeholder="Select manure type"
                    selectedKey={formData?.ManureType}
                    items={manureTypeOptions}
                    onSelectionChange={(e: Key) => {
                      handleInputChange('ManureType', Number(e) ?? '');
                      handleInputChange(
                        'ManureTypeName',
                        manureTypeOptions.find((ele) => ele.id === e)?.label,
                      );
                    }}
                  />
                </Grid>
                <Grid>
                  <TextField
                    isRequired
                    label="Storage Name"
                    type="string"
                    name="storageName"
                    onChange={(e: Key) => {
                      handleInputChange('StorageName', String(e) ?? '');
                    }}
                  />
                </Grid>
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
