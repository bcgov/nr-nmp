/**
 * @summary This is the modal for the Storage page
 */
import { Key, useState, useMemo, FormEvent } from 'react';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import {
  Button,
  ButtonGroup,
  Checkbox,
  CheckboxGroup,
  Form,
  Select,
  TextField,
} from '@bcgov/design-system-react-components';
import { formCss } from '../../common.styles';
import MANURE_TYPE_OPTIONS from '@/constants/ManureTypeOptions';
import YesNoRadioButtons from '@/components/common/YesNoRadioButtons/YesNoRadioButtons';
import useAppState from '@/hooks/useAppState';
import { ManureInSystem, ManureStorage, NMPFileManureStorageSystem } from '@/types';
import DEFAULT_NMPFILE_MANURE_STORAGE from '@/constants/DefaultNMPFileManureStorage';
import { Modal } from '@/components/common';
import { ModalProps } from '@/components/common/Modal/Modal';

type ModalComponentProps = {
  initialModalData?: NMPFileManureStorageSystem;
  rowEditIndex?: number;
  unassignedManures: ManureInSystem[];
  handleDialogClose: () => void;
};

export default function StorageModal({
  initialModalData,
  rowEditIndex,
  unassignedManures,
  handleDialogClose,
  ...props
}: ModalComponentProps & Omit<ModalProps, 'title' | 'children' | 'onOpenChange'>) {
  const { state, dispatch } = useAppState();
  const [formData, setFormData] = useState<NMPFileManureStorageSystem>(
    initialModalData || DEFAULT_NMPFILE_MANURE_STORAGE,
  );
  // Need to maintain a string[] for the CheckboxGroup
  const selectedManureNames = useMemo(
    () => formData.manuresInSystem.map((m) => m.data.ManagedManureName),
    [formData],
  );
  const [fullManureList, setFullManureList] = useState<ManureInSystem[]>(
    [...unassignedManures, ...formData.manuresInSystem].sort((a, b) =>
      a.data.ManagedManureName.localeCompare(b.data.ManagedManureName),
    ),
  );

  const availableManures: ManureInSystem[] = useMemo(
    () => fullManureList.filter((m) => m.data.ManureType === formData.manureType),
    [formData, fullManureList],
  );

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newList = [...(state.nmpFile.years[0].ManureStorageSystems || [])];
    if (rowEditIndex !== undefined) {
      newList[rowEditIndex] = formData;
    } else {
      newList.push(formData);
    }
    dispatch({
      type: 'SAVE_MANURE_STORAGE_SYSTEMS',
      year: state.nmpFile.farmDetails.Year!,
      newManureStorageSystems: newList,
    });
    handleDialogClose();
  };

  const handleInputChange = (
    changes: Partial<Omit<NMPFileManureStorageSystem, 'manureStorageStructures'>>,
  ) => {
    setFormData((prev) => ({ ...prev, ...changes }));
  };

  const handleSelectedChange = (selected: string[]) => {
    const selectedManures: ManureInSystem[] = [];
    setFullManureList((prev) =>
      prev.map((manure) => {
        let newManure: ManureInSystem;
        if (selected.includes(manure.data.ManagedManureName)) {
          newManure = { ...manure, data: { ...manure.data, AssignedToStoredSystem: true } };
          selectedManures.push(newManure);
        } else {
          newManure = { ...manure, data: { ...manure.data, AssignedToStoredSystem: false } };
        }
        return newManure;
      }),
    );
    setFormData((prev) => ({ ...prev, manuresInSystem: selectedManures }));
  };

  const handleStorageChange = (changes: Partial<ManureStorage>) => {
    // TODO: Adapt this to work with multiple storages. I think this version of the modal always edits the 1st storage?
    setFormData((prev) => ({
      ...prev,
      manureStorageStructures: { ...prev.manureStorageStructures, ...changes },
    }));
  };

  return (
    <Modal
      onOpenChange={handleDialogClose}
      title="Storage System Details"
      {...props}
    >
      <Form
        css={formCss}
        onSubmit={handleSubmit}
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
                selectedKey={formData.manureType}
                items={MANURE_TYPE_OPTIONS}
                onSelectionChange={(e: Key) => {
                  handleInputChange({ manureType: e as number, manuresInSystem: [] });
                  setFullManureList((prev) =>
                    prev.map((m) => ({ ...m, data: { ...m.data, AssignedToStoredSystem: false } })),
                  );
                }}
              />
              <TextField
                isRequired
                label="System Name"
                type="string"
                value={formData.name}
                onChange={(e) => {
                  handleInputChange({ name: e });
                }}
              />
            </Grid>
            <Grid size={6}>
              <CheckboxGroup
                isRequired
                value={selectedManureNames}
                onChange={handleSelectedChange}
              >
                {availableManures.map((manure) => (
                  <Checkbox
                    key={manure.data.ManagedManureName}
                    value={manure.data.ManagedManureName}
                  >
                    {manure.data.ManagedManureName}
                  </Checkbox>
                ))}
              </CheckboxGroup>
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
                  name="manureStorageStructures.Name"
                  value={formData.manureStorageStructures.name}
                  onChange={(e: any) => {
                    handleStorageChange({ name: e });
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
                    value={formData.manureStorageStructures.isStructureCovered}
                    text=""
                    onChange={(e: boolean) => {
                      handleStorageChange({ isStructureCovered: e });
                    }}
                    orientation="horizontal"
                  />
                </div>
                {!formData.manureStorageStructures.isStructureCovered && (
                  <TextField
                    isRequired
                    label="Uncovered Area of Storage (ft2)"
                    type="number"
                    value={String(formData.manureStorageStructures.uncoveredAreaSqFt)}
                    onChange={(e: string) => {
                      handleStorageChange({ uncoveredAreaSqFt: Number(e) });
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
    </Modal>
  );
}
