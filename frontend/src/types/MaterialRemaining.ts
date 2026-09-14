import { ManureType } from './NMPFileAnimal';

export interface FieldApplicationData {
  fieldId: number;
  totalAppliedGallons?: number;
  totalAppliedTons?: number;
}

export interface AppliedManureData {
  sourceName: string;
  sourceUuid: string;
  manureType: ManureType;
  totalAnnualManureToApply: number;
  totalApplied: number;
  totalAnnualManureRemainingToApply: number;
  wholePercentApplied: number;
  wholePercentRemaining: number;
}

export interface MaterialRemainingData {
  appliedStoredManures: AppliedManureData[];
  appliedUnstoredManures: AppliedManureData[];
}
