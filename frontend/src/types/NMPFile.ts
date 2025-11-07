import { NMPFileAnimal } from './NMPFileAnimal';
import { NMPFileField } from './NMPFileField';
import {
  NMPFileDerivedManure,
  NMPFileGeneratedManure,
  NMPFileImportedManure,
  NMPFileManureStorageSystem,
} from './NMPFileManureStorageSystem';

export type NMPFileFarmDetails = {
  year: string;
  farmName: string;
  farmRegion: number;
  regionLocationId: number;
  farmSubregion?: number;
  farmAnimals?: string[];
  hasHorticulturalCrops?: boolean;
};

export interface NMPFileNutrientAnalysis {
  N: number; // Nitrogen
  P: number; // Phosphorous
  K: number; // Potassium
  manureId: number;
  solidLiquid: 'Solid' | 'Liquid' | '';
  moisture: string; // Note: This is a weird one. Book val is string but lab val needs to be number
  NH4N: number;
  sourceUuid: string;
  sourceName: string;
  nMineralizationId?: number;
  bookLab: string;
  uniqueMaterialName: string;
  manureName: string;
  // For solid manures in tons, for liquid manures in US gallons
  annualAmount: number;
  // materialRemaining: number;
}

export type NMPFileYear = {
  year: string;
  fields: NMPFileField[];
  farmAnimals?: NMPFileAnimal[];
  generatedManures?: NMPFileGeneratedManure[];
  importedManures?: NMPFileImportedManure[];
  derivedManures?: NMPFileDerivedManure[];
  manureStorageSystems?: NMPFileManureStorageSystem[];
  nutrientAnalyses: NMPFileNutrientAnalysis[];
};

export type NMPFile = {
  farmDetails: NMPFileFarmDetails;
  years: NMPFileYear[];
};
