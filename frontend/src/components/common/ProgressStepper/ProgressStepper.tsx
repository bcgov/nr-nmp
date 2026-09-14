import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepButton from '@mui/material/StepButton';
import RedirectDialog from '../RedirectDialog/RedirectDialog';
import { downloadBlob } from '@/views/Reporting/utils';

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
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState<boolean>(false);

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
      {
        name: 'Manure and Compost',
        paths: [MANURE_IMPORTS, NUTRIENT_ANALYSIS],
      },
      { name: 'Calculate Nutrients', paths: [CALCULATE_NUTRIENTS] },
      { name: 'Reporting', paths: [REPORTING] },
    ];
  }, [state.showAnimalsStep, pathname]);

  const activeStep = useMemo(
    () => steps.findIndex((step) => step.paths.includes(pathname)),
    [steps, pathname],
  );

  // navigate to past step, if home open warning dialog
  const handleStepClick = (stepIndex: number, stepPath: string) => {
    if (stepIndex === 0) {
      if (state.nmpFile.years.length === 0) {
        navigate(LANDING_PAGE);
      } else {
        setIsOpen(true);
      }
    } else if (stepIndex < activeStep) {
      navigate(stepPath);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: '2.5rem',
        paddingBottom: '2.5rem',
        width: '100%',
      }}
    >
      {isOpen && (
        <RedirectDialog
          isOpen={isOpen}
          onOpenChange={(b) => setIsOpen(b)}
          downloadFile={() => downloadBlob(state.nmpFile)}
        />
      )}
      <Stepper
        sx={{ width: '100%' }}
        activeStep={activeStep}
        alternativeLabel
      >
        {steps.map((step, index) => (
          <Step
            sx={{ paddingX: '0' }}
            key={step.name}
          >
            <StepButton
              onClick={() => handleStepClick(index, step.paths[0])}
              disabled={index >= activeStep}
            >
              {step.name}
            </StepButton>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}
