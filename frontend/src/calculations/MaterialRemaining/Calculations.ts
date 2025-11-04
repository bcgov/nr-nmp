/**
 * @summary Material Remaining calculations
 * @description Functions for calculating material remaining status
 */
import { evaluate } from 'mathjs';
import axios from 'axios';
import { env } from '@/env';
import { NMPFileYear, NMPFileField, NMPFileAppliedManure, ManureType, Units } from '@/types';
import { getStandardizedAnnualManureAmount } from '@/utils/utils';

export interface SolidMaterialConversion {
  id: number;
  applicationrateunit: number;
  applicationrateunitname: string;
  tonsperacreconversion: string;
}

export interface LiquidMaterialConversion {
  id: number;
  applicationrateunit: number;
  applicationrateunitname: string;
  usgallonsperacreconversion: number;
}

export interface FieldApplicationData {
  fieldId: number;
  totalAppliedGallons?: number;
  totalAppliedTons?: number;
}

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

export interface MaterialRemainingData {
  appliedStoredManures: AppliedManureData[];
  appliedImportedManures: AppliedManureData[];
  materialsRemainingWarnings: string[];
}

/**
 * Fetch solid material conversion factors from the database
 */
export async function fetchSolidMaterialConversions(): Promise<SolidMaterialConversion[]> {
  const response = await axios.get(
    `${env.VITE_BACKEND_URL}/api/solidmaterialapplicationtonperacrerateconversions/`,
  );
  return response.data;
}

/**
 * Fetch liquid material conversion factors from the database
 */
export async function fetchLiquidMaterialConversions(): Promise<LiquidMaterialConversion[]> {
  const response = await axios.get(
    `${env.VITE_BACKEND_URL}/api/liquidmaterialapplicationusgallonsperacrerateconversions/`,
  );
  return response.data;
}

/**
 * Fetch both solid and liquid conversion tables
 */
export async function fetchAllConversionTables(): Promise<{
  solidConversions: SolidMaterialConversion[];
  liquidConversions: LiquidMaterialConversion[];
}> {
  const [solidConversions, liquidConversions] = await Promise.all([
    fetchSolidMaterialConversions(),
    fetchLiquidMaterialConversions(),
  ]);

  return {
    solidConversions,
    liquidConversions,
  };
}

/**
 * Get density factor based on moisture percentage
 */
// function getDensityFactor(moisturePercentage: number): number {
//   if (moisturePercentage <= 60) return 0.6;
//   if (moisturePercentage <= 75) return 0.51;
//   if (moisturePercentage <= 85) return 0.42;
//   if (moisturePercentage <= 95) return 0.33;
//   return 0.24;
// }

function getDensityFactor(moisturePercentage: number): number {
  if (moisturePercentage < 40) return 0.27;
  if (moisturePercentage > 82) return 0.837;

  const moistureDecimal = moisturePercentage / 100;
  return (
    7.9386 * moistureDecimal ** 3 - 16.43 * moistureDecimal ** 2 + 11.993 * moistureDecimal - 2.3975
  );
}

/**
 * Evaluate conversion formula with dynamic values
 */
function evaluateConversionFormula(formula: string, density: number): number {
  try {
    // Replace 'density' in the formula with the actual density value
    const formulaWithDensity = formula.replace(/density/g, density.toString());
    return evaluate(formulaWithDensity);
  } catch (error) {
    console.error('Error evaluating conversion formula:', formula, error);
    return 1.0; // Fallback to no conversion
  }
}

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
  const solidConversion = solidConversions.find((conv) => conv.applicationrateunit === unit.id);
  if (solidConversion) {
    return evaluateConversionFormula(solidConversion.tonsperacreconversion, density);
  }

  // Check liquid conversions
  const liquidConversion = liquidConversions.find((conv) => conv.applicationrateunit === unit.id);
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
    const matchingManures = field.manures.filter((manure) => manure.sourceUuid === sourceUuid);

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
function calculateWholePercentApplied(totalApplied: number, totalToApply: number): number {
  if (totalToApply === 0) return 0;
  return Math.floor((totalApplied / totalToApply) * 100);
}

