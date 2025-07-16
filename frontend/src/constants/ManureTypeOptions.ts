import { MANURE_LIQUID, MANURE_SOLID } from '@/types/Animals';

const manureTypeOptions: { id: string; label: string }[] = [
  { id: MANURE_LIQUID, label: 'Liquid' },
  { id: MANURE_SOLID, label: 'Solid' },
];

export default manureTypeOptions;
