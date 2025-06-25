import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';

import useAppState from '../../../hooks/useAppState';
import {
  ADD_ANIMALS,
  CALCULATE_NUTRIENTS,
  CROPS,
  FARM_INFORMATION,
  FIELD_LIST,
  LANDING_PAGE,
  MANURE_IMPORTS,
  NUTRIENT_ANALYSIS,
  SOIL_TESTS,
  REPORTING,
  STORAGE,
} from '@/constants/routes';

interface StepConfig {
  name: string;
  paths: string[];
}

export default function ProgressStepper() {
  const { state } = useAppState();
  const { pathname } = useLocation();

  const steps: StepConfig[] = useMemo(() => {
    const baseSteps = [
      { name: 'Home', paths: [LANDING_PAGE] },
      { name: 'Farm Information', paths: [FARM_INFORMATION] },
    ];

    if (pathname === LANDING_PAGE || pathname === FARM_INFORMATION) {
      return baseSteps;
    }

    if (state.showAnimalsStep) {
      return stepsWithAnimals;
    }
    return stepsWithoutAnimals;
  }, [state.showAnimalsStep]);

  const displayActiveStep = useCallback((): number | undefined => {
    const animalStepIncrease = state.showAnimalsStep ? 1 : 0;

    // eslint-disable-next-line default-case
    switch (pathname) {
      case LANDING_PAGE:
        return 0;
      case FARM_INFORMATION:
        return 1;
      case ADD_ANIMALS:
      case MANURE_IMPORTS:
      case STORAGE:
      case NUTRIENT_ANALYSIS:
        return 2;
      case FIELD_LIST:
      case SOIL_TESTS:
      case CROPS:
        return 2 + animalStepIncrease;
      case CALCULATE_NUTRIENTS:
        return 3 + animalStepIncrease;
      case REPORTING:
        return 4 + animalStepIncrease;
    }

    return undefined;
  }, [pathname, state.showAnimalsStep]);

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      paddingY="2.5rem"
      width="100%"
    >
      <Stepper
        sx={{ width: '100%' }}
        activeStep={activeStep}
        alternativeLabel
      >
        {steps.map((step) => (
          <Step
            sx={{ paddingX: '0' }}
            key={step.name}
          >
            <StepLabel>{step.name}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}
