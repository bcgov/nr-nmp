// Type for api/manure data table
type ManureType = {
  id: number;
  name: string;
  manureClass: string;
  solidLiquid: string;
  moisture: number;
  nitrogen: number;
  ammonia: number;
  phosphorous: number;
  potassium: number;
  dryMatterId: number;
  nMineralizationId: number;
  sortNum: number;
  cubicYardConversion: number;
  nitrate: number;
  defaultSolidMoisture: number;
};
export default ManureType;
