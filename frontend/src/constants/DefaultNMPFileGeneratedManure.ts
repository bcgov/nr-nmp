import { NMPFileGeneratedManure } from '@/types';

const DEFAULT_GENERATED_MANURE: Omit<NMPFileGeneratedManure, 'uuid'> = {
  uniqueMaterialName: '',
  annualAmount: 0,
  annualAmountUSGallonsVolume: 0,
  annualAmountTonsWeight: 0,
  annualAmountDisplayWeight: '',
  managedManureName: '',
  isMaterialStored: false,
  assignedToStoredSystem: false,
};

export default DEFAULT_GENERATED_MANURE;
