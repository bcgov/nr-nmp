import React from 'react';
import Card from '../Card/Card';
import { Button } from '../Button/Button';
import { ButtonWrapper } from './viewCard.styles';

interface ViewCardProps {
  children: React.ReactNode;
  width?: string;
  height?: string;
  handleNext?: () => void;
  nextDisabled?: boolean;
  handlePrevious?: () => void;
  prevDisabled?: boolean;
}

export default function ViewCard({
  children,
  width = '500px',
  height = '500px',
  handleNext,
  nextDisabled = false,
  handlePrevious,
  prevDisabled = false,
}: ViewCardProps) {
  return (
    <Card
      height={height}
      width={width}
    >
      {children}
      {handleNext && (
        <ButtonWrapper position="right">
          <Button
            text="Next"
            size="sm"
            handleClick={handleNext}
            aria-label="Next"
            variant="primary"
            disabled={nextDisabled}
          />
        </ButtonWrapper>
      )}
      {handlePrevious && (
        <ButtonWrapper position="left">
          <Button
            text="Back"
            size="sm"
            handleClick={handlePrevious}
            aria-label="Back"
            variant="primary"
            disabled={prevDisabled}
          />
        </ButtonWrapper>
      )}
    </Card>
  );
}
