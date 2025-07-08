import { AnimalData } from './Animals';
import { NMPFileFarmManureData } from './NMPFileFarmManureData';
import { NMPFileFieldData } from './NMPFileFieldData';
import NMPFileGeneratedManureData from './NMPFileGeneratedManureData';
import NMPFileImportedManureData from './NMPFileImportedManureData';
import NMPFileManureStorageSystemsData from './NMPFileManureStorageSystemsData.ts';

type NMPFileYear = {
  Year: string;
  Fields?: NMPFileFieldData[];
  FarmAnimals?: AnimalData[];
  FarmManures?: NMPFileFarmManureData[];
  GeneratedManures?: NMPFileGeneratedManureData[];
  ImportedManures?: NMPFileImportedManureData[];
  // Fields from old NMP, currently unused, feel free to re-add
  // SeparatedSolidManures?: any[];
  ManureStorageSystems?: NMPFileManureStorageSystemsData[];
};

export default NMPFileYear;
