import { AnimalData } from './Animals';
import { NMPFileFieldData } from './NMPFileFieldData';
import NMPFileGeneratedManureData from './NMPFileGeneratedManureData';
import NMPFileImportedManureData from './NMPFileImportedManureData';
import { NMPFileManureStorageSystem } from './NMPFileManureStorageSystem';
import { NMPFileNutrientAnalysis } from './NMPFileNutrientAnalysis';

type NMPFileYear = {
  Year: string;
  Fields?: NMPFileFieldData[];
  FarmAnimals?: AnimalData[];
  GeneratedManures?: NMPFileGeneratedManureData[];
  ImportedManures?: NMPFileImportedManureData[];
  ManureStorageSystems?: NMPFileManureStorageSystem[];
  NutrientAnalyses: NMPFileNutrientAnalysis[];
  // Fields from old NMP, currently unused, feel free to re-add
  // SeparatedSolidManures?: any[];
};

export default NMPFileYear;
