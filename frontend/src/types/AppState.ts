import {
  Crop,
  CropsConversionFactors,
  CropType,
  Manure,
  NitrateCredit,
  NitrogenMineralization,
  Region,
  SoilTestNutrientKelownaRange,
  SoilTestPhosphorousRecommendation,
  SoilTestPhosphorousRegion,
  SoilTestPotassiumRecommendation,
  SoilTestPotassiumRegion,
  Subregion,
  Units,
} from './database';
import { NMPFile } from './NMPFile';

export type AppStateTables = {
  crops: Crop[];
  cropTypes: CropType[];
  cropConversionFactors: CropsConversionFactors;
  manures: Manure[];
  nitrateCredit: NitrateCredit[];
  nMineralizations: NitrogenMineralization[];
  regions: Region[];
  soilTestPhosphorousKelownaRanges: SoilTestNutrientKelownaRange[];
  soilTestPotassiumKelownaRanges: SoilTestNutrientKelownaRange[];
  soilTestPhosphorousRecommendations: SoilTestPhosphorousRecommendation[];
  soilTestPhosphorousRegions: SoilTestPhosphorousRegion[];
  soilTestPotassiumRecommendation: SoilTestPotassiumRecommendation[];
  soilTestPotassiumRegions: SoilTestPotassiumRegion[];
  subregions: Subregion[];
  manureUnits: Units[];
};

type AppState = {
  nmpFile: NMPFile;
  showAnimalsStep: boolean;
  tables: AppStateTables | undefined;
};
export default AppState;
