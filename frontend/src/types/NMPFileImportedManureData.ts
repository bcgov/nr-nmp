interface NMPFileImportedManureData {
  UniqueMaterialName: string;
  ManureTypeName: string;
  AnnualAmount: number;
  AnnualAmountUSGallonsVolume?: number;
  AnnualAmountCubicYardsVolume?: number;
  AnnualAmountCubicMetersVolume?: number;
  AnnualAmountTonsWeight?: number;
  AnnualAmountDisplayVolume?: string;
  AnnualAmountDisplayWeight?: string;
  Units?: number;
  Moisture?: string;
  IsMaterialStored?: boolean;
  ManagedManureName?: string;
  ManureType?: number;
  AssignedToStoredSystem?: boolean;
  AssignedWithNutrientAnalysis?: boolean;
}

export default NMPFileImportedManureData;
