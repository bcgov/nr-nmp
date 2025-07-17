import NMPFileImportedManureData from '@/types/NMPFileImportedManureData';

const DefaultManureFormData: NMPFileImportedManureData = {
  UniqueMaterialName: '',
  AnnualAmount: 0,
  AnnualAmountUSGallonsVolume: 0,
  AnnualAmountCubicYardsVolume: 0,
  AnnualAmountCubicMetersVolume: 0,
  AnnualAmountTonsWeight: 0,
  AnnualAmountDisplayVolume: '',
  AnnualAmountDisplayWeight: '',
  Units: 0,
  Moisture: '50.0',
  IsMaterialStored: false,
  ManagedManureName: '',
  AssignedToStoredSystem: false,
  AssignedWithNutrientAnalysis: false,
};

export default DefaultManureFormData;
