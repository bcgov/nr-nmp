import { AnimalData } from './Animals';
import { NMPFileFarmManureData } from './NMPFileFarmManureData';
import { NMPFileFieldData } from './NMPFileFieldData';
import NMPFileGeneratedManureData from './NMPFileGeneratedManureData';
import NMPFileImportedManureData from './NMPFileImportedManureData';
import { NMPFileManureStorageSystem } from './NMPFileManureStorageSystem';
import { NutrientAnalysis } from './CalculateNutrients';

type NMPFileYear = {
  Year: string;
  Fields?: NMPFileFieldData[];
  FarmAnimals?: AnimalData[];
  FarmManures?: NMPFileFarmManureData[];
  GeneratedManures?: NMPFileGeneratedManureData[];
  ImportedManures?: NMPFileImportedManureData[];
  ManureStorageSystems?: NMPFileManureStorageSystem[];
  NutrientAnalysis: NutrientAnalysis[];
  // Fields from old NMP, currently unused, feel free to re-add
  // SeparatedSolidManures?: any[];
};

export default NMPFileYear;
