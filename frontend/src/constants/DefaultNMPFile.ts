import { NMPFile } from '@/types';

const defaultNMPFile: NMPFile = {
  farmDetails: {
    Year: '',
    FarmName: '',
    FarmRegion: 0,
    FarmSubRegion: null,
    FarmAnimals: [],
    HasHorticulturalCrops: false,
    HasBerries: false,
    HasVegetables: false,
  },
  years: [],
};

export default defaultNMPFile;
