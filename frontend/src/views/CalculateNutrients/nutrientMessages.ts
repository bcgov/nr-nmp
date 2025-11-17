export interface NutrientMessage {
  id: number;
  text: string;
  icon: string;
  balanceType: string;
  reqBalanceLow: number;
  reqBalanceHigh: number;
  remBalanceLow: number;
  remBalanceHigh: number;
}

export const NUTRIENT_MESSAGES: NutrientMessage[] = [
  {
    id: 1,
    text: 'Reduce N input by {0} lb/ac',
    icon: '/stop triangle.svg',
    balanceType: 'reqN',
    reqBalanceLow: 15,
    reqBalanceHigh: 99999,
    remBalanceLow: 0,
    remBalanceHigh: 0,
  },
  {
    id: 2,
    text: 'Crop requirement for N is met',
    icon: '/good.svg',
    balanceType: 'reqN',
    reqBalanceLow: -5,
    reqBalanceHigh: 14,
    remBalanceLow: 0,
    remBalanceHigh: 0,
  },
  {
    id: 3,
    text: 'Add {0} lb N/ac to meet crop requirements',
    icon: '/dollar warning.svg',
    balanceType: 'reqN',
    reqBalanceLow: -99999,
    reqBalanceHigh: -6,
    remBalanceLow: 0,
    remBalanceHigh: 0,
  },
  {
    id: 4,
    text: 'Crop requirement for P₂O₅ is met; {0} lb/ac adds no benefit to the crop',
    icon: '/dollar warning.svg',
    balanceType: 'reqP2o5',
    reqBalanceLow: 15,
    reqBalanceHigh: 99999,
    remBalanceLow: 0,
    remBalanceHigh: 0,
  },
  {
    id: 5,
    text: 'Crop requirement for P₂O₅ is met',
    icon: '/good.svg',
    balanceType: 'reqP2o5',
    reqBalanceLow: -5,
    reqBalanceHigh: 14,
    remBalanceLow: 0,
    remBalanceHigh: 0,
  },
  {
    id: 6,
    text: 'Add {0} lb P₂O₅/ac to meet crop requirements',
    icon: '/dollar warning.svg',
    balanceType: 'reqP2o5',
    reqBalanceLow: -99999,
    reqBalanceHigh: -6,
    remBalanceLow: 0,
    remBalanceHigh: 0,
  },
  {
    id: 7,
    text: 'Crop requirement for K₂O is met, {0} lb/ac adds no benefit to the crop',
    icon: '/dollar warning.svg',
    balanceType: 'reqK2o',
    reqBalanceLow: 15,
    reqBalanceHigh: 99999,
    remBalanceLow: 0,
    remBalanceHigh: 0,
  },
  {
    id: 8,
    text: 'Crop requirement for K₂O is met',
    icon: '/good.svg',
    balanceType: 'reqK2o',
    reqBalanceLow: -5,
    reqBalanceHigh: 14,
    remBalanceLow: 0,
    remBalanceHigh: 0,
  },
  {
    id: 9,
    text: 'Add {0} lb K₂O/ac to meet crop requirements',
    icon: '/dollar warning.svg',
    balanceType: 'reqK2o',
    reqBalanceLow: -99999,
    reqBalanceHigh: -6,
    remBalanceLow: 0,
    remBalanceHigh: 0,
  },
  {
    id: 10,
    text: 'Reduce crop P₂O₅ removal balance below 80 lb/ac per year in the long term.',
    icon: '/stop triangle.svg',
    balanceType: 'remP2O5',
    reqBalanceLow: 15,
    reqBalanceHigh: 99999,
    remBalanceLow: 80,
    remBalanceHigh: 99999,
  },
];
