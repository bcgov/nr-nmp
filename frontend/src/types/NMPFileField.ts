import { CalculateNutrientsRow, CropNutrients, Schedule } from './CalculateNutrients';

export interface NMPFileCrop extends CalculateNutrientsRow {
  cropId: number;
  cropTypeId: number;
  yield: number;
  crudeProtein?: number;
  crudeProteinAdjusted?: boolean;
  prevCropId?: number;
  coverCropHarvested?: boolean;
  yieldHarvestUnit?: string;
  nCredit: number;
  plantAgeYears?: number;
  numberOfPlantsPerAcre?: number;
  distanceBtwnPlantsRows?: string;
  willPlantsBePruned?: boolean;
  whereWillPruningsGo?: string;
  willSawdustBeApplied?: boolean;
  hasLeafTest?: boolean;
  leafTissueP?: number;
  leafTissueK?: number;
  manureApplicationHistory?: number;
}

export type NMPFileSoilTest = {
  soilTestId: number;
  valNO3H?: number;
  valP?: number;
  valK?: number;
  valPH?: number;
  convertedKelownaK?: number;
  convertedKelownaP?: number;
  sampleDate?: string;
};

export interface NMPFileAppliedManure extends CalculateNutrientsRow {
  manureId: number;
  manureName: string;
  applicationId: number;
  applUnitId: number;
  applicationRate: number;
  nh4Retention: number;
  nh4RetentionAdjusted: boolean;
  nAvailable: number;
  nAvailableAdjusted: boolean;
  solidLiquid: 'Solid' | 'Liquid' | '';
  sourceUuid: string;
}

export interface NMPFileFertilizer extends CalculateNutrientsRow {
  fertilizerTypeId: number;
  fertilizerId: number;
  applicationRate: number;
  applUnitId: number;
  applDate?: string;
  applicationMethod: string;
  density?: number;
  densityAdjusted?: boolean;
  densityUnitId?: number;
}

export interface NMPFileFertigation extends CalculateNutrientsRow {
  fertilizerTypeId: number;
  fertilizerId: number;
  customNutrients?: CropNutrients;
  applicationRate: number;
  applUnitId: number;
  applUnitName?: string;
  density: number;
  densityUnitId?: number;
  tankVolume: number;
  tankUnitId?: number;
  solubility: number;
  solubilityUnitId?: number;
  amountToDissolve: number;
  amountToDissolveUnitId?: number;
  injectionRate: number;
  injectionUnitId?: number;
  eventsPerSeason: number;
  applicationPeriod: number;
  schedule?: Schedule;
  startDate?: string;
  // Calculations for liquid
  volume: number;
  volumeForSeason: number;
  applicationTime: number;
  // Additional fields for dry fertigation
  dryAction?: 'Soluble' | 'Reduce the amount to dissolve';
  nutrientConcentrationN?: number;
  nutrientConcentrationP2O5?: number;
  nutrientConcentrationK2O?: number;
  kglNutrientConcentrationN?: number;
  kglNutrientConcentrationP2O5?: number;
  kglNutrientConcentrationK2O?: number;
}

export type NMPFileOtherNutrient = CalculateNutrientsRow;

export type NMPFileField = {
  fieldName: string;
  area: number;
  previousYearManureApplicationId: number;
  comment: string;
  crops: NMPFileCrop[];
  soilTest?: NMPFileSoilTest;
  manures: NMPFileAppliedManure[];
  fertilizers: NMPFileFertilizer[];
  fertigations: NMPFileFertigation[];
  otherNutrients: NMPFileOtherNutrient[];
  previousYearManureApplicationNCredit?: number;
};
