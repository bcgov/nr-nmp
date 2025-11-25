import { DEFAULT_BERRY_DATA } from '@/constants';
import {
  getCropRequirementN,
  getCropRequirementK2O,
  getCropRequirementP205,
  getCropRemovalN,
  getCropRemovalP205,
  getCropRemovalK20,
  getBlueberryNutrients,
  getRaspberryNutrients,
} from './Calculations';
import { Crop, CropType, NMPFileCrop } from '@/types';

// These tests copy many current (as of writing) values from the database.
// Even if these database values change, the website will still give correct
// values if these tests pass, as these tests validate the equations, not
// the inputs

describe('Non-berry crop calculations tests', () => {
  const phosphorousRegion = {
    id: 2222,
    cropid: 28,
    soiltestphosphorousregioncode: 2,
    phosphorouscropgroupregioncode: 4,
  };
  const potassiumRegion = {
    id: 2223,
    cropid: 28,
    soiltestpotassiumregioncode: 3,
    potassiumcropgroupregioncode: 4,
  };

  // Only copying the applicable ranges/recommendations into these arrays
  const phosphorousRanges = [
    { id: 7, rangelow: 31, rangehigh: 40 },
    { id: 12, rangelow: 101, rangehigh: 1000 },
  ];
  const phosphorousRecommendations = [
    {
      id: 2710,
      soiltestphosphorouskelownarangeid: 7,
      soiltestphosphorousregioncode: 2,
      phosphorouscropgroupregioncode: 4,
      p2o5recommendationkilogramperhectare: 70,
    },
    {
      id: 2800,
      soiltestphosphorouskelownarangeid: 12,
      soiltestphosphorousregioncode: 2,
      phosphorouscropgroupregioncode: 4,
      p2o5recommendationkilogramperhectare: 0,
    },
  ];
  const potassiumRanges = [
    { id: 2, rangelow: 26, rangehigh: 35 },
    { id: 14, rangelow: 251, rangehigh: 1000 },
  ];
  const potassiumRecommendations = [
    {
      id: 3058,
      soiltestpotassiumkelownarangeid: 2,
      soiltestpotassiumregioncode: 3,
      potassiumcropgroupregioncode: 4,
      k2orecommendationkilogramperhectare: 150,
    },
    {
      id: 3274,
      soiltestpotassiumkelownarangeid: 14,
      soiltestpotassiumregioncode: 3,
      potassiumcropgroupregioncode: 4,
      k2orecommendationkilogramperhectare: 0,
    },
  ];

  const conversionFactors = {
    defaultapplicationofmanureinprevyears: 0,
    defaultsoiltestkelownaphosphorous: 250,
    defaultsoiltestkelownapotassium: 500,
    id: 0,
    kilogramperhectaretopoundperacreconversion: 0.892176122,
    nitrogenproteinconversion: 0.625,
    phosphorousavailabilityfirstyear: 0.7,
    phosphorousavailabilitylongterm: 1,
    phosphorousptop2o5conversion: 2.29,
    potassiumavailabilityfirstyear: 1,
    potassiumavailabilitylongterm: 1,
    potassiumktok2oconversion: 1.2,
    poundper1000ftsquaredtopoundperacreconversion: 43.56000216,
    poundpertonconversion: 20,
    soiltestppmtopoundperacreconversion: 1.74,
    unitconversion: 0.5,
  };

  // Crop and crop type for first two tests
  const beansGreen: Crop = {
    cropname: 'Beans-green, wax',
    cropremovalfactork2o: 6.78,
    cropremovalfactornitrogen: 7.34,
    cropremovalfactorp2o5: 2.8,
    croptypeid: 5,
    harvestbushelsperton: null,
    id: 28,
    manureapplicationhistory: 0,
    nitrogenrecommendationid: 2,
    nitrogenrecommendationpoundperacre: 35.68716488,
    nitrogenrecommendationupperlimitpoundperacre: 35.68716488,
    previouscropcode: 3,
    sortnumber: 100,
    yieldcd: 1,
  };
  const veggies: CropType = {
    covercrop: false,
    crudeproteinrequired: false,
    customcrop: false,
    id: 5,
    modifynitrogen: true,
    name: 'Field vegetables',
  };
  const nmpFileCrop: Partial<NMPFileCrop> = {
    cropId: 28,
    cropTypeId: 5,
    crudeProtein: 2.29375,
    crudeProteinAdjusted: false,
    manureApplicationHistory: 0,
    nCredit: 0,
    name: 'Beans-green, wax',
    prevCropId: 13,
    remK2o: 0,
    remN: 0,
    remP2o5: 0,
    reqK2o: 0,
    reqN: 0,
    reqNAdjusted: false,
    yield: 2.9,
  };
  test('Correct calculated value for non-berry crop without soil test, prev manure, or n credit', () => {
    expect(getCropRequirementN(nmpFileCrop as NMPFileCrop, beansGreen, veggies)).toBe(36);
    expect(
      getCropRequirementP205(
        undefined,
        phosphorousRegion,
        phosphorousRanges,
        phosphorousRecommendations,
        conversionFactors,
      ),
    ).toBe(0);
    expect(
      getCropRequirementK2O(
        undefined,
        potassiumRegion,
        potassiumRanges,
        potassiumRecommendations,
        conversionFactors,
      ),
    ).toBe(0);
    expect(getCropRemovalN(nmpFileCrop as NMPFileCrop, beansGreen, veggies)).toBe(21);
    expect(getCropRemovalP205(nmpFileCrop as NMPFileCrop, beansGreen, veggies)).toBe(8);
    expect(getCropRemovalK20(nmpFileCrop as NMPFileCrop, beansGreen, veggies)).toBe(20);
  });

  test('Correct calculated value for non-berry crop with soil test, prev manure, and n credit', () => {
    const updatedFileCrop: Partial<NMPFileCrop> = { ...nmpFileCrop, nCredit: 40, prevCropId: 10 };
    const soilTest = {
      convertedKelownaK: 35.2,
      convertedKelownaP: 32.56,
      sampleDate: '2025-11-01T07:00:00.000Z',
      soilTestId: 1,
      valK: 44,
      valNO3H: 44,
      valP: 44,
      valPH: 7,
    };
    expect(getCropRequirementN(updatedFileCrop as NMPFileCrop, beansGreen, veggies)).toBe(0);
    expect(
      getCropRequirementP205(
        soilTest,
        phosphorousRegion,
        phosphorousRanges,
        phosphorousRecommendations,
        conversionFactors,
      ),
    ).toBe(62);
    expect(
      getCropRequirementK2O(
        soilTest,
        potassiumRegion,
        potassiumRanges,
        potassiumRecommendations,
        conversionFactors,
      ),
    ).toBe(134);
    expect(getCropRemovalN(updatedFileCrop as NMPFileCrop, beansGreen, veggies)).toBe(21);
    expect(getCropRemovalP205(updatedFileCrop as NMPFileCrop, beansGreen, veggies)).toBe(8);
    expect(getCropRemovalK20(updatedFileCrop as NMPFileCrop, beansGreen, veggies)).toBe(20);
  });
});

