/**
 * @summary Material Remaining calculations
 * @description Functions for calculating material remaining status
 */
import { NMPFileYear, NMPFileField, NMPFileAppliedManure, ManureType, Units } from '@/types';
import { getStandardizedAnnualManureAmount } from '@/utils/utils';

/**
 * Interface for field application data
 */
export interface FieldApplicationData {
  fieldId: number;
  totalAppliedGallons?: number;
  totalAppliedTons?: number;
}

/**
 * Interface for individual applied manure data
 */
export interface AppliedManureData {
  sourceName: string;
  sourceUuid: string;
  manureMaterialType: ManureType | null;
  totalAnnualManureToApply: number;
  totalApplied: number;
  totalAnnualManureRemainingToApply: number;
  wholePercentApplied: number;
  wholePercentRemaining: number;
  appliedMessage: string;
  remainingToApplyMessage: string;
  formattedTotalApplied: string;
  formattedTotalRemaining: string;
  formattedTotalToApply: string;
}

/**
 * Interface for material remaining data
 */
export interface MaterialRemainingData {
  appliedStoredManures: AppliedManureData[];
  appliedImportedManures: AppliedManureData[];
  materialsRemainingWarnings: string[];
}

/**
 * Calculate total applied amount for a manure application
 */
function calculateAppliedAmount(
  manure: NMPFileAppliedManure,
  fieldArea: number,
  availableUnits: Units[] = [],
): number {
  const applicationRate = manure.applicationRate || 0;

  // Find the unit information for this application
  const unit = availableUnits.find((u) => u.id === manure.applUnitId);

  if (!unit) {
    // Fallback to simple calculation if unit not found
    return Math.round(applicationRate * fieldArea);
  }

  // Calculate the total applied amount using the appropriate conversion
  // The application rate is per acre, so multiply by field area to get total applied
  let totalApplied = applicationRate * fieldArea;

  if (unit.conversionlbton && unit.conversionlbton !== 1) {
    totalApplied *= unit.conversionlbton;
  }

  return Math.round(totalApplied);
}

/**
 * Calculate field applications for a specific source
 */
function calculateFieldApplicationsForSource(
  fields: NMPFileField[],
  sourceUuid: string,
  availableUnits: Units[] = [],
): FieldApplicationData[] {
  const fieldApplications: FieldApplicationData[] = [];

  fields.forEach((field) => {
    if (!field.manures || field.manures.length === 0) return;

    // Find manures applied to this field that match our source UUID
    const matchingManures = field.manures.filter((manure) => manure.sourceUuid === sourceUuid);

    if (matchingManures.length === 0) return;

    // Calculate total application for this field
    const fieldApplication: FieldApplicationData = {
      fieldId: parseInt(field.fieldName, 10) || Math.random(),
    };

    matchingManures.forEach((manure) => {
      const appliedAmount = calculateAppliedAmount(manure, field.area, availableUnits);

      if (manure.solidLiquid === 'Liquid') {
        fieldApplication.totalAppliedGallons =
          (fieldApplication.totalAppliedGallons || 0) + appliedAmount;
      } else {
        fieldApplication.totalAppliedTons =
          (fieldApplication.totalAppliedTons || 0) + appliedAmount;
      }
    });

    fieldApplications.push(fieldApplication);
  });

  return fieldApplications;
}

/**
 * Calculate total applied amount across all fields
 */
function calculateTotalApplied(fieldApplications: FieldApplicationData[]): number {
  return fieldApplications.reduce((total, field) => {
    const fieldTotal = (field.totalAppliedGallons || 0) + (field.totalAppliedTons || 0);
    return total + fieldTotal;
  }, 0);
}

/**
 * Calculate whole percent values with rounding
 */
function calculateWholePercentApplied(totalApplied: number, totalToApply: number): number {
  if (totalToApply === 0) return 0;
  return Math.round((totalApplied / totalToApply) * 100);
}

function calculateWholePercentRemaining(percentApplied: number): number {
  return Math.max(0, 100 - percentApplied);
}

/**
 * Format amount with appropriate units
 */
function formatAmountWithUnit(
  amount: number,
  manureType: ManureType | null,
  isRemaining: boolean = false,
): string {
  const unit = manureType === ManureType.Liquid ? 'gallons' : 'tons';
  const roundedAmount = Math.round(amount);

  if (isRemaining && amount <= 0) {
    return `No material remaining`;
  }

  return `${roundedAmount.toLocaleString()} ${unit}`;
}

/**
 * Create applied manure data for storage systems
 */
function createStoredManureData(
  yearData: NMPFileYear,
  storageSystem: any,
  availableUnits: Units[] = [],
): AppliedManureData {
  const fieldApplications = calculateFieldApplicationsForSource(
    yearData.fields,
    storageSystem.uuid,
    availableUnits,
  );

  const totalApplied = calculateTotalApplied(fieldApplications);
  const totalAnnualManureToApply = getStandardizedAnnualManureAmount(storageSystem);
  const totalRemaining = Math.max(0, totalAnnualManureToApply - totalApplied);
  const wholePercentApplied = calculateWholePercentApplied(totalApplied, totalAnnualManureToApply);
  const wholePercentRemaining = calculateWholePercentRemaining(wholePercentApplied);

  return {
    sourceName: storageSystem.name,
    sourceUuid: storageSystem.uuid,
    manureMaterialType: storageSystem.manureType || null,
    totalAnnualManureToApply,
    totalApplied,
    totalAnnualManureRemainingToApply: totalRemaining,
    wholePercentApplied,
    wholePercentRemaining,
    appliedMessage: `Applied ${wholePercentApplied}% of total available`,
    remainingToApplyMessage: `${wholePercentRemaining}% remaining to apply`,
    formattedTotalApplied: formatAmountWithUnit(totalApplied, storageSystem.manureType),
    formattedTotalRemaining: formatAmountWithUnit(totalRemaining, storageSystem.manureType, true),
    formattedTotalToApply: formatAmountWithUnit(totalAnnualManureToApply, storageSystem.manureType),
  };
}

