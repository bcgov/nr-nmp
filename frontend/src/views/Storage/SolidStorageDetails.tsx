import Grid from '@mui/material/Grid';
import { TextField } from '@bcgov/design-system-react-components';
import { formGridBreakpoints } from '../../common.styles';
import YesNoRadioButtons from '@/components/common/YesNoRadioButtons/YesNoRadioButtons';
import { SolidManureStorageSystem, ManureStorage } from '@/types';

type SolidStorageDetailsProps = {
  formData: SolidManureStorageSystem;
};

export default function SolidStorageDetails({ formData }: SolidStorageDetailsProps) {
  const handleStorageChange = (changes: Partial<ManureStorage>) => {
    setFormData((prev) => ({
      ...prev,
      manureStorageStructures: { ...prev.manureStorageStructures, ...changes },
    }));
  };

  return (
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
          value={formData.manureStorage.name}
          onChange={(e: any) => {
            handleStorageChange({ name: e });
          }}
        />
        <YesNoRadioButtons
          value={formData.manureStorage.isStructureCovered}
          text="Is the storage covered?"
          onChange={(e: boolean) => {
            handleStorageChange({ isStructureCovered: e });
          }}
          orientation="horizontal"
        />
        {!formData.manureStorage.isStructureCovered && (
          <TextField
            isRequired
            label="Uncovered Area of Storage (ft2)"
            type="number"
            value={String(formData.manureStorage.uncoveredAreaSqFt)}
            onChange={(e: string) => {
              handleStorageChange({ uncoveredAreaSqFt: Number(e) });
            }}
          />
        )}
      </Grid>
    </Grid>
  );
}
