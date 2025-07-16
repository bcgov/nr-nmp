import { ManureType } from './Animals';

interface NMPFileGeneratedManureData {
  UniqueMaterialName: string;
  ManureType?: ManureType;
  AnnualAmount: number;
  AnnualAmountUSGallonsVolume?: number;
  AnnualAmountTonsWeight?: number;
  AnnualAmountDisplayWeight?: string;
  ManagedManureName: string;
  IsMaterialStored?: boolean;
  AssignedToStoredSystem?: boolean;
  AssignedWithNutrientAnalysis?: boolean;
}
export default NMPFileGeneratedManureData;