/**
 * Create applied manure data for imported manures
 */
function createImportedManureData(
  yearData: NMPFileYear,
  importedManure: any,
  availableUnits: Units[] = [],
): AppliedManureData {
  const fieldApplications = calculateFieldApplicationsForSource(
    yearData.fields,
    importedManure.uuid,
    availableUnits,
  );

  const totalApplied = calculateTotalApplied(fieldApplications);
  const totalAnnualManureToApply = getStandardizedAnnualManureAmount(importedManure);
  const totalRemaining = Math.max(0, totalAnnualManureToApply - totalApplied);
  const wholePercentApplied = calculateWholePercentApplied(totalApplied, totalAnnualManureToApply);
  const wholePercentRemaining = calculateWholePercentRemaining(wholePercentApplied);

  return {
    sourceName: importedManure.managedManureName,
    sourceUuid: importedManure.uuid,
    manureMaterialType: importedManure.manureType || null,
    totalAnnualManureToApply,
    totalApplied,
    totalAnnualManureRemainingToApply: totalRemaining,
    wholePercentApplied,
    wholePercentRemaining,
    appliedMessage: `Applied ${wholePercentApplied}% of total available`,
    remainingToApplyMessage: `${wholePercentRemaining}% remaining to apply`,
    formattedTotalApplied: formatAmountWithUnit(totalApplied, importedManure.manureType),
    formattedTotalRemaining: formatAmountWithUnit(totalRemaining, importedManure.manureType, true),
    formattedTotalToApply: formatAmountWithUnit(
      totalAnnualManureToApply,
      importedManure.manureType,
    ),
  };
}

/**
 * Check for warnings and add them to the warnings array
 */
function checkAndAddWarnings(appliedManure: AppliedManureData, warnings: string[]): void {
  if (appliedManure.totalAnnualManureRemainingToApply < 0) {
    warnings.push(
      `Warning: ${appliedManure.sourceName} has been over-applied by ${Math.abs(
        appliedManure.totalAnnualManureRemainingToApply,
      )} units`,
    );
  }

  if (appliedManure.wholePercentRemaining <= 10 && appliedManure.wholePercentRemaining > 0) {
    warnings.push(
      `Alert: ${appliedManure.sourceName} is running low (${appliedManure.wholePercentRemaining}% remaining)`,
    );
  }
}

/**
 * Main function to calculate material remaining data for a year
 */
export function calculateMaterialRemainingData(
  yearData: NMPFileYear,
  availableUnits: Units[] = [],
): MaterialRemainingData {
  const appliedStoredManures: AppliedManureData[] = [];
  const appliedImportedManures: AppliedManureData[] = [];
  const materialsRemainingWarnings: string[] = [];

  // Process Storage Systems
  if (yearData.manureStorageSystems) {
    yearData.manureStorageSystems.forEach((storageSystem) => {
      const appliedStoredManure = createStoredManureData(yearData, storageSystem, availableUnits);
      appliedStoredManures.push(appliedStoredManure);

      // Check for warnings
      checkAndAddWarnings(appliedStoredManure, materialsRemainingWarnings);
    });
  }

  // Process Imported Manures
  if (yearData.importedManures) {
    yearData.importedManures.forEach((importedManure) => {
      const appliedImportedManure = createImportedManureData(
        yearData,
        importedManure,
        availableUnits,
      );
      appliedImportedManures.push(appliedImportedManure);

      // Check for warnings
      checkAndAddWarnings(appliedImportedManure, materialsRemainingWarnings);
    });
  }

  return {
    appliedStoredManures,
    appliedImportedManures,
    materialsRemainingWarnings,
  };
}

/**
 * Calculate summary statistics for material remaining data
 */
export function calculateMaterialRemainingSummary(data: MaterialRemainingData): {
  totalSources: number;
  sourcesWithRemainingMaterial: number;
  sourcesOverApplied: number;
  averagePercentApplied: number;
} {
  const allAppliedManures = [...data.appliedStoredManures, ...data.appliedImportedManures];
  const totalSources = allAppliedManures.length;

  if (totalSources === 0) {
    return {
      totalSources: 0,
      sourcesWithRemainingMaterial: 0,
      sourcesOverApplied: 0,
      averagePercentApplied: 0,
    };
  }

  const sourcesWithRemainingMaterial = allAppliedManures.filter(
    (manure) => manure.wholePercentRemaining >= 10,
  ).length;

  const sourcesOverApplied = allAppliedManures.filter(
    (manure) => manure.totalAnnualManureRemainingToApply < 0,
  ).length;

  const totalPercentApplied = allAppliedManures.reduce(
    (sum, manure) => sum + manure.wholePercentApplied,
    0,
  );

  const averagePercentApplied = Math.round(totalPercentApplied / totalSources);

  return {
    totalSources,
    sourcesWithRemainingMaterial,
    sourcesOverApplied,
    averagePercentApplied,
  };
}
