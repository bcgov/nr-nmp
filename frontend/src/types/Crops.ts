import { CalculateNutrientsColumn } from './calculateNutrients';

export const FORAGE_ID = 1;
export const COVER_CROP_ID = 2;
export const GRAIN_OILSEED_ID = 4;
export const CROP_TYPE_OTHER_ID = 6;
export const CROP_OTHER_ID = 66;

export type CropsConversionFactors = {
  nitrogenproteinconversion: number;
  unitconversion: number;
  defaultsoiltestkelownaphosphorous: number;
  defaultsoiltestkelownapotassium: number;
  kilogramperhectaretopoundperacreconversion: number;
  potassiumavailabilityfirstyear: number;
  potassiumavailabilitylongterm: number;
  potassiumktok2oconversion: number;
  phosphorousavailabilityfirstyear: number;
  phosphorousavailabilitylongterm: number;
  phosphorousptop2o5conversion: number;
  poundpertonconversion: number;
  poundper1000ftsquaredtopoundperacreconversion: number;
  defaultapplicationofmanureinprevyears: number;
  soiltestppmtopoundperacreconversion: number;
};

export type Crop = {
  cropname: string;
  cropremovalfactork2o: number;
  cropremovalfactornitrogen: number;
  cropremovalfactorp2o5: number;
  croptypeid: number;
  harvestbushelsperton: number;
  id: number;
  manureapplicationhistory: number;
  nitrogenrecommendationid: number;
  nitrogenrecommendationpoundperacre: number;
  nitrogenrecommendationupperlimitpoundperacre: number;
  previouscropcode: number;
  sortnumber: number;
  yieldcd: number;
};

export type CropType = {
  id: number;
  name: string;
  covercrop: boolean;
  crudeproteinrequired: boolean;
  customcrop: boolean;
  modifynitrogen: boolean;
};

export type PreviousCrop = {
  id: number;
  previouscropcode: number;
  name: string;
  nitrogencreditmetric: number;
  nitrogencreditimperial: number;
  cropid: number;
  croptypeid: number;
};

export type NMPFileSoilTestData = {
  soilTestId: number;
  valNO3H?: string;
  valP?: string;
  valK?: string;
  valPH?: string;
  convertedKelownaK?: string;
  convertedKelownaP?: string;
  sampleDate?: string;
};

export interface NMPFileCropData extends CalculateNutrientsColumn {
  cropId: number;
  cropTypeId: number;
  yield?: number;
  stdN?: number;
  crudeProtein?: number;
  prevCropId?: number;
  coverCropHarvested?: boolean;
  yieldHarvestUnit?: string;
  nCredit: number;
  /*
  Fields from old NMP, currently unused, feel free to re-add
  prevYearManureAppl_volCatCd?: number;
  plantAgeYears?: number | null;
  numberOfPlantsPerAcre?: number;
  distanceBtwnPlantsRows?: number | null;
  willPlantsBePruned?: boolean;
  whereWillPruningsGo?: string | null;
  willSawdustBeApplied?: boolean;
  */
}

export type SoilTestMethodsData = {
  id: number;
  name: string;
  converttokelownaphlessthan72: number;
  converttokelownaphgreaterthan72: number;
  converttokelownak: number;
  sortnum: number;
};
