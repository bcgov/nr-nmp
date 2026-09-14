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
  SoilTestMethod,
  SoilTestNutrientRange,
  Units,
  Manure,
  SolidMaterialApplicationTonPerAcreRateConversions,
  LiquidMaterialApplicationUsGallonsPerAcreRateConversions,
  MaterialRemainingData,
  Subregion,
  PreviousCrop,
  ManureType,
} from '@/types';
import { DAIRY_COW_ID } from '@/constants';
import makeFullReportPdf from './makeFullReport';
import { calculateMaterialRemainingData } from '@/calculations/MaterialRemaining/Calculations';
import { downloadBlob } from './utils';
import WarningBox from './WarningBox';
import { getLiquidManureDisplay, getSolidManureDisplay } from '@/utils/utils';

export default function Reporting() {
  const { state } = useAppState();
  const navigate = useNavigate();
  const apiCache = useContext(APICacheContext);
  const [subregion, setSubregion] = useState<Subregion | null>(null);
  const manureUnits: Units[] = apiCache.getInitializedResponse('units').data;
  const [fertilizerUnits, setFertilizerUnits] = useState<FertilizerUnit[]>([]);
  const soilTestMethods: SoilTestMethod[] = apiCache.getInitializedResponse('soiltestmethods').data;
  const phosphorousRanges: SoilTestNutrientRange[] = apiCache.getInitializedResponse(
    'soiltestphosphorousranges',
  ).data;
  const potassiumRanges: SoilTestNutrientRange[] = apiCache.getInitializedResponse(
    'soiltestpotassiumranges',
  ).data;
  const [solidConversions, setSolidConversions] = useState<
    SolidMaterialApplicationTonPerAcreRateConversions[]
  >([]);
  const [liquidConversions, setLiquidConversions] = useState<
    LiquidMaterialApplicationUsGallonsPerAcreRateConversions[]
  >([]);
  const manures: Manure[] = apiCache.getInitializedResponse('manures').data;
  const [previousCrops, setPreviousCrops] = useState<PreviousCrop[]>([]);
  const [materialRemainingData, setMaterialRemainingData] = useState<
    MaterialRemainingData | null
  >(null);

  const [remainingMaterials, overappliedMaterials] = useMemo(() => {
    if (materialRemainingData === null) return [[], []];

    const allAppliedManures = [
      ...materialRemainingData.appliedStoredManures,
      ...materialRemainingData.appliedUnstoredManures,
    ];
    return [
      allAppliedManures.filter((manure) => manure.wholePercentRemaining >= 10),
      allAppliedManures.filter((manure) => manure.totalAnnualManureRemainingToApply < 0),
    ];
  }, [materialRemainingData]);

  const unstoredManures = useMemo(
    () => [
      ...(state.nmpFile.years[0].generatedManures || []),
      ...(state.nmpFile.years[0].importedManures || []),
      ...(state.nmpFile.years[0].derivedManures || []),
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
      .callEndpoint(
        `api/subregions/${state.nmpFile.farmDetails.farmRegion}/${state.nmpFile.farmDetails.farmSubregion!}/`,
      )
      .then((response) => {
        if (response.status === 200) {
          setSubregion(response.data.length > 0 ? response.data[0] : null);
        }
      });
    apiCache
      .callEndpoint('api/solidmaterialapplicationtonperacrerateconversions/')
      .then(
        (response: {
          status?: any;
          data: SolidMaterialApplicationTonPerAcreRateConversions[];
        }) => {
          if (response.status === 200) {
            setSolidConversions(response.data);
          }
        },
      );
    apiCache
      .callEndpoint('api/liquidmaterialapplicationusgallonsperacrerateconversions/')
      .then(
        (response: {
          status?: any;
          data: LiquidMaterialApplicationUsGallonsPerAcreRateConversions[];
        }) => {
          if (response.status === 200) {
            setLiquidConversions(response.data);
          }
        },
      );
    apiCache
      .callEndpoint('api/previouscroptypes/')
      .then((response: { status?: any; data: PreviousCrop[] }) => {
        if (response.status === 200) {
          setPreviousCrops(response.data);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate material remaining data
  useEffect(() => {
    if (
      solidConversions.length === 0
      || liquidConversions.length === 0
      || manures.length === 0
    ) {
      return;
    }

    // Build manure data with moisture values
    const manureData: { [manureId: number]: { moisture?: number } } = {};
    manures.forEach((manure) => {
      if (manure.moisture) {
        const moistureValue = parseFloat(manure.moisture.toString());
        if (!Number.isNaN(moistureValue)) {
          manureData[manure.id] = { moisture: moistureValue };
        }
      }
    });

    const result = calculateMaterialRemainingData(
      state.nmpFile.years[0],
      Object.keys(manureData).length > 0 ? manureData : undefined,
      solidConversions,
      liquidConversions,
      manureUnits,
    );
    setMaterialRemainingData(result);
  }, [
    manureUnits,
    solidConversions,
    liquidConversions,
    manures,
    state.nmpFile.years,
  ]);

  const handlePreviousPage = () => {
    navigate(CALCULATE_NUTRIENTS);
  };

  const handleNextPage = () => {
    window.location.href = 'https://www2.gov.bc.ca/gov/content/industry/agriculture-seafood/agricultural-land-and-'
      + 'environment/soil-nutrients/nutrient-management/what-to-apply/soil-nutrient-testing';
  };

  return (
    <View
      title="Reporting"
      handleBack={handlePreviousPage}
      handleNext={handleNextPage}
      nextBtnText="Finish"
    >
      {remainingMaterials.length > 0 && (
        <WarningBox
          heading="The following materials are not applied to a field"
          bullets={remainingMaterials.map(
            (m) => `${m.sourceName}: ${m.manureType === ManureType.Solid ? getSolidManureDisplay(m.totalAnnualManureRemainingToApply) : getLiquidManureDisplay(m.totalAnnualManureRemainingToApply)} (${m.wholePercentRemaining}% remaining)`,
          )}
        />
      )}

      {overappliedMaterials.length > 0 && (
        <WarningBox
          heading="There is not enough of the following materials to meet the planned application rates"
          bullets={overappliedMaterials.map(
            (m) => `${m.sourceName}: overutilized by ${m.manureType === ManureType.Solid ? getSolidManureDisplay(-1 * m.totalAnnualManureRemainingToApply) : getLiquidManureDisplay(-1 * m.totalAnnualManureRemainingToApply)}`,
          )}
        />
      )}

      {/* only show if you have dairy cattle */}
      {unstoredManures.length > 0 && isDairyCattle && (
        <WarningBox
          heading="The following materials are not stored"
          bullets={unstoredManures.map((m) => `${m.managedManureName}`)}
        />
      )}

      <Grid
        container
        spacing={2}
        sx={{ marginTop: '1rem', marginBottom: '2rem' }}
      >
        <Grid
          size={{ xs: 4 }}
          sx={{ justifyItems: 'center' }}
        >
          <SectionHeader>PDFs (Opens a new file)</SectionHeader>
          <div css={{ paddingBottom: '1rem' }}>
            <ButtonGroup
              alignment="center"
              ariaLabel="A group of buttons"
              orientation="vertical"
            >
              <Button
                onPress={() => makeFullReportPdf(
                  state.nmpFile,
                  subregion,
                  fertilizerUnits,
                  manureUnits,
                  soilTestMethods,
                  phosphorousRanges,
                  potassiumRanges,
                  previousCrops,
                  materialRemainingData,
                )}
              >
                <div style={{ width: '100%', textAlign: 'center' }}>
                  Complete report
                </div>
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
            <Button onPress={() => downloadBlob(state.nmpFile)}>
              Download file
            </Button>
          </div>
        </Grid>
      </Grid>
    </View>
  );
}
