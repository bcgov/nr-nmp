export interface NutrientMessage {
  Id: number;
  Text: string;
  Icon: string;
  BalanceType: string;
  ReqBalanceLow: number;
  ReqBalanceHigh: number;
  RemBalanceLow: number;
  RemBalanceHigh: number;
}

export const NUTRIENT_MESSAGES: NutrientMessage[] = [
  {
    Id: 1,
    Text: 'Reduce N input by {0} lb/ac',
    Icon: '/stop triangle.svg',
    BalanceType: 'reqN',
    ReqBalanceLow: 15,
    ReqBalanceHigh: 99999,
    RemBalanceLow: 0,
    RemBalanceHigh: 0,
  },
  {
    Id: 2,
    Text: 'Crop requirement for N is met',
    Icon: '/good.svg',
    BalanceType: 'reqN',
    ReqBalanceLow: -5,
    ReqBalanceHigh: 14,
    RemBalanceLow: 0,
    RemBalanceHigh: 0,
  },
  {
    Id: 3,
    Text: 'Add {0} lb N/ac to meet crop requirements',
    Icon: '/dollar warning.svg',
    BalanceType: 'reqN',
    ReqBalanceLow: -99999,
    ReqBalanceHigh: -6,
    RemBalanceLow: 0,
    RemBalanceHigh: 0,
  },
  {
    Id: 4,
    Text: 'Crop requirement for P2O5 is met; {0} lb/ac adds no benefit to the crop',
    Icon: '/dollar warning.svg',
    BalanceType: 'reqP2o5',
    ReqBalanceLow: 15,
    ReqBalanceHigh: 99999,
    RemBalanceLow: 0,
    RemBalanceHigh: 0,
  },
  {
    Id: 5,
    Text: 'Crop requirement for P2O5 is met',
    Icon: '/good.svg',
    BalanceType: 'reqP2o5',
    ReqBalanceLow: -5,
    ReqBalanceHigh: 14,
    RemBalanceLow: 0,
    RemBalanceHigh: 0,
  },
  {
    Id: 6,
    Text: 'Add {0} lb P2O5/ac to meet crop requirements',
    Icon: '/dollar warning.svg',
    BalanceType: 'reqP2o5',
    ReqBalanceLow: -99999,
    ReqBalanceHigh: -6,
    RemBalanceLow: 0,
    RemBalanceHigh: 0,
  },
  {
    Id: 7,
    Text: 'Crop requirement for K2O is met, {0} lb/ac adds no benefit to the crop',
    Icon: '/dollar warning.svg',
    BalanceType: 'reqK2o',
    ReqBalanceLow: 15,
    ReqBalanceHigh: 99999,
    RemBalanceLow: 0,
    RemBalanceHigh: 0,
  },
  {
    Id: 8,
    Text: 'Crop requirement for K2O is met',
    Icon: '/good.svg',
    BalanceType: 'reqK2o',
    ReqBalanceLow: -5,
    ReqBalanceHigh: 14,
    RemBalanceLow: 0,
    RemBalanceHigh: 0,
  },
  {
    Id: 9,
    Text: 'Add {0} lb K2O/ac to meet crop requirements',
    Icon: '/dollar warning.svg',
    BalanceType: 'reqK2o',
    ReqBalanceLow: -99999,
    ReqBalanceHigh: -6,
    RemBalanceLow: 0,
    RemBalanceHigh: 0,
  },
  {
    Id: 10,
    Text: 'Reduce crop P2O5 removal balance below 80 lb/ac per year in the long term.',
    Icon: '/stop triangle.svg',
    BalanceType: 'remP2O5',
    ReqBalanceLow: 15,
    ReqBalanceHigh: 99999,
    RemBalanceLow: 80,
    RemBalanceHigh: 99999,
  },
];
