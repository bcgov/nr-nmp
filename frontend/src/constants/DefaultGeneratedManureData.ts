import NMPFileGeneratedManureData from '@/types/NMPFileGeneratedManureData';

const DefaultGeneratedManureFormData: Omit<
  NMPFileGeneratedManureData,
  'index' | 'UniqueMaterialName' | 'ManureTypeName' | 'AnnualAmount'
> = {
  AnnualAmountUSGallonsVolume: 0,
  AnnualAmountTonsWeight: 0,
  AnnualAmountDisplayWeight: '',
  ManagedManureName: '',
  ManureType: 0,
  IsMaterialStored: false,
  AssignedToStoredSystem: false,
  AssignedWithNutrientAnalysis: false,
};

export default DefaultGeneratedManureFormData;
