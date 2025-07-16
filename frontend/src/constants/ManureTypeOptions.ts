import { ManureType } from '@/types';

const MANURE_TYPE_OPTIONS: { id: ManureType; label: string }[] = [
  { id: ManureType.Liquid, label: 'Liquid' },
  { id: ManureType.Solid, label: 'Solid' },
];

export default MANURE_TYPE_OPTIONS;
