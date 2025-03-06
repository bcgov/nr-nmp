export interface CropsConversionFactors {
  id?: number;
  nitrogenproteinconversion?: number;
  unitconversion?: number;
  defaultsoiltestkelownaphosphorous?: number;
  defaultsoiltestkelownapotassium?: number;
  kilogramperhectaretopoundperacreconversion?: number;
  potassiumavailabilityfirstyear?: number;
  potassiumavailabilitylongterm?: number;
  potassiumktok2oconversion?: number;
  phosphorousavailabilityfirstyear?: number;
  phosphorousavailabilitylongterm?: number;
  phosphorousptop2o5conversion?: number;
  poundpertonconversion?: number;
  poundper1000ftsquaredtopoundperacreconversion?: number;
  defaultapplicationofmanureinprevyears?: number;
  soiltestppmtopoundperacreconversion?: number;
}

export interface CropsDatabase {
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
}

export interface CropTypesDatabase {
  id: number;
  name: string;
  covercrop: boolean;
  crudeproteinrequired: boolean;
  customcrop: boolean;
  modifynitrogen: boolean;
}

export interface PreviousCropsDatabase {
  id: number;
  previouscropcode: number;
  name: string;
  nitrogencreditmetric: number;
  nitrogencreditimperial: number;
  cropid: number;
  croptypeid: number;
}

export interface NMPFileCropData {
  id?: number;
  cropId?: string;
  cropTypeId?: number;
  cropName?: string;
  cropTypeName?: string;
  cropOther?: string | null;
  yield?: number;
  reqN?: number;
  stdN?: number;
  reqP2o5?: number;
  reqK2o?: number;
  remN?: number;
  remP2o5?: number;
  remK2o?: number;
  crudeProtien?: number;
  prevCropId?: number;
  coverCropHarvested?: string | null;
  prevYearManureAppl_volCatCd?: number;
  yieldHarvestUnit?: number;
  yieldByHarvestUnit?: number;
  plantAgeYears?: number | null;
  numberOfPlantsPerAcre?: number;
  distanceBtwnPlantsRows?: number | null;
  willPlantsBePruned?: boolean;
  whereWillPruningsGo?: string | null;
  willSawdustBeApplied?: boolean;
}

export interface SoilTestData {
  soilTest?: string;
  valNO3H?: string;
  valP?: string;
  valK?: string;
  valPH?: string;
  convertedKelownaK?: string;
  convertedKelownaP?: string;
  sampleDate?: string;
}

export interface soilTestMethodsData {
  id: number;
  name: string;
  converttokelownaphlessthan72: number;
  converttokelownaphgreaterthan72: number;
  converttokelownak: number;
  sortnum: number;
}
