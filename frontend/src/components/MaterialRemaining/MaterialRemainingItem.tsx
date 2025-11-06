/**
 * @summary Individual material remaining item component
 */
import { AppliedManureData } from '@/calculations/MaterialRemaining/Calculations';
import {
  MaterialRemainingItem as StyledMaterialRemainingItem,
  SourceName,
  PercentageDisplay,
} from './materialRemaining.styles';

interface MaterialRemainingItemProps {
  appliedManure: AppliedManureData;
}

export default function MaterialRemainingItem({ appliedManure }: MaterialRemainingItemProps) {
  return (
    <StyledMaterialRemainingItem>
      <SourceName>{appliedManure.sourceName}</SourceName>
      <PercentageDisplay $percentRemaining={appliedManure.wholePercentRemaining}>
        {appliedManure.wholePercentRemaining}% Remaining
      </PercentageDisplay>
    </StyledMaterialRemainingItem>
  );
}
