export interface BeefCattleData {
  id: '1';
  subtype?: string;
  animalsPerFarm?: number;
  daysCollected?: number | undefined;
}

// TODO: Add all subsequent animal data interfaces here
export type AnimalData = BeefCattleData;

// TODO: Add interfaces for the manure tab and nutrient tab
export type AnimalsWorkflowData = AnimalData;
