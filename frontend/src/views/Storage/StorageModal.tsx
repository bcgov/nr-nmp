/**
 * @summary This is the Add Animal list Tab
 */
import { ComponentProps, FormEvent, Key, useEffect, useMemo, useState } from 'react';
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
import { formCss, modalHeaderStyle, modalPaddingStyle } from '../../common.styles';
import manureTypeOptions from '@/constants/ManureTypeOptions';
import YesNoRadioButtons from '@/components/common/YesNoRadioButtons/YesNoRadioButtons';
import useAppState from '@/hooks/useAppState';
import { NMPFileImportedManureData, NMPFileGeneratedManureData } from '@/types';
import { booleanChecker } from '@/utils/utils';
import { ListBoxItemProps } from 'react-aria-components';

interface StorageForm {
  ManureType: string;
  ManureTypeName: string;
  SystemName: string;
  StorageName: string;
  IsMaterialStored: boolean;
  IsUncovered: string | null;
  UncoveredArea?: number;
  ManagedManure: string;
  UniqueMaterialName: string;
}

type ModalComponentProps = {
  initialModalData: StorageForm;
  handleDialogClose: () => void;
  handleSubmit: (formData: StorageForm) => void;
  storageList: any;
};

export default function StorageModal({
  initialModalData,
  handleDialogClose,
  handleSubmit,
  storageList,
  ...props
}: ModalComponentProps & ComponentProps<typeof Modal>) {
  const { state } = useAppState();
  const [formData, setFormData] = useState<StorageForm>(initialModalData);
  const [isEditingExistingEntry] = useState<boolean>(!!initialModalData?.UniqueMaterialName);

  const [manureList, setManureList] = useState<{ id: string; label: string }[]>([]);

  // gets imported and generated manures then filters manures based on manure type
  useEffect(() => {
    const imported = state.nmpFile.years[0]?.ImportedManures ?? [];
    const generated = state.nmpFile.years[0]?.GeneratedManures ?? [];
    const manures = [...imported, ...generated];

    const filteredManures = manures.filter(
      (manure) => manure.ManureTypeName === formData?.ManureType,
    );

    const items = filteredManures.map((manure, index) => ({
      id: `${manure.UniqueMaterialName}-${index}`,
      label: manure.ManagedManureName ?? '',
    }));

    setManureList(items);
  }, [formData?.ManureType, state.nmpFile.years]);

  const notUniqueNameCheck = () => {
    if (isEditingExistingEntry) return false;
    return storageList.some(
      (ele: StorageForm) => ele.UniqueMaterialName === formData.UniqueMaterialName,
    );
  };

  // fix onsubmit so it populates to data grid
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
    setFormData((prev: StorageForm) => {
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
          <span css={modalHeaderStyle}>Storage System Details</span>
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
              size={12}
            >
              <Grid
                container
                size={12}
                direction="row"
              >
                <Grid
                  container
                  size={5}
                >
                  <Select
                    isRequired
                    label="Manure Type"
                    selectedKey={formData?.ManureType}
                    items={manureTypeOptions}
                    onSelectionChange={(e: Key) => {
                      handleInputChange('ManureType', String(e));
                      handleInputChange(
                        'ManureTypeName',
                        manureTypeOptions.find((ele) => ele.id === e)?.label,
                      );
                    }}
                  />
                  <TextField
                    isRequired
                    label="System Name"
                    type="string"
                    name="systemName"
                    onChange={(e: Key) => {
                      handleInputChange('SystemName', String(e) ?? '');
                    }}
                  />
                </Grid>
                <Grid size={6}>
                  <Select
                    isRequired
                    label="Included Materials"
                    placeholder="Select a manure type"
                    selectedKey={formData?.ManagedManure}
                    items={manureList}
                    onSelectionChange={(e: Key) => {
                      handleInputChange('ManagedManure', String(e));
                    }}
                  />
                </Grid>
              </Grid>
              <Grid
                container
                size={12}
                direction="column"
              >
                <Divider
                  aria-hidden="true"
                  component="div"
                  css={{ marginTop: '1rem', marginBottom: '1rem' }}
                />
                <span
                  className={`bcds-react-aria-Select--Label ${notUniqueNameCheck() ? '--error' : ''}`}
                />
                <Grid
                  container
                  size={12}
                  direction="row"
                >
                  <Grid
                    container
                    size={5}
                    direction="row"
                  >
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
                  <Grid
                    container
                    size={5}
                    direction="row"
                  >
                    <div
                      style={{ marginBottom: '0.15rem' }}
                      className="bcds-react-aria-Select--Label"
                    >
                      {/* fix radio yes no */}
                      Is the storage covered?
                      <YesNoRadioButtons
                        value={booleanChecker(formData.IsUncovered)}
                        text=""
                        onChange={(b: boolean) => {
                          console.log(b);
                        }}
                        orientation="horizontal"
                      />
                    </div>
                    {!formData.IsUncovered && (
                      <TextField
                        isRequired
                        label="Uncovered Area of Storage (ft2)"
                        type="number"
                        name="uncoveredArea"
                        onChange={(e: Key) => {
                          handleInputChange('UncoveredArea', Number(e) ?? '');
                        }}
                      />
                    )}
                  </Grid>
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
