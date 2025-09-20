/**
 * @summary React hook for Material Remaining calculations
 */
import { useMemo } from 'react';
import { NMPFileYear, ManureType } from '@/types';
import {
  calculateMaterialRemainingData,
  type MaterialRemainingData,
  type AppliedManureData,
} from './Calculations';

/**
 * Hook for calculating and filtering material remaining data
 */
export default function useMaterialRemaining(
  yearData: NMPFileYear | null,
  selectedMaterialType?: ManureType | null,
) {
  const materialRemainingData = useMemo((): MaterialRemainingData | null => {
    if (!yearData) return null;
    return calculateMaterialRemainingData(yearData);
  }, [yearData]);

  const filteredData = useMemo((): AppliedManureData[] => {
    if (!materialRemainingData) return [];

    const allMaterials = [
      ...materialRemainingData.appliedStoredManures,
      ...materialRemainingData.appliedImportedManures,
    ];

    if (!selectedMaterialType) return allMaterials;

    return allMaterials.filter((material) => material.manureMaterialType === selectedMaterialType);
  }, [materialRemainingData, selectedMaterialType]);

  return {
    materialRemainingData,
    filteredData,
    appliedStoredManures: materialRemainingData?.appliedStoredManures || [],
    appliedImportedManures: materialRemainingData?.appliedImportedManures || [],
    warnings: materialRemainingData?.materialsRemainingWarnings || [],
  };
}
