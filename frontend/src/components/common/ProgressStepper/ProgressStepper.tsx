import { useCallback } from 'react';

import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';

import useAppService from '../../../services/app/useAppService';
import {
  ANIMALS_MANURE,
  CALCULATE_NUTRIENTS,
  FARM_INFORMATION,
  FIELD_SOIL,
  LANDING_PAGE,
} from '@/constants/RouteConstants';

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

export default function HorizontalLinearAlternativeLabelStepper({ step }: ProgressStepperProps) {
  const { state } = useAppService();

  const displayAnimalsStep = useCallback(() => {
    if (state.showAnimals) {
      return stepsWithAnimals;
    }
    return stepsWithoutAnimals;
  }, [state.showAnimals]);

  const displayActiveStep = useCallback(() => {
    let stepNumber = 0;
    if (state.showAnimals) {
      switch (step) {
        case LANDING_PAGE:
          break;
        case FARM_INFORMATION:
          stepNumber = 1;
          break;
        case ANIMALS_MANURE:
          stepNumber = 2;
          break;
        case FIELD_SOIL:
          stepNumber = 3;
          break;
        case CALCULATE_NUTRIENTS:
          stepNumber = 4;
          break;
        default:
          break;
      }
    } else {
      switch (step) {
        case LANDING_PAGE:
          break;
        case FARM_INFORMATION:
          stepNumber = 1;
          break;
        case FIELD_SOIL:
          stepNumber = 2;
          break;
        case CALCULATE_NUTRIENTS:
          stepNumber = 3;
          break;
        default:
          break;
      }
    }
    return stepNumber;
  }, [step, state.showAnimals]);

  return (
    <Box sx={{ width: '100%', paddingTop: '2.5rem', paddingBottom: '2.5rem' }}>
      <Stepper
        activeStep={displayActiveStep()}
        alternativeLabel
      >
        {displayAnimalsStep().map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}
