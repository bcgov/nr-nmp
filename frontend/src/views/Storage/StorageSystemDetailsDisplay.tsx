import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import { ManureType } from '@/types';
import { NMPFileManureStorageSystem } from '@/types/NMPFileManureStorageSystem';
import { Text } from './StorageModal.styles';

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
        size={12}
        spacing={1}
      >
        <Grid
          container
          size={6}
        >
          <Text className="bcds-react-aria-Text disabled small">Manure Type</Text>
          <Text className="bcds-react-aria-Text disabled small">
            {ManureType[formData.manureType]}
          </Text>
          <Text className="bcds-react-aria-Text disabled small">System Name</Text>
          <Text className="bcds-react-aria-Text disabled small">{formData.name}</Text>
        </Grid>
        <Grid
          container
          size={6}
          spacing={0}
        >
          <Text className="bcds-react-aria-Text disabled small">Materials selected to include</Text>
          <div>
            <ul css={{ marginBottom: '0.5rem' }}>
              {formData.manuresInSystem.map((m) => (
                <li
                  className="bcds-react-aria-Text disabled small"
                  key={m.data.ManagedManureName}
                >
                  {m.data.ManagedManureName}
                </li>
              ))}
            </ul>
          </div>
        </Grid>
        {formData.manureType === ManureType.Liquid && (
          <>
            <Grid
              container
              size={6}
            >
              <Text className="bcds-react-aria-Text disabled small">
                Does yard or roof runoff enter the storage?
              </Text>
              <Text className="bcds-react-aria-Text disabled small">
                {formData.getsRunoff ? 'Yes' : 'No'}
              </Text>
            </Grid>
            {formData.getsRunoff && (
              <Grid
                container
                size={6}
              >
                <Text className="bcds-react-aria-Text disabled small">
                  Yard and Roof Area (ft2)
                </Text>
                <Text className="bcds-react-aria-Text disabled small">
                  {formData.runoffAreaSqFt}
                </Text>
              </Grid>
            )}
          </>
        )}
      </Grid>
      <Divider
        aria-hidden="true"
        component="div"
        css={{ marginTop: '1rem', marginBottom: '1rem' }}
      />
      {formData.manureType === ManureType.Liquid && (
        <Grid
          container
          size={12}
          direction="row"
          spacing={2}
        >
          <Grid
            container
            size={6}
            direction="row"
          >
            <Text className="bcds-react-aria-Text disabled small">
              Is there solid/liquid separation?
            </Text>
            <Text className="bcds-react-aria-Text disabled small">
              {formData.hasSeperation ? 'Yes' : 'No'}
            </Text>
            {formData.hasSeperation === true && (
              <>
                <Text className="bcds-react-aria-Text disabled small">
                  % of liquid volume separated
                </Text>
                <Text className="bcds-react-aria-Text disabled small">
                  {formData.percentLiquidSeperation}
                </Text>
              </>
            )}
          </Grid>
          <Grid
            container
            size={6}
            direction="row"
          >
            <Text className="bcds-react-aria-Text disabled small">Separated liquids</Text>
            <Text className="bcds-react-aria-Text disabled small">
              {formData.separatedLiquidsUSGallons} U.S. Gallons
            </Text>
            <Text className="bcds-react-aria-Text disabled small">Separated solids</Text>
            <Text className="bcds-react-aria-Text disabled small">
              {formData.separatedSolidsTons} tons
            </Text>
          </Grid>
        </Grid>
      )}
    </>
  );
}
