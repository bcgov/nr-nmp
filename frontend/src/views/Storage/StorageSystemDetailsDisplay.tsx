import React, { useState, useMemo } from 'react';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import { TextField } from '@bcgov/design-system-react-components';
import { formGridBreakpoints } from '../../common.styles';
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

  const handleInputChange = (
    changes: Partial<SolidManureStorageSystem> | Partial<LiquidManureStorageSystem>,
  ) => {
    setFormData((prev) => ({ ...prev, ...changes }) as NMPFileManureStorageSystem);
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
          <div
            style={{ marginBottom: '0.15rem' }}
            className="bcds-react-aria-Select--Label"
          >
            Manure Type
          </div>
          <span>{ManureType[formData.manureType]}</span>
          <div
            style={{ marginBottom: '0.15rem' }}
            className="bcds-react-aria-Select--Label"
          >
            System Name
          </div>
          <span>{formData.name}</span>
        </Grid>
        <Grid
          container
          size={6}
        >
          <div
            style={{ marginBottom: '0.15rem' }}
            className="bcds-react-aria-Select--Label"
          >
            Materials selected to include
          </div>
          <div>
            <ul>
              {formData.manuresInSystem.map((m) => (
                <li key={m.data.ManagedManureName}>{m.data.ManagedManureName}</li>
              ))}
            </ul>
          </div>
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
                <div
                  style={{ marginBottom: '0.15rem' }}
                  className="bcds-react-aria-Select--Label"
                >
                  Does yard or roof runoff enter the storage?
                </div>
                <span>{formData.getsRunoff ? 'Yes' : 'No'}</span>
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
            </div>
            <span>{formData.hasSeperation ? 'Yes' : 'No'}</span>
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
