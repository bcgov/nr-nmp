import { NMPFileImportedManure } from '@/types';

const DEFAULT_IMPORTED_MANURE: Omit<NMPFileImportedManure, 'uuid'> = {
  uniqueMaterialName: '',
  annualAmount: 0,
  annualAmountUSGallonsVolume: 0,
  annualAmountCubicYardsVolume: 0,
  annualAmountCubicMetersVolume: 0,
  annualAmountTonsWeight: 0,
  annualAmountDisplayVolume: '',
  annualAmountDisplayWeight: '',
  units: 0,
  moisture: 50,
  managedManureName: '',
  assignedToStoredSystem: false,
};

export default DEFAULT_IMPORTED_MANURE;
