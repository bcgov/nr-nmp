import { AnimalData } from './animals';
import { NMPFileFarmManureData } from './NMPFileFarmManureData';
import { NMPFileFieldData } from './NMPFileFieldData';
import NMPFileGeneratedManureData from './NMPFileGeneratedManureData';
import NMPFileImportedManureData from './NMPFileImportedManureData';

type NMPFileYear = {
  Year: string;
  Fields?: NMPFileFieldData[];
  FarmAnimals?: AnimalData[];
  FarmManures?: NMPFileFarmManureData[];
  GeneratedManures?: NMPFileGeneratedManureData[];
  ImportedManures?: NMPFileImportedManureData[];
  /*
  Fields from old NMP, currently unused, feel free to re-add
  SeparatedSolidManures?: any[];
  ManureStorageSystems?: any[];
  */
};

export default NMPFileYear;
