export type FertilizerTypeObject = {
  id: number;
  name: string;
  dryliquid: string;
  custom: boolean;
};

export type FertilizerUnitObject = {
  id: number;
  name: string;
  dryliquid: string;
  conversiontoimperialgallonsperacre: number;
  farmrequirednutrientsstdunitsconversion: number;
  farmrequirednutrientsstdunitsareaconversion: number;
};

export type FertilizerObject = {
  id: number;
  name: string;
  dryliquid: string;
  nitrogen: number;
  phosphorous: number;
  potassium: number;
  sortnum: number;
};
