import { useCallback } from 'react';
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
} from '@/constants/routes';

type ProgressStepperProps = {
  step: string;
};

const stepsWithAnimals = [
  'Home',
  'Farm Information',
  'Animals and Manure',
  'Fields and Soil',
  'Calculate Nutrients',
  'Reporting',
];

const stepsWithoutAnimals = [
  'Home',
  'Farm Information',
  'Fields and Soil',
  'Calculate Nutrients',
  'Reporting',
];

export default function ProgressStepper({ step }: ProgressStepperProps) {
  const { state } = useAppState();
  const { pathname } = useLocation();

  const displayAnimalsStep = useCallback(() => {
    if (state.showAnimalsStep) {
      return stepsWithAnimals;
    }
    return stepsWithoutAnimals;
  }, [state.showAnimalsStep]);

  const displayActiveStep = useCallback(() => {
    const animalStepIncrease = state.showAnimalsStep ? 1 : 0;

    switch (pathname) {
      case LANDING_PAGE:
        return 0;
      case FARM_INFORMATION:
        return 1;
      case ADD_ANIMALS:
      case MANURE_IMPORTS:
      case NUTRIENT_ANALYSIS:
        return 2;
      case FIELD_LIST:
      case SOIL_TESTS:
      case CROPS:
        return 2 + animalStepIncrease;
      case CALCULATE_NUTRIENTS:
        return 3 + animalStepIncrease;
    }
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
        activeStep={displayActiveStep()}
        alternativeLabel
      >
        {displayAnimalsStep().map((label) => (
          <Step
            sx={{ paddingX: '0' }}
            key={label}
          >
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}
