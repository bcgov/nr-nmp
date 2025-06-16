import { Button, ButtonGroup } from '@bcgov/design-system-react-components';
import Grid from '@mui/material/Grid';
import { SectionHeader, StyledContent } from './reporting.styles';
import { AppTitle, PageTitle, ProgressStepper } from '../../components/common';

import useAppService from '@/services/app/useAppService';

export default function FieldList() {
  const { state } = useAppService(); // setNMPFile

  async function downloadBlob() {
    // Quit early if no file
    if (!state.nmpFile) return;

    const nmpData = JSON.parse(state.nmpFile);

    const url = URL.createObjectURL(new Blob([state.nmpFile], { type: 'text/plain' }));
    const a = document.createElement('a');
    a.href = url;

    const prependDate = new Date().toLocaleDateString('sv-SE', { dateStyle: 'short' });
    const farmName = nmpData?.farmDetails?.FarmName;

    a.download = `${prependDate}-${farmName}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <StyledContent>
      <ProgressStepper />
      <AppTitle />
      <PageTitle title="Reporting" />

      <Grid
        container
        spacing={2}
        sx={{ marginTop: '1rem' }}
      >
        <Grid
          size={{ xs: 4 }}
          sx={{
            justifyItems: 'center',
          }}
        >
          <SectionHeader>PDFs (Opens a new file)</SectionHeader>
          <div css={{ paddingBottom: '1rem' }}>
            <ButtonGroup
              alignment="center"
              ariaLabel="A group of buttons"
              orientation="vertical"
            >
              <Button>Complete report</Button>
              <Button>Record keeping sheets</Button>
            </ButtonGroup>
          </div>
        </Grid>
        <Grid
          size={{ xs: 8 }}
          sx={{
            '.MuiGrid-root & div': { marginBottom: '1rem' },
            justifyItems: 'center',
          }}
        >
          <SectionHeader>NMP data file</SectionHeader>
          <div>To continue later, Download file to your computer</div>
          <div>Load a file on the Home page when you want to continue</div>
          <div>
            <Button onPress={() => downloadBlob()}>Download file</Button>
          </div>
        </Grid>
      </Grid>
    </StyledContent>
  );
}
