import NMPFileYear from './NMPFileYear';
/**
 * @summary Type definitions for NMP File
 */
type NMPFile = {
  farmDetails: {
    Year?: string;
    FarmName?: string;
    FarmRegion?: number;
    FarmSubRegion?: number | null;
    FarmAnimals?: string[];
    HasHorticulturalCrops?: boolean;
    HasBerries?: boolean;
    HasVegetables?: boolean;
    /*
    Fields from old NMP, currently unused, feel free to re-add
    Manure?: any | null;
    HasSelectedFarmType?: boolean;
    ImportsManureCompost?: boolean;
    TestingMethod?: any | null;
    SoilTests?: any | null;
    LeafTests?: any | null;
    LeafTestingMethod?: any | null;
    UserJourney?: number;
    */
  };
  years: NMPFileYear[];
  /*
  Fields from old NMP, currently unused, feel free to re-add
  unsaved?: boolean;
  LastAppliedFarmManureId?: any | null;
  NMPReleaseVersion?: number;
  */
};
export default NMPFile;
