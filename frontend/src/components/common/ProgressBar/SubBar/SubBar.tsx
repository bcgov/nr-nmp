/**
 * @summary A reusable Sub Progress Bar component
 */
// import { useEffect, useRef } from 'react';
import useAppService from '@/services/app/useAppService';
import { SubBarWrapper, StyledStep } from './subBar.styles';

function ProgressSubBar() {
  const { state } = useAppService();

  const ANIMALS_SUBSTEPS: string[] = [
    'Animals',
    'Manure and Imports',
    'Storage',
    'Nutrient Analysis',
  ];
  const FIELDS_SOIL_SUBSTEPS: string[] = ['Field List', 'Soil Tests', 'Crops'];
  const MANURE_COMPOST_SUBSTEPS: string[] = ['Manure and Imports', 'Nutrient Analysis'];

  const SOME_MAP: { [key: number]: string[] } = {
    2: ANIMALS_SUBSTEPS,
    3: FIELDS_SOIL_SUBSTEPS,
    4: MANURE_COMPOST_SUBSTEPS,
  };

  return (
    <SubBarWrapper>
      {state.step in SOME_MAP &&
        SOME_MAP[state.step].map((subStep) => (
          <StyledStep
            highlight={false}
            key={subStep}
          >
            {subStep}
          </StyledStep>
        ))}
    </SubBarWrapper>
  );
}

export default ProgressSubBar;
