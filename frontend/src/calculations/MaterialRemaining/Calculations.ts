/**
 * @summary Material Remaining calculations
 * @description Functions for calculating material remaining status
 */
import {
  NMPFileYear,
  NMPFileField,
  NMPFileAppliedManure,
  Units,
  SolidMaterialApplicationTonPerAcreRateConversions,
  LiquidMaterialApplicationUsGallonsPerAcreRateConversions,
  FieldApplicationData,
  AppliedManureData,
  MaterialRemainingData,
  NMPFileImportedManure,
  NMPFileGeneratedManure,
  NMPFileDerivedManure,
  NMPFileManureStorageSystem,
} from '@/types';
import { getStandardizedAnnualManureAmount } from '@/utils/utils';
import {
  getDensityFactor,
  evaluateConversionFormula,
} from '@/utils/densityCalculations';

// Type aliases for convenience
export type SolidMaterialConversion =
  SolidMaterialApplicationTonPerAcreRateConversions;
export type LiquidMaterialConversion =
  LiquidMaterialApplicationUsGallonsPerAcreRateConversions;

// Re-export types for external use
export type { FieldApplicationData, AppliedManureData, MaterialRemainingData };

/**
 * Get conversion factor using conversion tables
 */
function getConversionFactor(
  unit: Units,
  solidConversions: SolidMaterialConversion[],
  liquidConversions: LiquidMaterialConversion[],
  manure: NMPFileAppliedManure,
  manureData?: { [manureId: number]: { moisture?: number } },
): number {
  // Determine density for solid manure calculations
  let density = 0.51; // Default density for 75% moisture
  if (manure && manureData && manureData[manure.manureId]?.moisture !== undefined) {
    density = getDensityFactor(manureData[manure.manureId].moisture!);
  }

  // Check solid conversions
  const solidConversion = solidConversions.find(
    (conv) => conv.applicationrateunit === unit.id,
  );
  if (solidConversion) {
    return evaluateConversionFormula(solidConversion.tonsperacreconversion, density);
  }

  // Check liquid conversions
  const liquidConversion = liquidConversions.find(
    (conv) => conv.applicationrateunit === unit.id,
  );
  if (liquidConversion) {
    return liquidConversion.usgallonsperacreconversion;
  }

  // Default conversion if not found in tables
  return unit.conversionlbton || 1.0;
}

/**
 * Calculate total applied amount for a manure application
 */
function calculateAppliedAmount(
  manure: NMPFileAppliedManure,
  fieldArea: number,
  manureData: { [manureId: number]: { moisture?: number } } | undefined,
  solidConversions: SolidMaterialConversion[],
  liquidConversions: LiquidMaterialConversion[],
  availableUnits: Units[] = [],
): number {
  const applicationRate = manure.applicationRate || 0;

  // Find the unit information for this application
  const unit = availableUnits.find((u) => u.id === manure.applUnitId);

  if (!unit) {
    // Fallback to simple calculation if unit not found
    return applicationRate * fieldArea;
  }

  // Calculate the total applied amount using the appropriate conversion
  let totalApplied = applicationRate * fieldArea;

  // Apply the conversion factor from the conversion tables
  const conversionFactor = getConversionFactor(
    unit,
    solidConversions,
    liquidConversions,
    manure,
    manureData,
  );
  totalApplied *= conversionFactor;

  return totalApplied;
}

/**
 * Calculate field applications
 */
function calculateFieldApplications(
  fields: NMPFileField[],
  sourceUuid: string,
  manureData: { [manureId: number]: { moisture?: number } } | undefined,
  solidConversions: SolidMaterialConversion[],
  liquidConversions: LiquidMaterialConversion[],
  availableUnits: Units[] = [],
): FieldApplicationData[] {
  const fieldApplications: FieldApplicationData[] = [];

  fields.forEach((field) => {
    if (!field.manures || field.manures.length === 0) return;

    // Find manures applied to this field that match our source UUID
    const matchingManures = field.manures.filter(
      (manure) => manure.sourceUuid === sourceUuid,
    );

    if (matchingManures.length === 0) return;

    // Calculate total application for this field
    const fieldApplication: FieldApplicationData = {
      fieldId: parseInt(field.fieldName, 10) || Math.random(),
    };

    matchingManures.forEach((manure) => {
      const appliedAmount = calculateAppliedAmount(
        manure,
        field.area,
        manureData,
        solidConversions,
        liquidConversions,
        availableUnits,
      );

      if (manure.solidLiquid === 'Liquid') {
        fieldApplication.totalAppliedGallons = (fieldApplication.totalAppliedGallons || 0)
          + appliedAmount;
      } else {
        fieldApplication.totalAppliedTons = (fieldApplication.totalAppliedTons || 0)
          + appliedAmount;
      }
    });

    fieldApplications.push(fieldApplication);
  });

  return fieldApplications;
}

/**
 * Calculate total applied amount across fields
 */
function calculateTotalApplied(fieldApplications: FieldApplicationData[]): number {
  return fieldApplications.reduce((total, field) => {
    const fieldTotal = (field.totalAppliedGallons || 0) + (field.totalAppliedTons || 0);
    return total + fieldTotal;
  }, 0);
}

