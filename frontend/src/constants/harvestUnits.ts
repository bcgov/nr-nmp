// eslint-disable-next-line no-shadow
export enum HarvestUnit {
  BushelsPerAcre = 'bc/ac',
  TonsPerAcre = 'ton/ac',
}

export const HARVEST_UNIT_OPTIONS: { label: string }[] = [
  { label: HarvestUnit.BushelsPerAcre },
  { label: HarvestUnit.TonsPerAcre },
];
