/**
 * @summary This is the modal for imported (i.e. manually input) manures
 */
import { ComponentProps, useContext, useEffect, useState } from 'react';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import { Button, ButtonGroup, Dialog, Modal, Form } from '@bcgov/design-system-react-components';
import { NumberField, Select, TextField } from '@/components/common';

import { APICacheContext } from '@/context/APICacheContext';
import {
  DefaultSolidManureConversionFactors,
  DefaultLiquidManureConversionFactors,
  MANURE_TYPE_OPTIONS,
} from '@/constants';
import {
  formCss,
  modalHeaderStyle,
  modalPaddingStyle,
  formGridBreakpoints,
} from '../../common.styles';
import {
  NMPFileImportedManureData,
  LiquidManureConversionFactors,
  SolidManureConversionFactors,
  ManureType,
} from '@/types';

type ModalComponentProps = {
  // TODO: Change this. initialModalData should be undefined if there isn't existing data
  // The parent shouldn't handle its form state
  initialModalData: NMPFileImportedManureData;
  handleDialogClose: () => void;
  handleSubmit: (formData: NMPFileImportedManureData) => void;
  manuresList: any;
};

export default function ManureImportModal({
  initialModalData,
  handleDialogClose,
  handleSubmit,
  manuresList,
  ...props
}: ModalComponentProps & ComponentProps<typeof Modal>) {
  const apiCache = useContext(APICacheContext);

  const [formData, setFormData] = useState<NMPFileImportedManureData>(initialModalData);
  const [isEditingExistingEntry] = useState<boolean>(!!initialModalData?.UniqueMaterialName); // this hurts
  // const [subtypeOptions, setSubtypeOptions] = useState<{ id: string; label: string }[]>([]);

  const [solidManureDropdownOptions, setSolidManureDropdownOptions] = useState<
    SolidManureConversionFactors[]
  >([DefaultSolidManureConversionFactors]);
  const [liquidManureDropdownOptions, setLiquidManureDropdownOptions] = useState<
    LiquidManureConversionFactors[]
  >([DefaultLiquidManureConversionFactors]);

  useEffect(() => {
    apiCache
      .callEndpoint('api/liquidmaterialsconversionfactors/')
      .then((response: { status?: any; data: any }) => {
        if (response.status === 200) {
          const { data } = response;
          setLiquidManureDropdownOptions(data);
        }
      });
    apiCache
      .callEndpoint('api/solidmaterialsconversionfactors/')
      .then((response: { status?: any; data: any }) => {
        if (response.status === 200) {
          const { data } = response;
          setSolidManureDropdownOptions(data);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const notUniqueNameCheck = () => {
    if (isEditingExistingEntry) return false;
    return manuresList.some(
      (ele: NMPFileImportedManureData) => ele.UniqueMaterialName === formData.UniqueMaterialName,
    );
  };

  const onSubmit = () => {
    if (notUniqueNameCheck()) {
      console.error('not unique name');
    } else {
      handleSubmit(formData);
      handleDialogClose();
    }
  };

  const handleInputChange = (changes: Partial<NMPFileImportedManureData>) => {
    setFormData((prev: NMPFileImportedManureData) => {
      const updatedData = { ...prev, ...changes };
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
          <span css={modalHeaderStyle}>Add manure</span>
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
                <TextField
                  isRequired
                  label="Material name"
                  value={formData.UniqueMaterialName}
                  onChange={(e: string) => {
                    handleInputChange({ UniqueMaterialName: e });
                  }}
                  maxLength={100}
                  validate={() =>
                    notUniqueNameCheck() ? 'Unique material name required.' : undefined
                  }
                />
              </Grid>
              <Grid size={formGridBreakpoints}>
                <Select
                  isRequired
                  label="Manure Type"
                  placeholder="Select manure type"
                  selectedKey={formData.ManureType}
                  items={MANURE_TYPE_OPTIONS}
                  onSelectionChange={(e) => {
                    handleInputChange({
                      ManureType: e as number,
                      ManagedManureName: `${formData.UniqueMaterialName}, ${ManureType[e as number]}`,
                      // Reset dependent inputs on changes
                      Units: undefined,
                      Moisture: 50,
                    });
                  }}
                  noSort
                />
              </Grid>
              <Grid size={formGridBreakpoints}>
                <NumberField
                  isRequired
                  label="Amount per year"
                  value={formData.AnnualAmount}
                  onChange={(e: number) => {
                    handleInputChange({ AnnualAmount: e });
                  }}
                  minValue={0}
                />
              </Grid>

              {formData.ManureType === 2 && (
                <>
                  <Grid size={formGridBreakpoints}>
                    <Select
                      isRequired
                      label="Units"
                      placeholder="Select a unit"
                      selectedKey={formData.Units}
                      items={solidManureDropdownOptions.map((ele) => ({
                        id: ele.inputunit,
                        label: ele.inputunitname ?? '',
                      }))}
                      onSelectionChange={(e) => {
                        handleInputChange({ Units: e as number });
                      }}
                    />
                  </Grid>
                  <Grid size={formGridBreakpoints}>
                    <NumberField
                      isRequired
                      label="Moisture (%)"
                      value={formData.Moisture}
                      onChange={(e) => handleInputChange({ Moisture: e })}
                      minValue={0}
                      maxValue={100}
                    />
                  </Grid>
                </>
              )}

              {formData.ManureType === 1 && (
                <Grid size={formGridBreakpoints}>
                  <Select
                    isRequired
                    label="Units"
                    placeholder="Select a unit"
                    selectedKey={formData.Units}
                    items={liquidManureDropdownOptions.map((ele) => ({
                      id: ele.inputunit,
                      label: ele.inputunitname ?? '',
                    }))}
                    onSelectionChange={(e) => {
                      handleInputChange({ Units: e as number });
                    }}
                  />
                </Grid>
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
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
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
