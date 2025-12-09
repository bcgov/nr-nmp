import { NMPFile } from '@/types';

const DEFAULT_NMPFILE: NMPFile = {
  farmDetails: {
    year: '',
    farmName: '',
    farmRegion: 0,
    regionLocationId: 0,
    hasAnimals: false,
    hasHorticulturalCrops: false,
  },
  years: [],
};

export default DEFAULT_NMPFILE;
