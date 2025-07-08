/**
 * @summary This is the Add Animal list Tab
 */
import { ComponentProps, FormEvent, Key, useEffect, useState } from 'react';
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
import { booleanChecker } from '@/utils/utils';
import { NMPFileManureStorageSystemsData } from '@/types';

type ModalComponentProps = {
  initialModalData: NMPFileManureStorageSystemsData;
  handleSubmit: (formData: NMPFileManureStorageSystemsData) => void;
  storageList: any;
  handleDialogClose: () => void;
};

export default function StorageModal({
  initialModalData,
  handleSubmit,
  storageList,
  handleDialogClose,
  ...props
}: ModalComponentProps & ComponentProps<typeof Modal>) {
  const { state } = useAppState();
  const [formData, setFormData] = useState<NMPFileManureStorageSystemsData>(initialModalData);
  const [isEditingExistingEntry] = useState<boolean>(!!initialModalData?.Name);
  const [includedMaterial, setIncludedMaterial] = useState<string>('');
  const [storageStructure, setStorageStructure] = useState<{
    Id: number;
    Name: string;
    IsStructureCovered: boolean;
    UncoveredAreaSquareFeet?: number;
  }>({
    Id: 0,
    Name: '',
    IsStructureCovered: false,
    UncoveredAreaSquareFeet: undefined,
  });

  const [manureList, setManureList] = useState<{ id: string; label: string; manure: any }[]>([]);

  // gets imported and generated manures then filters manures based on manure type
  useEffect(() => {
    const imported = state.nmpFile.years[0]?.ImportedManures ?? [];
    const generated = state.nmpFile.years[0]?.GeneratedManures ?? [];
    const manures = [...imported, ...generated];

    const filteredManures = manures.filter(
      (manure) => manure.ManureTypeName === formData?.ManureMaterialType,
    );

    const items = filteredManures.map((manure, index) => ({
      id: `${manure.UniqueMaterialName}-${index}`,
      label: manure.ManagedManureName ?? '',
      manure,
    }));

    setManureList(items);
  }, [formData?.ManureMaterialType, state.nmpFile.years]);

  const notUniqueNameCheck = () => {
    if (isEditingExistingEntry) return false;
    return storageList.some((ele: NMPFileManureStorageSystemsData) => ele.Name === formData.Name);
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    // Prevent default browser page refresh.
    e.preventDefault();

    // If saving included material we find includedMaterial in manureList then save the full item as imported or generated
    const selectedManure = manureList.find((item) => item.id === includedMaterial);
    console.log(selectedManure?.manure);
    if (selectedManure) {
      setFormData((prev: NMPFileManureStorageSystemsData) => {
        const isGenerated = state.nmpFile.years[0]?.GeneratedManures?.some(
          (m: any) => m.UniqueMaterialName === selectedManure.manure.UniqueMaterialName,
        );
        if (isGenerated) {
          return {
            ...prev,
            GeneratedManuresIncludedInSystem: [selectedManure.manure],
          };
        }
        return {
          ...prev,
          ImportedManuresIncludedInSystem: [selectedManure.manure],
        };
      });
    }

    if (notUniqueNameCheck()) {
      console.error('not unique name');
    } else {
      console.log(formData);
      handleSubmit(formData);
      handleDialogClose();
    }
  };

  const handleInputChange = (name: string, value: string | number | boolean | undefined) => {
    setFormData((prev: NMPFileManureStorageSystemsData) => {
      const updatedData = { ...prev, [name]: value };
      return updatedData;
    });
    console.log(formData);
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
                    selectedKey={formData?.ManureMaterialType === 1 ? 'Liquid' : 'Solid'}
                    items={manureTypeOptions}
                    onSelectionChange={(e: Key) => {
                      handleInputChange('ManureMaterialType', e === 'Liquid' ? 1 : 2);
                    }}
                  />
                  <TextField
                    isRequired
                    label="System Name"
                    type="string"
                    name="Name"
                    value={formData.Name}
                    onChange={(e) => {
                      handleInputChange('Name', e);
                    }}
                  />
                </Grid>
                <Grid size={6}>
                  <Select
                    isRequired
                    label="Included Materials"
                    placeholder="Select a manure type first"
                    selectedKey={includedMaterial}
                    items={manureList}
                    onSelectionChange={(e: any) => {
                      setIncludedMaterial(e);
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
                      name="ManureStorageStructures.Name"
                      value={storageStructure.Name}
                      onChange={(e: any) => {
                        setStorageStructure({
                          ...storageStructure,
                          Name: e,
                        });
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
                      Is the storage covered?
                      <YesNoRadioButtons
                        value={booleanChecker(storageStructure.IsStructureCovered)}
                        text=""
                        onChange={(e: any) => {
                          setStorageStructure({
                            ...storageStructure,
                            IsStructureCovered: e,
                          });
                        }}
                        orientation="horizontal"
                      />
                    </div>
                    {/* NOT WORKING */}
                    {storageStructure && (
                      <TextField
                        isRequired
                        label="Uncovered Area of Storage (ft2)"
                        type="number"
                        name="UncoveredArea"
                        value={storageStructure.UncoveredAreaSquareFeet?.toString()}
                        onChange={(e: any) => {
                          setStorageStructure({
                            ...storageStructure,
                            UncoveredAreaSquareFeet: e,
                          });
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
