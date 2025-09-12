import React from 'react';
import { Button, ButtonGroup } from '@bcgov/design-system-react-components';
import ProgressStepper from '../ProgressStepper/ProgressStepper';
import { StyledContent, PageTitleStyle, AppTitleStyle, ButtonGroupWrapper } from './view.style';

interface ViewProps {
  title: string;
  children: React.ReactNode;
  handleBack?: () => void;
  handleNext?: () => void;
  backBtnText?: string;
  nextBtnText?: string;
}

export default function View({
  title,
  children,
  handleBack,
  handleNext,
  backBtnText = 'Back',
  nextBtnText = 'Next',
}: ViewProps) {
  return (
    <StyledContent>
      <ProgressStepper />
      <AppTitleStyle>Nutrient Management Calculator</AppTitleStyle>
      <PageTitleStyle>{title}</PageTitleStyle>
      {children}
      {(handleBack || handleNext) && (
        <ButtonGroupWrapper>
          <ButtonGroup
            alignment="start"
            ariaLabel="A group of buttons"
            orientation="horizontal"
          >
            {handleBack && (
              <Button
                size="medium"
                onPress={handleBack}
                variant="secondary"
              >
                {backBtnText}
              </Button>
            )}
            {handleNext && (
              <Button
                size="medium"
                onPress={handleNext}
                variant="primary"
              >
                {nextBtnText}
              </Button>
            )}
          </ButtonGroup>
        </ButtonGroupWrapper>
      )}
    </StyledContent>
  );
}
