import NMPFile from '../types/NMPFile';

const defaultNMPFile: NMPFile = {
  farmDetails: {
    Year: '',
    FarmName: '',
    FarmRegion: 0,
    FarmSubRegion: null,
    SoilTests: null,
    TestingMethod: null,
    Manure: null,
    HasSelectedFarmType: false,
    ImportsManureCompost: false,
    FarmAnimals: [],
    HasHorticulturalCrops: false,
    HasBerries: false,
    HasVegetables: false,
    LeafTests: null,
    LeafTestingMethod: null,
    UserJourney: 0,
  },
  unsaved: false,
  years: [],
  LastAppliedFarmManureId: null,
  NMPReleaseVersion: 0,
};

export default defaultNMPFile;
