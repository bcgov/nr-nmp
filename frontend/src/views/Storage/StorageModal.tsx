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
  TextField,
} from '@bcgov/design-system-react-components';
import { formCss, formGridBreakpoints } from '../../common.styles';
import MANURE_TYPE_OPTIONS from '@/constants/ManureTypeOptions';
import YesNoRadioButtons from '@/components/common/YesNoRadioButtons/YesNoRadioButtons';
import useAppState from '@/hooks/useAppState';
import { ManureInSystem, ManureStorage, NMPFileManureStorageSystem } from '@/types';
import DEFAULT_NMPFILE_MANURE_STORAGE from '@/constants/DefaultNMPFileManureStorage';
import { Modal, Select } from '@/components/common';
import { ModalProps } from '@/components/common/Modal/Modal';

type ModalComponentProps = {
  initialModalData?: NMPFileManureStorageSystem;
  rowEditIndex?: number;
  unassignedManures: ManureInSystem[];
  handleDialogClose: () => void;
};

const storageShapeOptions = [
  { id: '1', label: 'Rectangular' },
  { id: '2', label: 'Circular' },
  { id: '3', label: 'SlopedWallRectangular' },
];

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
  // get sum of all entered manures, used for solid and liquid seperation
  const totalManureGallons = useMemo(
    () =>
      fullManureList.reduce(
        (sum, manure) => sum + (manure.data.AnnualAmountUSGallonsVolume || 0),
        0,
      ),
    [fullManureList],
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
      modalStyle={{ width: '700px' }}
    >
      <Form
        css={formCss}
        onSubmit={handleSubmit}
      >
        <Grid
          container
          size={formGridBreakpoints}
          direction="row"
          spacing={2}
        >
          <Grid
            container
            size={6}
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
          <Grid
            container
            size={6}
          >
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
          <Grid
            container
            size={12}
          >
            {formData.manureType === 1 && (
              <>
                <Grid
                  container
                  size={6}
                >
                  <YesNoRadioButtons
                    value={formData.getsRunoffFromRoofsOrYards}
                    text="Does yard or roof runoff enter the storage?"
                    onChange={(e: boolean) => {
                      handleInputChange({ getsRunoffFromRoofsOrYards: e });
                    }}
                    orientation="horizontal"
                  />
                </Grid>
                {formData.getsRunoffFromRoofsOrYards === true && (
                  <Grid
                    container
                    size={6}
                  >
                    <TextField
                      isRequired
                      label="Yard and Roof Area (ft2)"
                      type="number"
                      name="runoffAreaSqFt"
                      value={String(formData.runoffAreaSqFt)}
                      onChange={(e: string) => {
                        handleInputChange({ runoffAreaSqFt: Number(e) });
                      }}
                    />
                  </Grid>
                )}
              </>
            )}
          </Grid>
        </Grid>
        <Divider
          aria-hidden="true"
          component="div"
          css={{ marginTop: '1rem', marginBottom: '1rem' }}
        />

        {formData.manureType === 1 && (
          <Grid
            container
            size={formGridBreakpoints}
            direction="row"
            spacing={2}
          >
            <Grid
              container
              size={6}
              direction="row"
            >
              <div
                style={{ marginBottom: '0.15rem' }}
                className="bcds-react-aria-Select--Label"
              >
                Is there solid/liquid separation?
                <YesNoRadioButtons
                  value={formData.IsThereSolidLiquidSeparation}
                  text=""
                  onChange={(e: boolean) => {
                    handleInputChange({ IsThereSolidLiquidSeparation: e });
                  }}
                  orientation="horizontal"
                />
              </div>
              {formData.IsThereSolidLiquidSeparation === true && (
                <div style={{ display: 'flex', width: '100%' }}>
                  <div style={{ paddingRight: '2em' }}>
                    <TextField
                      isRequired
                      label="% of liquid volume separated"
                      type="number"
                      value={String(formData.PercentageOfLiquidVolumeSeparated)}
                      onChange={(e: string) => {
                        handleInputChange({ PercentageOfLiquidVolumeSeparated: Number(e) });
                        const solidsSeparatedGallons = totalManureGallons * (Number(e) / 100);
                        const separatedLiquidsGallons = totalManureGallons - solidsSeparatedGallons;
                        const separatedSolidsTons = (solidsSeparatedGallons / 264.172) * 0.5;
                        handleInputChange({
                          SeparatedLiquidsUSGallons: Math.round(separatedLiquidsGallons),
                          SeparatedSolidsTons: Math.round(separatedSolidsTons),
                        });
                      }}
                    />
                  </div>
                </div>
              )}
            </Grid>
            <Grid
              container
              size={6}
              direction="row"
            >
              <div style={{ width: 'max-content', fontSize: '12px' }}>
                <p>
                  Separated liquids
                  <p>{formData.SeparatedLiquidsUSGallons} U.S. Gallons</p>
                </p>
                <p>
                  Separated solids
                  <p>{formData.SeparatedSolidsTons} tons</p>
                </p>
              </div>
            </Grid>
          </Grid>
        )}
        <Divider
          aria-hidden="true"
          component="div"
          css={{ marginTop: '1rem', marginBottom: '1rem' }}
        />

        <Grid
          container
          size={formGridBreakpoints}
          direction="row"
          spacing={2}
        >
          <Grid
            container
            size={6}
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
            <YesNoRadioButtons
              value={formData.manureStorageStructures.isStructureCovered}
              text="Is the storage covered?"
              onChange={(e: boolean) => {
                handleStorageChange({ isStructureCovered: e });
              }}
              orientation="horizontal"
            />
            {!formData.manureStorageStructures.isStructureCovered && formData.manureType === 2 && (
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
            {formData.manureType === 1 && (
              <Select
                isRequired
                label="Storage shape"
                selectedKey={
                  storageShapeOptions.find(
                    (option) =>
                      option.id === formData.manureStorageStructures.SelectedStorageStructureShape,
                  )?.label
                }
                items={storageShapeOptions}
                onSelectionChange={(e: any) => {
                  // find storage shape by id
                  const selectedShape = storageShapeOptions.find(
                    (option) => option.id === e,
                  )?.label;
                  handleStorageChange({
                    SelectedStorageStructureShape:
                      selectedShape as ManureStorage['SelectedStorageStructureShape'],
                  });
                }}
              />
            )}
          </Grid>
          <Grid
            container
            size={6}
            direction="row"
          >
            {formData.manureStorageStructures.SelectedStorageStructureShape === 'Circular' && (
              <div>
                <TextField
                  isRequired
                  label="Diameter(ft)"
                  type="number"
                  value={String(formData.manureStorageStructures.CircularDiameter)}
                  onChange={(e: string) => {
                    handleStorageChange({ CircularDiameter: Number(e) });
                  }}
                />
                <TextField
                  isRequired
                  label="Height(ft)"
                  type="number"
                  value={String(formData.manureStorageStructures.CircularHeight)}
                  onChange={(e: string) => {
                    handleStorageChange({ CircularHeight: Number(e) });
                  }}
                />
              </div>
            )}
            {formData.manureStorageStructures.SelectedStorageStructureShape === 'Rectangular' && (
              <div>
                <TextField
                  isRequired
                  label="Length(ft)"
                  type="number"
                  value={String(formData.manureStorageStructures.RectangularLength)}
                  onChange={(e: string) => {
                    handleStorageChange({ RectangularLength: Number(e) });
                  }}
                />
                <TextField
                  isRequired
                  label="Width(ft)"
                  type="number"
                  value={String(formData.manureStorageStructures.RectangularWidth)}
                  onChange={(e: string) => {
                    handleStorageChange({ RectangularWidth: Number(e) });
                  }}
                />
                <TextField
                  isRequired
                  label="Height(ft)"
                  type="number"
                  value={String(formData.manureStorageStructures.RectangularHeight)}
                  onChange={(e: string) => {
                    handleStorageChange({ RectangularHeight: Number(e) });
                  }}
                />
              </div>
            )}
            {formData.manureStorageStructures.SelectedStorageStructureShape ===
              'SlopedWallRectangular' && (
              <div>
                <TextField
                  isRequired
                  label="Diameter(ft)"
                  type="number"
                  value={String(formData.manureStorageStructures.CircularDiameter)}
                  onChange={(e: string) => {
                    handleStorageChange({ CircularDiameter: Number(e) });
                  }}
                />
                <TextField
                  isRequired
                  label="Height(ft)"
                  type="number"
                  value={String(formData.manureStorageStructures.CircularHeight)}
                  onChange={(e: string) => {
                    handleStorageChange({ CircularHeight: Number(e) });
                  }}
                />
                <TextField
                  isRequired
                  label="Diameter(ft)"
                  type="number"
                  value={String(formData.manureStorageStructures.CircularDiameter)}
                  onChange={(e: string) => {
                    handleStorageChange({ CircularDiameter: Number(e) });
                  }}
                />
                <TextField
                  isRequired
                  label="Height(ft)"
                  type="number"
                  value={String(formData.manureStorageStructures.CircularHeight)}
                  onChange={(e: string) => {
                    handleStorageChange({ CircularHeight: Number(e) });
                  }}
                />
              </div>
            )}
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
