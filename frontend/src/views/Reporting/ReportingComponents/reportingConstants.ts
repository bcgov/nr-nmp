import { UserOptions } from 'jspdf-autotable';

export const sharedAutoTableSettings: Partial<UserOptions> = {
  theme: 'grid',
  styles: { lineColor: 'black', lineWidth: 0.5, textColor: 'black', font: 'BCSans' },
  headStyles: { fillColor: [164, 205, 215], lineWidth: 0.5 },
};

export type FertilizerRequiredStep = {
  name: string;
  totalAmount: number;
  unit: string;
};

export const superscriptNumberDict: { [num: string]: string } = {
  0: '⁰',
  1: '¹',
  2: '²',
  3: '³',
  4: '⁴',
  5: '⁵',
  6: '⁶',
  7: '⁷',
  8: '⁸',
  9: '⁹',
};
