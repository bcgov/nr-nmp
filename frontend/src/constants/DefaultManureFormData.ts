import NMPFileImportedManureData from '@/types/NMPFileImportedManureData';

const DefaultManureFormData: NMPFileImportedManureData = {
  UniqueMaterialName: '',
  ManureTypeName: '',
  AnnualAmount: 0,
  AnnualAmountUSGallonsVolume: 0,
  AnnualAmountCubicYardsVolume: 0,
  AnnualAmountCubicMetersVolume: 0,
  AnnualAmountTonsWeight: 0,
  AnnualAmountDisplayVolume: '',
  AnnualAmountDisplayWeight: '',
  Units: 0,
  Moisture: '50',
  IsMaterialStored: false,
  ManagedManureName: '',
  ManureType: 0,
  AssignedToStoredSystem: false,
  AssignedWithNutrientAnalysis: false,
};

export default DefaultManureFormData;
