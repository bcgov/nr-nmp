/**
 * @summary Type definition for fieldType File
 */

type fertilizerDetailsType = {
  fertilizerId: number;
  fertilizerType: string;
  fertilizerName: string;
  applicationRate: number;
  applicationRateUnits: number;
  density: number;
  densityUnits: number;
  userN: number;
  userP2o5: number;
  userK2o: number;
  customFertilizer: boolean;
};

export default fertilizerDetailsType;
