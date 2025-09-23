import { useContext, useEffect, useMemo, useState } from 'react';
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
import {
  FertilizerUnit,
  SoilTestMethods,
  SoilTestPhosphorousRange,
  SoilTestPotassiumRange,
} from '@/types';
import { DAIRY_COW_ID } from '@/constants';
import makeFullReportPdf from './makeFullReport';

export default function Reporting() {
  const { state } = useAppState();
  const navigate = useNavigate();
  const apiCache = useContext(APICacheContext);
  const [fertilizerUnits, setFertilizerUnits] = useState<FertilizerUnit[]>([]);
  const [soilTestMethods, setSoilTestMethods] = useState<SoilTestMethods[]>([]);
  const [phosphorousRanges, setPhosphorousRanges] = useState<SoilTestPhosphorousRange[]>([]);
  const [potassiumRanges, setPotassiumRanges] = useState<SoilTestPotassiumRange[]>([]);

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
    apiCache
      .callEndpoint('api/soiltestpotassiumranges/')
      .then((response: { status?: any; data: SoilTestPotassiumRange[] }) => {
        if (response.status === 200) {
          setPotassiumRanges(response.data);
        }
      });
    apiCache
      .callEndpoint('api/soiltestphosphorousranges/')
      .then((response: { status?: any; data: SoilTestPhosphorousRange[] }) => {
        if (response.status === 200) {
          setPhosphorousRanges(response.data);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function downloadBlob() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(state.nmpFile)], { type: 'application/json' }),
    );
    const a = document.createElement('a');
    a.href = url;

    const prependDate = new Date().toLocaleDateString('sv-SE', { dateStyle: 'short' });
    const farmName = state.nmpFile?.farmDetails?.farmName;

    a.download = `${prependDate}-${farmName}.nmp`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

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
              <Button
                onPress={() =>
                  makeFullReportPdf(
                    state.nmpFile,
                    fertilizerUnits,
                    soilTestMethods,
                    phosphorousRanges,
                    potassiumRanges,
                  )
                }
              >
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