function calculateWholePercentRemaining(totalRemaining: number, totalToApply: number): number {
  if (totalToApply === 0) return 0;

  const adjustedRemaining = totalRemaining >= 0 ? totalRemaining : 0;
  return Math.floor((adjustedRemaining / totalToApply) * 100);
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
  const totalAnnualManureToApply = getStandardizedAnnualManureAmount(storageSystem);
  const totalRemaining = Math.max(0, totalAnnualManureToApply - totalApplied);
  const wholePercentApplied = calculateWholePercentApplied(totalApplied, totalAnnualManureToApply);
  const wholePercentRemaining = calculateWholePercentRemaining(
    totalRemaining,
    totalAnnualManureToApply,
  );

  return {
    sourceName: storageSystem.name,
    sourceUuid: storageSystem.uuid,
    manureMaterialType: storageSystem.manureType || null,
    totalAnnualManureToApply,
    totalApplied,
    totalAnnualManureRemainingToApply: totalRemaining,
    wholePercentApplied,
    wholePercentRemaining,
    appliedMessage: `${storageSystem.name}: ${wholePercentApplied}%`,
    remainingToApplyMessage: `${storageSystem.name}: ${wholePercentRemaining}%`,
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
  manureData: { [manureId: number]: { moisture?: number } } | undefined,
  solidConversions: SolidMaterialConversion[],
  liquidConversions: LiquidMaterialConversion[],
  availableUnits: Units[] = [],
): AppliedManureData {
  const fieldApplications = calculateFieldApplications(
    yearData.fields,
    importedManure.uuid,
    manureData,
    solidConversions,
    liquidConversions,
    availableUnits,
  );

  const totalApplied = calculateTotalApplied(fieldApplications);
  const totalAnnualManureToApply = getStandardizedAnnualManureAmount(importedManure);
  const totalRemaining = Math.max(0, totalAnnualManureToApply - totalApplied);
  const wholePercentApplied = calculateWholePercentApplied(totalApplied, totalAnnualManureToApply);
  const wholePercentRemaining = calculateWholePercentRemaining(
    totalRemaining,
    totalAnnualManureToApply,
  );

  return {
    sourceName: importedManure.managedManureName,
    sourceUuid: importedManure.uuid,
    manureMaterialType: importedManure.manureType || null,
    totalAnnualManureToApply,
    totalApplied,
    totalAnnualManureRemainingToApply: totalRemaining,
    wholePercentApplied,
    wholePercentRemaining,
    appliedMessage: `${importedManure.managedManureName}: ${wholePercentApplied}%`,
    remainingToApplyMessage: `${importedManure.managedManureName}: ${wholePercentRemaining}%`,
    formattedTotalApplied: formatAmountWithUnit(totalApplied, importedManure.manureType),
    formattedTotalRemaining: formatAmountWithUnit(totalRemaining, importedManure.manureType, true),
    formattedTotalToApply: formatAmountWithUnit(
      totalAnnualManureToApply,
      importedManure.manureType,
    ),
  };
}

/**
 * Main function to calculate material remaining data for a year
 */
export function calculateMaterialRemainingData(
  yearData: NMPFileYear,
  manureData: { [manureId: number]: { moisture?: number } } | undefined,
  solidConversions: SolidMaterialConversion[],
  liquidConversions: LiquidMaterialConversion[],
  availableUnits: Units[] = [],
): MaterialRemainingData {
  const appliedStoredManures: AppliedManureData[] = [];
  const appliedImportedManures: AppliedManureData[] = [];
  const materialsRemainingWarnings: string[] = [];

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

  // Process Imported Manures
  if (yearData.importedManures) {
    yearData.importedManures.forEach((importedManure) => {
      const appliedImportedManure = createImportedManureData(
        yearData,
        importedManure,
        manureData,
        solidConversions,
        liquidConversions,
        availableUnits,
      );
      appliedImportedManures.push(appliedImportedManure);
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

/**
 * Enhanced material remaining calculation
 */
export async function calculateMaterialRemaining(
  yearData: NMPFileYear,
  manureData?: { [manureId: number]: { moisture?: number } },
  availableUnits: Units[] = [],
): Promise<MaterialRemainingData> {
  const { solidConversions, liquidConversions } = await fetchAllConversionTables();

  return calculateMaterialRemainingData(
    yearData,
    manureData,
    solidConversions,
    liquidConversions,
    availableUnits,
  );
}
