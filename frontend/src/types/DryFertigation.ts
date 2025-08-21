type DryFertigation = {
  Fertilizers: {
    Id: number;
    Name: string;
    DryLiquid: 'dry' | 'liquid';
    Nitrogen: number;
    Phosphorous: number;
    Potassium: number;
    SortNum: number;
    LiquidFertilizerDensities: any[];
  }[];
};
export default DryFertigation;
