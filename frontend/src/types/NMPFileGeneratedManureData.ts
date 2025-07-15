interface NMPFileGeneratedManureData {
  UniqueMaterialName: string;
  ManureTypeName: string;
  AnnualAmount: number;
  AnnualAmountUSGallonsVolume?: number;
  AnnualAmountTonsWeight?: number;
  AnnualAmountDisplayWeight?: string;
  ManagedManureName?: string;
  ManureType?: number;
  IsMaterialStored?: boolean;
  AssignedToStoredSystem?: boolean;
  AssignedWithNutrientAnalysis?: boolean;
  entryId: string | null;
}
export default NMPFileGeneratedManureData;
