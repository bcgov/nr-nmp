/**
 * @summary This is the modal for imported (i.e. manually input) manures
 */
import { useContext, useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import { Form, Modal, NumberField, Select, TextField } from '@/components/common';
import { ModalProps } from '@/components/common/Modal/Modal';

import { APICacheContext } from '@/context/APICacheContext';
import {
  DefaultSolidManureConversionFactors,
  DefaultLiquidManureConversionFactors,
  MANURE_TYPE_OPTIONS,
  DefaultManureFormData,
} from '@/constants';
import { formCss, formGridBreakpoints } from '../../common.styles';
import {
  NMPFileImportedManureData,
  LiquidManureConversionFactors,
  SolidManureConversionFactors,
  ManureType,
} from '@/types';

type ModalComponentProps = {
  initialModalData: NMPFileImportedManureData | undefined;
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
}: ModalComponentProps & Omit<ModalProps, 'title' | 'children' | 'onOpenChange'>) {
  const apiCache = useContext(APICacheContext);

  const [formData, setFormData] = useState<Omit<NMPFileImportedManureData, 'uuid'>>(
    initialModalData || DefaultManureFormData,
  );

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

  const isNameUnique = () => {
    // If this is an existing entry, it's unique
    if (initialModalData) return true;
    // Otherwise, make sure none of the manures in the list have the same name
    return !manuresList.some(
      (ele: NMPFileImportedManureData) => ele.UniqueMaterialName === formData.UniqueMaterialName,
    );
  };

  const onSubmit = () => {
    handleSubmit({ uuid: crypto.randomUUID(), ...formData });
    handleDialogClose();
  };

  const handleInputChange = (changes: Partial<NMPFileImportedManureData>) => {
    setFormData((prev) => {
      const updatedData = { ...prev, ...changes };
      return updatedData;
    });
  };

  return (
    <Modal
      title="Add manure"
      onOpenChange={handleDialogClose}
      {...props}
    >
      <Form
        css={formCss}
        onCancel={handleDialogClose}
        onConfirm={onSubmit}
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
              validate={() => (!isNameUnique() ? 'Unique material name required.' : undefined)}
            />
          </Grid>
          <Grid size={formGridBreakpoints}>
            <Select
              isRequired
              label="Manure Type"
              placeholder="Select manure type"
              selectedKey={formData.manureType}
              items={MANURE_TYPE_OPTIONS}
              onSelectionChange={(e) => {
                handleInputChange({
                  manureType: e as number,
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
            />
          </Grid>

          {formData.manureType === 2 && (
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
                  step={0.1}
                  maxValue={100}
                />
              </Grid>
            </>
          )}

          {formData.manureType === 1 && (
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
      </Form>
    </Modal>
  );
}
