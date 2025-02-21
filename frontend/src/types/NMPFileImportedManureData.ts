interface NMPFileImportedManureData {
  id?: number;
  MaterialName?: string;
  ManureTypeName?: string;
  AnnualAmount?: number;
  AnnualAmountUSGallonsVolume?: number;
  AnnualAmountCubicYardsVolume?: number;
  AnnualAmountCubicMetersVolume?: number;
  AnnualAmountTonsWeight?: number;
  AnnualAmountDisplayVolume?: string;
  AnnualAmountDisplayWeight?: string;
  Units?: number;
  Moisture?: string;
  StandardSolidMoisture?: number;
  IsMaterialStored?: boolean;
  ManureId?: string;
  ManagedManureName?: string;
  ManureType?: number;
  AssignedToStoredSystem?: boolean;
  AssignedWithNutrientAnalysis?: boolean;
}

export default NMPFileImportedManureData;
