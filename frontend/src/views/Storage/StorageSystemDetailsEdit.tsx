import React, { useState, useMemo } from 'react';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import { Checkbox, CheckboxGroup, TextField } from '@bcgov/design-system-react-components';
import { Select } from '@/components/common';
import { formGridBreakpoints } from '../../common.styles';
import MANURE_TYPE_OPTIONS from '@/constants/ManureTypeOptions';
import YesNoRadioButtons from '@/components/common/YesNoRadioButtons/YesNoRadioButtons';
import { ManureInSystem, ManureType } from '@/types';
import {
  NMPFileManureStorageSystem,
  LiquidManureStorageSystem,
  SolidManureStorageSystem,
} from '@/types/NMPFileManureStorageSystem';

type StorageSystemDetailsEditProps = {
  formData: NMPFileManureStorageSystem;
  setFormData: React.Dispatch<React.SetStateAction<NMPFileManureStorageSystem>>;
  unassignedManures: ManureInSystem[];
};

export default function StorageSystemDetailsEdit({
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
    () => fullManureList.filter((m) => m.data.ManureType === formData.manureType),
    [formData, fullManureList],
  );

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
              handleInputChange({ manureType: e as number, manuresInSystem: [] });
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
      {formData.manureType === ManureType.Liquid && (
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
                value={formData.hasSeperation}
                text=""
                onChange={(e: boolean) => {
                  handleInputChange({ hasSeperation: e });
                }}
                orientation="horizontal"
              />
            </div>
            {formData.hasSeperation === true && (
              <div style={{ display: 'flex', width: '100%' }}>
                <div style={{ paddingRight: '2em' }}>
                  <TextField
                    isRequired
                    label="% of liquid volume separated"
                    type="number"
                    value={String(formData.percentLiquidSeperation)}
                    onChange={(e: string) => {
                      const solidsSeparatedGallons = totalManureGallons * (Number(e) / 100);
                      const separatedLiquidsGallons = totalManureGallons - solidsSeparatedGallons;
                      const separatedSolidsTons = (solidsSeparatedGallons / 264.172) * 0.5;
                      handleInputChange({
                        percentLiquidSeperation: Number(e),
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
              <p>
                Separated liquids
                <p>{formData.separatedLiquidsUSGallons} U.S. Gallons</p>
              </p>
              <p>
                Separated solids
                <p>{formData.separatedSolidsTons} tons</p>
              </p>
            </div>
          </Grid>
        </Grid>
      )}
    </>
  );
}
