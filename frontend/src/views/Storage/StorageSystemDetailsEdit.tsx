import React, { useState, useMemo } from 'react';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import { Checkbox, CheckboxGroup } from '@bcgov/design-system-react-components';
import { NumberField, Select, TextField } from '@/components/common';
import { formGridBreakpoints } from '../../common.styles';
import MANURE_TYPE_OPTIONS from '@/constants/ManureTypeOptions';
import YesNoRadioButtons from '@/components/common/YesNoRadioButtons/YesNoRadioButtons';
import { ManureInSystem, ManureType } from '@/types';
import {
  NMPFileManureStorageSystem,
  LiquidManureStorageSystem,
  SolidManureStorageSystem,
} from '@/types/NMPFileManureStorageSystem';
import { StorageModalFormData } from './types';
import {
  DEFAULT_LIQUID_MANURE_STORAGE,
  DEFAULT_LIQUID_MANURE_SYSTEM,
  DEFAULT_SOLID_MANURE_STORAGE,
  DEFAULT_SOLID_MANURE_SYSTEM,
} from '@/constants';

type StorageSystemDetailsEditProps = {
  mode: 'create' | 'system_edit';
  formData: StorageModalFormData;
  setFormData: React.Dispatch<React.SetStateAction<StorageModalFormData>>;
  unassignedManures: ManureInSystem[];
};

export default function StorageSystemDetailsEdit({
  mode,
  formData,
  setFormData,
  unassignedManures,
}: StorageSystemDetailsEditProps) {
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
    () => fullManureList.filter((m) => m.data.manureType === formData.manureType),
    [formData, fullManureList],
  );

  // Reset the form when the manure type changes
  const handleManureTypeChange = (newType: ManureType) => {
    setFormData((prev) => {
      if (prev.manureType === newType) return prev;

      let next: NMPFileManureStorageSystem;
      if (newType === ManureType.Liquid) {
        next = {
          ...DEFAULT_LIQUID_MANURE_SYSTEM,
          name: prev.name,
        };
        if (prev.manureType === ManureType.Solid) {
          next.manureStorages = [
            {
              ...DEFAULT_LIQUID_MANURE_STORAGE,
              name: prev.manureStorage.name,
              isStructureCovered: prev.manureStorage.isStructureCovered,
            },
          ];
        }
      } else {
        next = {
          ...DEFAULT_SOLID_MANURE_SYSTEM,
          name: prev.name,
          uuid: prev.uuid,
        };
        if (prev.manureType === ManureType.Liquid) {
          next.manureStorage = {
            ...DEFAULT_SOLID_MANURE_STORAGE,
            name: prev.manureStorages[0].name,
            isStructureCovered: prev.manureStorages[0].isStructureCovered,
          };
        }
      }
      return next;
    });
  };

  const handleInputChange = (
    changes: Partial<SolidManureStorageSystem> | Partial<LiquidManureStorageSystem>,
  ) => {
    setFormData((prev) => ({ ...prev, ...changes }) as NMPFileManureStorageSystem);
  };

  const handleSelectedChange = (selected: string[]) => {
    const selectedManures: ManureInSystem[] = [];
    setFullManureList((prev) =>
      prev.map((manure) => {
        let newManure: ManureInSystem;
        if (selected.includes(manure.data.ManagedManureName)) {
          newManure = {
            ...manure,
            data: { ...manure.data, AssignedToStoredSystem: true },
          } as ManureInSystem;
          selectedManures.push(newManure);
        } else {
          newManure = {
            ...manure,
            data: { ...manure.data, AssignedToStoredSystem: false },
          } as ManureInSystem;
        }
        return newManure;
      }),
    );
    setFormData((prev) => ({ ...prev, manuresInSystem: selectedManures }));
  };

  return (
    <>
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
            onSelectionChange={(e) => {
              handleManureTypeChange(e as number);
              setFullManureList((prev) =>
                prev.map(
                  (m) =>
                    ({
                      ...m,
                      data: { ...m.data, AssignedToStoredSystem: false },
                    }) as ManureInSystem,
                ),
              );
            }}
            isDisabled={mode !== 'create'}
            style={{ flexGrow: 1 }}
          />
          <TextField
            isRequired
            label="System Name"
            type="string"
            value={formData.name}
            onChange={(e) => handleInputChange({ name: e })}
          />
        </Grid>
        <Grid
          container
          size={6}
        >
          <CheckboxGroup
            aria-label="Manures in System"
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
          {formData.manureType === ManureType.Liquid && (
            <>
              <Grid
                container
                size={6}
              >
                <YesNoRadioButtons
                  value={formData.getsRunoff}
                  text="Does yard or roof runoff enter the storage?"
                  onChange={(e: boolean) => {
                    handleInputChange({ getsRunoff: e });
                  }}
                  orientation="horizontal"
                />
              </Grid>
              {formData.getsRunoff === true && (
                <Grid
                  container
                  size={6}
                >
                  <NumberField
                    isRequired
                    label="Yard and Roof Area (ft2)"
                    value={formData.runoffAreaSqFt}
                    onChange={(e: number) => {
                      handleInputChange({ runoffAreaSqFt: e });
                    }}
                  />
                </Grid>
              )}
            </>
          )}
        </Grid>
      </Grid>
      {formData.manureType === ManureType.Liquid && (
        <>
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
              <div style={{ marginBottom: '0.15rem' }}>
                <YesNoRadioButtons
                  value={formData.hasSeperation}
                  text="Is there solid/liquid separation?"
                  onChange={(e: boolean) => {
                    handleInputChange({ hasSeperation: e });
                  }}
                  orientation="horizontal"
                />
              </div>
              {formData.hasSeperation && (
                <div style={{ display: 'flex', width: '100%' }}>
                  <div style={{ paddingRight: '2em' }}>
                    <NumberField
                      isRequired
                      label="% of liquid volume separated"
                      value={formData.percentLiquidSeperation}
                      onChange={(e) => {
                        const solidsSeparatedGallons = totalManureGallons * (e / 100);
                        const separatedLiquidsGallons = totalManureGallons - solidsSeparatedGallons;
                        const separatedSolidsTons = (solidsSeparatedGallons / 264.172) * 0.5;
                        handleInputChange({
                          percentLiquidSeperation: e,
                          separatedLiquidsUSGallons: Math.round(separatedLiquidsGallons),
                          separatedSolidsTons: Math.round(separatedSolidsTons),
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
                {formData.hasSeperation && (
                  <>
                    <p>
                      Separated liquids
                      <p>{formData.separatedLiquidsUSGallons} U.S. Gallons</p>
                    </p>
                    <p>
                      Separated solids
                      <p>{formData.separatedSolidsTons} tons</p>
                    </p>
                  </>
                )}
              </div>
            </Grid>
          </Grid>
        </>
      )}
    </>
  );
}
