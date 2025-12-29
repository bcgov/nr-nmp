/**
 * @summary This is the modal for imported (i.e. manually input) manures
 */
import { useContext, useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import { Form, Modal, NumberField, Select, TextField } from '@/components/common';
import { ModalProps } from '@/components/common/Modal/Modal';

import { APICacheContext } from '@/context/APICacheContext';
import { DEFAULT_IMPORTED_MANURE, MANURE_TYPE_OPTIONS } from '@/constants';
import { formCss, formGridBreakpoints } from '../../common.styles';
import {
  NMPFileImportedManure,
  LiquidManureConversionFactors,
  SolidManureConversionFactors,
  ManureType,
} from '@/types';

type ModalComponentProps = {
  initialModalData: NMPFileImportedManure | undefined;
  handleDialogClose: () => void;
  handleSubmit: (formData: NMPFileImportedManure) => void;
  manuresList: NMPFileImportedManure[];
};

export default function ManureImportModal({
  initialModalData,
  handleDialogClose,
  handleSubmit,
  manuresList,
  ...props
}: ModalComponentProps & Omit<ModalProps, 'title' | 'children' | 'onOpenChange'>) {
  const apiCache = useContext(APICacheContext);

  const [formData, setFormData] = useState<Omit<NMPFileImportedManure, 'uuid'>>(
    initialModalData || DEFAULT_IMPORTED_MANURE,
  );

  const [solidManureDropdownOptions, setSolidManureDropdownOptions] = useState<
    SolidManureConversionFactors[]
  >([]);
  const [liquidManureDropdownOptions, setLiquidManureDropdownOptions] = useState<
    LiquidManureConversionFactors[]
  >([]);

  useEffect(() => {
    apiCache
      .callEndpoint('api/liquidmaterialsconversionfactors/')
      .then((response: { status?: any; data: LiquidManureConversionFactors[] }) => {
        if (response.status === 200) {
          setLiquidManureDropdownOptions(response.data);
        }
      });
    apiCache
      .callEndpoint('api/solidmaterialsconversionfactors/')
      .then((response: { status?: any; data: SolidManureConversionFactors[] }) => {
        if (response.status === 200) {
          setSolidManureDropdownOptions(response.data);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isNameUnique = () => {
    // If this is an existing entry, it's unique
    if (initialModalData) return true;
    // Otherwise, make sure none of the manures in the list have the same name
    return !manuresList.some(
      (ele: NMPFileImportedManure) => ele.uniqueMaterialName === formData.uniqueMaterialName,
    );
  };

  const onSubmit = () => {
    handleSubmit({ uuid: crypto.randomUUID(), ...formData });
    handleDialogClose();
  };

  const handleInputChange = (changes: Partial<NMPFileImportedManure>) => {
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
              value={formData.uniqueMaterialName}
              onChange={(e: string) => {
                handleInputChange({ uniqueMaterialName: e });
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
              value={formData.manureType}
              items={MANURE_TYPE_OPTIONS}
              onChange={(e) => {
                handleInputChange({
                  manureType: e as number,
                  managedManureName: `${formData.uniqueMaterialName}, ${ManureType[e as number]}`,
                  // Reset dependent inputs on changes
                  units: undefined,
                  moisture: 50,
                });
              }}
              noSort
            />
          </Grid>
          <Grid size={formGridBreakpoints}>
            <NumberField
              isRequired
              label="Amount per year"
              value={formData.annualAmount}
              onChange={(e: number) => {
                handleInputChange({ annualAmount: e });
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
                  value={formData.units}
                  items={solidManureDropdownOptions.map((ele) => ({
                    id: ele.inputunit,
                    label: ele.inputunitname ?? '',
                  }))}
                  onChange={(e) => {
                    handleInputChange({ units: e as number });
                  }}
                  autoselectFirst
                />
              </Grid>
              <Grid size={formGridBreakpoints}>
                <NumberField
                  isRequired
                  label="Moisture (%)"
                  value={formData.moisture}
                  onChange={(e) => handleInputChange({ moisture: e })}
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
                value={formData.units}
                items={liquidManureDropdownOptions.map((ele) => ({
                  id: ele.inputunit,
                  label: ele.inputunitname ?? '',
                }))}
                onChange={(e) => {
                  handleInputChange({ units: e as number });
                }}
                autoselectFirst
              />
            </Grid>
          )}
        </Grid>
      </Form>
    </Modal>
  );
}
