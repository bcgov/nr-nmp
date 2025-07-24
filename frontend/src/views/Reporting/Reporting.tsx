import { useRef, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import { Button, ButtonGroup } from '@bcgov/design-system-react-components';
import Grid from '@mui/material/Grid';
import { useNavigate } from 'react-router-dom';
import { SectionHeader, StyledContent, Error } from './reporting.styles';
import { AppTitle, PageTitle, ProgressStepper } from '../../components/common';
import { CALCULATE_NUTRIENTS } from '@/constants/routes';
import CompleteReportTemplate from './ReportTemplates/CompleteReportTemplate';
import RecordKeepingSheets from './ReportTemplates/RecordKeepingSheetsTemplate';

import useAppState from '@/hooks/useAppState';
import { ManureInSystem } from '@/types';
import { formGridBreakpoints } from '@/common.styles';

export default function FieldList() {
  const reportRef = useRef(null);
  const recordRef = useRef(null);

  const { state } = useAppState();
  const navigate = useNavigate();

  const unassignedManures = useMemo(() => {
    const generatedManures = state.nmpFile?.years[0].GeneratedManures || [];
    const importedManures = state.nmpFile?.years[0].ImportedManures || [];
    const unassignedM: ManureInSystem[] = [];
    const assignedM: ManureInSystem[] = [];
    (generatedManures || []).forEach((manure) => {
      if (manure.AssignedToStoredSystem) {
        assignedM.push({ type: 'Generated', data: manure });
      } else {
        unassignedM.push({ type: 'Generated', data: manure });
      }
    });
    (importedManures || []).forEach((manure) => {
      if (manure.AssignedToStoredSystem) {
        assignedM.push({ type: 'Imported', data: manure });
      } else {
        unassignedM.push({ type: 'Imported', data: manure });
      }
    });
    return unassignedM;
  }, [state.nmpFile?.years]);

  async function downloadBlob() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(state.nmpFile)], { type: 'application/json' }),
    );
    const a = document.createElement('a');
    a.href = url;

    const prependDate = new Date().toLocaleDateString('sv-SE', { dateStyle: 'short' });
    const farmName = state.nmpFile?.farmDetails?.FarmName;

    a.download = `${prependDate}-${farmName}.nmp`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  const makeFullReportPdf = async () => {
    // eslint-disable-next-line new-cap
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'px',
      format: 'a4',
      putOnlyUsedFonts: true,
      floatPrecision: 16,
      hotfixes: ['px_scaling'],
    });
    if (reportRef.current) {
      doc.html(reportRef.current, {
        callback(output) {
          const prependDate = new Date().toLocaleDateString('sv-SE', { dateStyle: 'short' });
          const farmName = state.nmpFile?.farmDetails?.FarmName;
          output.save(`${prependDate}-${farmName}-Full-Report.pdf`);
        },
        margin: [24, 24, 24, 24],
        width: 1024,
        windowWidth: 1024,
        autoPaging: 'text',
      });
    }
  };

  const makeRecordPdf = async () => {
    // eslint-disable-next-line new-cap
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'px',
      format: 'a4',
      putOnlyUsedFonts: true,
      floatPrecision: 16,
      hotfixes: ['px_scaling'],
    });
    if (recordRef.current) {
      doc.html(recordRef.current, {
        callback(output) {
          const prependDate = new Date().toLocaleDateString('sv-SE', { dateStyle: 'short' });
          const farmName = state.nmpFile?.farmDetails?.FarmName;
          output.save(`${prependDate}-${farmName}-Record-Keeping.pdf`);
        },
        margin: [24, 24, 24, 24],
        width: 1024,
        windowWidth: 1024,
        autoPaging: 'text',
      });
    }
  };

  const handlePreviousPage = () => {
    navigate(CALCULATE_NUTRIENTS);
  };

  return (
    <StyledContent>
      <ProgressStepper />
      <AppTitle />
      <PageTitle title="Reporting" />

      {unassignedManures.length > 0 && (
        <Grid
          container
          sx={{ marginTop: '1rem' }}
        >
          <Error>
            The following manures have not been assigned:
            <ul>
              {unassignedManures.map((manure, idx) => (
                <span key={`${manure.type}-${manure.data?.ManureName || idx}`}>
                  {manure.type} - {manure.data?.ManureName || 'Unnamed'}
                </span>
              ))}
            </ul>
          </Error>
        </Grid>
      )}

      <Grid
        container
        spacing={2}
        sx={{ marginTop: '1rem', marginBottom: '2rem' }}
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
              <Button onPress={() => makeFullReportPdf()}>
                <div style={{ width: '100%', textAlign: 'center' }}>Complete report</div>
              </Button>
              <Button onPress={() => makeRecordPdf()}>Record keeping sheets</Button>
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
      <ButtonGroup
        alignment="start"
        ariaLabel="A group of buttons"
        orientation="horizontal"
      >
        <Button
          size="medium"
          aria-label="Back"
          variant="secondary"
          onPress={handlePreviousPage}
        >
          Back
        </Button>
        {/* Go to BC soil nutrient testing site */}
        <Button
          size="medium"
          aria-label="Next"
          variant="primary"
          onPress={() => {
            navigate(
              'https://www2.gov.bc.ca/gov/content/industry/agriculture-seafood/agricultural-land-and-' +
                'environment/soil-nutrients/nutrient-management/what-to-apply/soil-nutrient-testing',
            );
          }}
        >
          Finished
        </Button>
      </ButtonGroup>
      <div style={{ height: '0px', overflow: 'hidden' }}>
        <div ref={reportRef}>
          <CompleteReportTemplate />
        </div>
        <div ref={recordRef}>
          <RecordKeepingSheets />
        </div>
      </div>
    </StyledContent>
  );
}
