import { NMPFileManureStorageSystemsData } from '@/types';
import DefaultGeneratedManureFormData from './DefaultGeneratedManureData';

const DefaultNMPFileManureStorageSystemsData: NMPFileManureStorageSystemsData = {
  Id: 0,
  Name: '',
  ManureMaterialType: 0,
  ManuresIncludedInSystem: {
    Type: 'Generated',
    Data: DefaultGeneratedManureFormData,
  },
  GetsRunoffFromRoofsOrYards: false,
  RunoffAreaSquareFeet: null,
  ManureStorageStructures: {
    Id: 0,
    Name: '',
    IsStructureCovered: false,
    UncoveredAreaSquareFeet: 0,
  },
};

export default DefaultNMPFileManureStorageSystemsData;
