import { ManureType } from './Animals';

interface NMPFileImportedManureData {
  UniqueMaterialName: string;
  ManureType?: ManureType;
  AnnualAmount: number;
  AnnualAmountUSGallonsVolume?: number;
  AnnualAmountCubicYardsVolume?: number;
  AnnualAmountCubicMetersVolume?: number;
  AnnualAmountTonsWeight?: number;
  AnnualAmountDisplayVolume?: string;
  AnnualAmountDisplayWeight?: string;
  Units?: number;
  Moisture?: number;
  IsMaterialStored?: boolean;
  ManagedManureName: string;
  AssignedToStoredSystem?: boolean;
  AssignedWithNutrientAnalysis?: boolean;
}

export default NMPFileImportedManureData;
