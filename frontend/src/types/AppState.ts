import {
  Crop,
  CropsConversionFactors,
  CropType,
  Region,
  SoilTestNutrientKelownaRange,
  SoilTestPhosphorousRecommendation,
  SoilTestPhosphorousRegion,
  SoilTestPotassiumRecommendation,
  SoilTestPotassiumRegion,
} from './database';
import { NMPFile } from './NMPFile';

export type AppStateTables = {
  crops: Crop[];
  cropTypes: CropType[];
  cropConversionFactors: CropsConversionFactors;
  regions: Region[];
  soilTestPhosphorousKelownaRanges: SoilTestNutrientKelownaRange[];
  soilTestPotassiumKelownaRanges: SoilTestNutrientKelownaRange[];
  soilTestPhosphorousRecommendations: SoilTestPhosphorousRecommendation[];
  soilTestPhosphorousRegions: SoilTestPhosphorousRegion[];
  soilTestPotassiumRecommendation: SoilTestPotassiumRecommendation[];
  soilTestPotassiumRegions: SoilTestPotassiumRegion[];
};

type AppState = {
  nmpFile: NMPFile;
  showAnimalsStep: boolean;
  tables: AppStateTables | undefined;
};
export default AppState;
