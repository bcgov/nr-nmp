import NMPFileGeneratedManureData from '@/types/NMPFileGeneratedManureData';

const DefaultGeneratedManureFormData: Omit<NMPFileGeneratedManureData, 'manureId'> = {
  UniqueMaterialName: '',
  AnnualAmount: 0,
  AnnualAmountUSGallonsVolume: 0,
  AnnualAmountTonsWeight: 0,
  AnnualAmountDisplayWeight: '',
  ManagedManureName: '',
  IsMaterialStored: false,
  AssignedToStoredSystem: false,
  AssignedWithNutrientAnalysis: false,
};

export default DefaultGeneratedManureFormData;