describe('Berry crop calculation tests', () => {
  test('Blueberries with no leaf test, sawdust, pruning', () => {
    expect(
      getBlueberryNutrients(
        5,
        false,
        false,
        'N/A',
        2,
        1499,
        44,
        DEFAULT_BERRY_DATA.defaultBlueberryLeafTestP,
        DEFAULT_BERRY_DATA.defaultBlueberryLeafTestK,
      ),
    ).toMatchObject({ remK2o: 18, remN: 0, remP2o5: 3, reqK2o: 0, reqN: 11, reqP2o5: 0 });
  });
  test('Blueberries with leaf test, sawdust, and pruning', () => {
    expect(
      getBlueberryNutrients(5, true, true, 'Left between rows', 2, 1499, 44, 1, 1),
    ).toMatchObject({ remK2o: 18, remN: 0, remP2o5: 3, reqK2o: 0, reqN: 36, reqP2o5: 0 });
  });
  test('Raspberries without leaf test or pruning', () => {
    expect(
      getRaspberryNutrients(
        5,
        false,
        false,
        'N/A',
        44,
        44,
        DEFAULT_BERRY_DATA.defaultRaspberryLeafTestP,
        DEFAULT_BERRY_DATA.defaultRaspberryLeafTestK,
      ),
    ).toMatchObject({ remK2o: 18, remN: 0, remP2o5: 6, reqK2o: 50, reqN: 71, reqP2o5: 0 });
  });
  test('Raspberries with leaf test, pruning, sawdust', () => {
    expect(getRaspberryNutrients(5, true, true, 'Left between rows', 44, 44, 1, 1)).toMatchObject({
      remK2o: 18,
      remN: 0,
      remP2o5: 6,
      reqK2o: 80,
      reqN: 96,
      reqP2o5: 0,
    });
  });
});
