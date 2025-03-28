import React from 'react';
import Card from '../Card/Card';
import { Button } from '../Button/Button';
import { ButtonWrapper } from './viewCard.styles';

interface ViewCardProps {
  children: React.ReactNode;
  width?: string;
  height?: string;
  handleNext?: () => void;
  handlePrevious?: () => void;
}

export default function ViewCard({
  children,
  width = '500px',
  height = '500px',
  handleNext,
  handlePrevious,
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
            disabled={false}
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
            disabled={false}
          />
        </ButtonWrapper>
      )}
    </Card>
  );
}
