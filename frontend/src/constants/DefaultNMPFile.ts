import { NMPFile } from '@/types';

const DEFAULT_NMPFILE: NMPFile = {
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

export default DEFAULT_NMPFILE;