/**
 * Calculate whole percent values
 */
function calculateWholePercentApplied(
  totalApplied: number,
  totalToApply: number,
): number {
  if (totalToApply === 0) return 0;
  return Math.floor((totalApplied / totalToApply) * 100);
}

function calculateWholePercentRemaining(
  totalRemaining: number,
  totalToApply: number,
): number {
  if (totalToApply === 0) return 0;

  const adjustedRemaining = totalRemaining >= 0 ? totalRemaining : 0;
  return Math.floor((adjustedRemaining / totalToApply) * 100);
}

/**
 * Create applied manure data for storage systems
 */
function createStoredManureData(
  yearData: NMPFileYear,
  storageSystem: NMPFileManureStorageSystem,
  manureData: { [manureId: number]: { moisture?: number } } | undefined,
  solidConversions: SolidMaterialConversion[],
  liquidConversions: LiquidMaterialConversion[],
  availableUnits: Units[] = [],
): AppliedManureData {
  const fieldApplications = calculateFieldApplications(
    yearData.fields,
    storageSystem.uuid,
    manureData,
    solidConversions,
    liquidConversions,
    availableUnits,
  );

  const totalApplied = calculateTotalApplied(fieldApplications);
  const totalAnnualManure = getStandardizedAnnualManureAmount(storageSystem);
  const totalRemaining = totalAnnualManure - totalApplied;
  const wholePercentApplied = calculateWholePercentApplied(totalApplied, totalAnnualManure);
  const wholePercentRemaining = calculateWholePercentRemaining(
    Math.max(0, totalRemaining),
    totalAnnualManure,
  );

  return {
    sourceName: storageSystem.name,
    sourceUuid: storageSystem.uuid,
    manureType: storageSystem.manureType,
    totalAnnualManureToApply: totalAnnualManure,
    totalApplied,
    totalAnnualManureRemainingToApply: totalRemaining,
    wholePercentApplied,
    wholePercentRemaining,
  };
}

/**
 * Create applied manure data for imported manures
 */
function createUnstoredManureData(
  yearData: NMPFileYear,
  unstoredManure: NMPFileGeneratedManure | NMPFileImportedManure | NMPFileDerivedManure,
  manureData: { [manureId: number]: { moisture?: number } } | undefined,
  solidConversions: SolidMaterialConversion[],
  liquidConversions: LiquidMaterialConversion[],
  availableUnits: Units[] = [],
): AppliedManureData {
  const fieldApplications = calculateFieldApplications(
    yearData.fields,
    unstoredManure.uuid,
    manureData,
    solidConversions,
    liquidConversions,
    availableUnits,
  );

  const totalApplied = calculateTotalApplied(fieldApplications);
  const totalAnnualManure = getStandardizedAnnualManureAmount(unstoredManure);
  const totalRemaining = totalAnnualManure - totalApplied;
  const wholePercentApplied = calculateWholePercentApplied(totalApplied, totalAnnualManure);
  const wholePercentRemaining = calculateWholePercentRemaining(
    Math.max(0, totalRemaining),
    totalAnnualManure,
  );

  return {
    sourceName: unstoredManure.uniqueMaterialName,
    sourceUuid: unstoredManure.uuid,
    manureType: unstoredManure.manureType!,
    totalAnnualManureToApply: totalAnnualManure,
    totalApplied,
    totalAnnualManureRemainingToApply: totalRemaining,
    wholePercentApplied,
    wholePercentRemaining,
  };
}

/**
 * Calculate material remaining data for a year
 */
export function calculateMaterialRemainingData(
  yearData: NMPFileYear,
  manureData: { [manureId: number]: { moisture?: number } } | undefined,
  solidConversions: SolidMaterialConversion[],
  liquidConversions: LiquidMaterialConversion[],
  availableUnits: Units[] = [],
): MaterialRemainingData {
  const appliedStoredManures: AppliedManureData[] = [];
  const appliedUnstoredManures: AppliedManureData[] = [];

  // Process Storage Systems
  if (yearData.manureStorageSystems) {
    yearData.manureStorageSystems.forEach((storageSystem) => {
      const appliedStoredManure = createStoredManureData(
        yearData,
        storageSystem,
        manureData,
        solidConversions,
        liquidConversions,
        availableUnits,
      );
      appliedStoredManures.push(appliedStoredManure);
    });
  }

  // Process Unstored Manures
  const singleManures = [
    ...(yearData.generatedManures || []),
    ...(yearData.importedManures || []),
    ...(yearData.derivedManures || []),
  ].filter((m) => !m.assignedToStoredSystem);
  singleManures.forEach((unstoredManure) => {
    const appliedUnstoredManure = createUnstoredManureData(
      yearData,
      unstoredManure,
      manureData,
      solidConversions,
      liquidConversions,
      availableUnits,
    );
    appliedUnstoredManures.push(appliedUnstoredManure);
  });

  return {
    appliedStoredManures,
    appliedUnstoredManures,
  };
}
