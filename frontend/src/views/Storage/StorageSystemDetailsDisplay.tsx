import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import { formGridBreakpoints } from '../../common.styles';
import { ManureType } from '@/types';
import { NMPFileManureStorageSystem } from '@/types/NMPFileManureStorageSystem';

type StorageSystemDetailsDisplayProps = {
  formData: NMPFileManureStorageSystem;
};

export default function StorageSystemDetailsDisplay({
  formData,
}: StorageSystemDetailsDisplayProps) {
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
                  <div
                    style={{ marginBottom: '0.15rem' }}
                    className="bcds-react-aria-Select--Label"
                  >
                    Yard and Roof Area (ft2)
                  </div>
                  <span>{formData.runoffAreaSqFt}</span>
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
                  <div
                    style={{ marginBottom: '0.15rem' }}
                    className="bcds-react-aria-Select--Label"
                  >
                    % of liquid volume separated
                  </div>
                  <span>{formData.percentLiquidSeperation}</span>
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
