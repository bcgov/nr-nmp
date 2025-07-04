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
      return [
        ...baseSteps,
        {
          name: 'Animals and Manure',
          paths: [ADD_ANIMALS, MANURE_IMPORTS, STORAGE, NUTRIENT_ANALYSIS],
        },
        { name: 'Fields and Soil', paths: [FIELD_LIST, SOIL_TESTS, CROPS] },
        { name: 'Calculate Nutrients', paths: [CALCULATE_NUTRIENTS] },
        { name: 'Reporting', paths: [REPORTING] },
      ];
    }

    return [
      ...baseSteps,
      { name: 'Fields and Soil', paths: [FIELD_LIST, SOIL_TESTS, CROPS] },
      { name: 'Manure and Compost', paths: [MANURE_IMPORTS, NUTRIENT_ANALYSIS] },
      { name: 'Calculate Nutrients', paths: [CALCULATE_NUTRIENTS] },
      { name: 'Reporting', paths: [REPORTING] },
    ];
  }, [state.showAnimalsStep, pathname]);

  const activeStep = useMemo(
    () => steps.findIndex((step) => step.paths.includes(pathname)),
    [steps, pathname],
  );

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
