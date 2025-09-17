/* eslint-disable prefer-const */
import { useContext, useEffect, useMemo, useState } from 'react';
import { jsPDF } from 'jspdf';
import { Button, ButtonGroup } from '@bcgov/design-system-react-components';
import Grid from '@mui/material/Grid';
import { useNavigate } from 'react-router-dom';
import '../../../public/BCSans-normal';
import '../../../public/BCSans-bold';
import '../../../public/BCSans-italic';
import '../../../public/BCSans-bolditalic';

import { SectionHeader } from './reporting.styles';
import { View } from '../../components/common';
import { CALCULATE_NUTRIENTS } from '@/constants/routes';
import useAppState from '@/hooks/useAppState';
import { APICacheContext } from '@/context/APICacheContext';
import { FertilizerUnit, SoilTestMethods } from '@/types';
import { DAIRY_COW_ID } from '@/constants';
import { aggregateFertilizers, downloadNMPFile } from './ReportingComponents/reportingUtils';
import {
  generateApplicationSchedule,
  generateManureInventory,
  generateManureAndCompostUse,
  generateFertilizerRequired,
  generateFieldSummary,
  generateManureAndCompostAnalysis,
  generateSoilTestResults,
} from './ReportingComponents/reportSections';

export default function Reporting() {
  const { state } = useAppState();
  const navigate = useNavigate();
  const apiCache = useContext(APICacheContext);
  const [fertilizerUnits, setFertilizerUnits] = useState<FertilizerUnit[]>([]);
  const [soilTestMethods, setSoilTestMethods] = useState<SoilTestMethods[]>([]);

  const unassignedManures = useMemo(
    () =>
      [
        ...(state.nmpFile.years[0].generatedManures || []),
        ...(state.nmpFile.years[0].importedManures || []),
      ].filter((m) => !m.assignedToStoredSystem),
    [state.nmpFile.years],
  );

  const isDairyCattle = useMemo(() => {
    const animalList = state.nmpFile?.years[0].farmAnimals || [];
    return animalList.some((animal) => animal.animalId === DAIRY_COW_ID);
  }, [state.nmpFile?.years]);

  // Fetch all of the data tables needed to generate the report
  useEffect(() => {
    apiCache
      .callEndpoint('api/fertilizerunits/')
      .then((response: { status?: any; data: FertilizerUnit[] }) => {
        if (response.status === 200) {
          setFertilizerUnits(response.data);
        }
      });
    apiCache
      .callEndpoint('api/soiltestmethods/')
      .then((response: { status?: any; data: SoilTestMethods[] }) => {
        if (response.status === 200) {
          setSoilTestMethods(response.data);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const makeFullReportPdf = async () => {
    // eslint-disable-next-line new-cap
    const doc = new jsPDF();
    doc.setFont('BCSans');
    const pageWidth: number = doc.internal.pageSize.getWidth() - 30;
    const nmpFileYear = state.nmpFile.years[0];
    const { farmName, year: yearStr } = state.nmpFile.farmDetails;
    const year = Number(yearStr);

    // TODO: Add Table of Contents as the first page and page #s

    // Generate each section of the PDF
    generateApplicationSchedule(doc, nmpFileYear, fertilizerUnits, farmName, year, pageWidth);
    generateManureInventory(doc, nmpFileYear, unassignedManures, farmName, year, pageWidth);
    generateManureAndCompostUse(doc, nmpFileYear, farmName, year, pageWidth);

    // Generate fertilizer required section
    const fertilizers = aggregateFertilizers(nmpFileYear, fertilizerUnits);
    generateFertilizerRequired(doc, fertilizers, farmName, year, pageWidth);

    // Generate field summaries
    generateFieldSummary(
      doc,
      nmpFileYear,
      fertilizerUnits,
      soilTestMethods,
      farmName,
      year,
      pageWidth,
    );

    // Generate additional sections
    generateManureAndCompostAnalysis(
      doc,
      nmpFileYear,
      unassignedManures,
      isDairyCattle,
      farmName,
      year,
      pageWidth,
    );
    generateSoilTestResults(doc, nmpFileYear, soilTestMethods, farmName, year, pageWidth);

    doc.save('table.pdf');
  };

  const downloadBlob = () => {
    downloadNMPFile(state.nmpFile);
  };

  const handlePreviousPage = () => {
    navigate(CALCULATE_NUTRIENTS);
  };

  const handleNextPage = () => {
    window.location.href =
      'https://www2.gov.bc.ca/gov/content/industry/agriculture-seafood/agricultural-land-and-' +
      'environment/soil-nutrients/nutrient-management/what-to-apply/soil-nutrient-testing';
  };

  return (
    <View
      title="Reporting"
      handleBack={handlePreviousPage}
      handleNext={handleNextPage}
      nextBtnText="Finish"
    >
      {/* only show if you have dairy cattle */}
      {unassignedManures.length > 0 && isDairyCattle && (
        <Grid
          container
          sx={{ marginTop: '1rem' }}
        >
          <div style={{ border: '1px solid #c81212', width: '100%' }}>
            The following materials are not stored:
            <ul>
              {unassignedManures.map((manure) => (
                <li key={`${manure.managedManureName}`}>
                  {manure.manureType} - {manure.managedManureName}
                </li>
              ))}
            </ul>
          </div>
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
              <Button onPress={() => {}}>Record keeping sheets</Button>
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
    </View>
  );
}
