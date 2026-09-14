/**
 * @summary React component for displaying material remaining status
 */
import { MaterialRemainingData } from '@/types';
import {
  MaterialRemainingContainer,
  MaterialRemainingTitle,
  EmptyState,
} from './materialRemaining.styles';
import MaterialRemainingItem from './MaterialRemainingItem';

interface MaterialRemainingDisplayProps {
  materialRemainingData: MaterialRemainingData;
  selectedSourceUuid: string; // Filter to show only this specific material
}

/**
 * Main component for displaying material remaining status
 */
export default function MaterialRemainingDisplay({
  materialRemainingData,
  selectedSourceUuid,
}: MaterialRemainingDisplayProps) {
  const { appliedStoredManures, appliedUnstoredManures } = materialRemainingData;

  // Filter data if a specific source is selected
  const filteredMaterialRemaining = [
    ...appliedStoredManures, ...appliedUnstoredManures,
  ].filter((manure) => manure.sourceUuid === selectedSourceUuid);

  if (filteredMaterialRemaining.length === 0) {
    return (
      <MaterialRemainingContainer>
        <MaterialRemainingTitle>Material Remaining</MaterialRemainingTitle>
        <EmptyState>
          No manure materials found. Add animals or import manures to track remaining
          materials.
        </EmptyState>
      </MaterialRemainingContainer>
    );
  }

  return (
    <MaterialRemainingContainer>
      <MaterialRemainingTitle>Material Remaining</MaterialRemainingTitle>
      {filteredMaterialRemaining.map((manure) => (
        <MaterialRemainingItem
          key={`${manure.sourceName}-${manure.totalAnnualManureToApply}`}
          appliedManure={manure}
        />
      ))}
    </MaterialRemainingContainer>
  );
}
