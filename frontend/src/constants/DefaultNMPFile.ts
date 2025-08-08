import { NMPFile } from '@/types';

const DEFAULT_NMPFILE: NMPFile = {
  farmDetails: {
    Year: '',
    FarmName: '',
    FarmRegion: 0,
    RegionLocationId: 0,
    FarmAnimals: [],
    HasHorticulturalCrops: false,
  },
  years: [],
};

export default DEFAULT_NMPFILE;
