import {
  CropsConversionFactors,
  Region,
  SoilTestPhosphorousRegion,
  SoilTestPotassiumRegion,
} from './database';
import { NMPFile } from './NMPFile';

type AppState = {
  nmpFile: NMPFile;
  showAnimalsStep: boolean;
  tables:
    | {
        cropConversionFactors: CropsConversionFactors;
        regions: Region[];
        soilTestPhosphorousRegions: SoilTestPhosphorousRegion[];
        soilTestPotassiumRegions: SoilTestPotassiumRegion[];
      }
    | undefined;
};
export default AppState;
