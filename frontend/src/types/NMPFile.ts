import NMPFileYear from './NMPFileYear';

export type NMPFileFarmDetails = {
  Year: string;
  FarmName: string;
  FarmRegion: number;
  RegionLocationId: number;
  FarmSubRegion?: number;
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

/**
 * @summary Type definitions for NMP File
 */
export type NMPFile = {
  farmDetails: NMPFileFarmDetails;
  years: NMPFileYear[];
  /*
  Fields from old NMP, currently unused, feel free to re-add
  unsaved?: boolean;
  LastAppliedFarmManureId?: any | null;
  NMPReleaseVersion?: number;
  */
};
