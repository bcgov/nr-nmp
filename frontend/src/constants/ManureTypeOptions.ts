import { ManureType } from '@/types';

const MANURE_TYPE_OPTIONS: { id: ManureType; label: string }[] = [
  { id: ManureType.LIQUID, label: 'Liquid' },
  { id: ManureType.SOLID, label: 'Solid' },
];

export default MANURE_TYPE_OPTIONS;
