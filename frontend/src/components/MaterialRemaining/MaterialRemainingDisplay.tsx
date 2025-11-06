/**
 * @summary React component for displaying material remaining status
 */
import { MaterialRemainingData } from '@/calculations/MaterialRemaining/Calculations';
import {
  MaterialRemainingContainer,
  MaterialRemainingTitle,
  EmptyState,
} from './materialRemaining.styles';
import MaterialRemainingItem from './MaterialRemainingItem';

interface MaterialRemainingDisplayProps {
  materialRemainingData: MaterialRemainingData;
  selectedSourceUuid?: string; // Filter to show only this specific material
}

/**
 * Main component for displaying material remaining status
 */
export default function MaterialRemainingDisplay({
  materialRemainingData,
  selectedSourceUuid,
}: MaterialRemainingDisplayProps) {
  const { appliedStoredManures, appliedImportedManures } = materialRemainingData;

  // Filter data if a specific source is selected
  const filteredStoredManures = selectedSourceUuid
    ? appliedStoredManures.filter((manure) => manure.sourceUuid === selectedSourceUuid)
    : appliedStoredManures;

  const filteredImportedManures = selectedSourceUuid
    ? appliedImportedManures.filter((manure) => manure.sourceUuid === selectedSourceUuid)
    : appliedImportedManures;

  const allAppliedManures = [...filteredStoredManures, ...filteredImportedManures];
  const hasAnyData = allAppliedManures.length > 0;

  if (!hasAnyData) {
    return (
      <MaterialRemainingContainer>
        <MaterialRemainingTitle>Material Remaining</MaterialRemainingTitle>
        <EmptyState>
          No manure materials found. Add animals or import manures to track remaining materials.
        </EmptyState>
      </MaterialRemainingContainer>
    );
  }

  return (
    <MaterialRemainingContainer>
      <MaterialRemainingTitle>Material Remaining</MaterialRemainingTitle>

      {/* Storage Systems */}
      {filteredStoredManures.map((manure) => (
        <MaterialRemainingItem
          key={`stored-${manure.sourceName}-${manure.totalAnnualManureToApply}`}
          appliedManure={manure}
        />
      ))}

      {/* Imported Manures */}
      {filteredImportedManures.map((manure) => (
        <MaterialRemainingItem
          key={`imported-${manure.sourceName}-${manure.totalAnnualManureToApply}`}
          appliedManure={manure}
        />
      ))}
    </MaterialRemainingContainer>
  );
}
