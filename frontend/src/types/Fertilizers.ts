export type FertilizerType = {
  id: number;
  name: string;
  dryliquid: string;
  custom: boolean;
};

export type FertilizerUnit = {
  id: number;
  name: string;
  dryliquid: string;
  conversiontoimperialgallonsperacre: number;
  farmrequirednutrientsstdunitsconversion: number;
  farmrequirednutrientsstdunitsareaconversion: number;
};

export type Fertilizer = {
  id: number;
  name: string;
  dryliquid: string;
  nitrogen: number;
  phosphorous: number;
  potassium: number;
  sortnum: number;
};
