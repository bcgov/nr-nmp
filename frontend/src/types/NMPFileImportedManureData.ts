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
  AnnualAmountOfManurePerStorage?: number;
  Units?: number;
  Moisture?: string;
  IsMaterialStored?: boolean;
  ManagedManureName: string;
  AssignedToStoredSystem?: boolean;
  AssignedWithNutrientAnalysis?: boolean;
  manureId?: string;
}

export default NMPFileImportedManureData;
