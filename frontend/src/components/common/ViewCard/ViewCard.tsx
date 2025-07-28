import React from 'react';
import Card from '../Card/Card';
import { Button } from '../Button/Button';
import { Banner, ButtonWrapper, CardHeader, ChildrenWrapper, Heading } from './viewCard.styles';

interface ViewCardProps {
  heading: string;
  children: React.ReactNode;
  width?: string;
  height?: string;
  handleNext?: () => void;
  nextDisabled?: boolean;
  handlePrevious?: () => void;
  prevDisabled?: boolean;
}

export default function ViewCard({
  heading,
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
      justifyContent="flex-start"
    >
      <CardHeader>
        <Banner>
          <Heading>{heading}</Heading>
        </Banner>
      </CardHeader>
      <ChildrenWrapper>{children}</ChildrenWrapper>
      {handleNext !== undefined && (
        <ButtonWrapper position="right">
          <Button
            text="Next"
            size="sm"
            handleClick={handleNext}
            variant="primary"
            disabled={nextDisabled}
          />
        </ButtonWrapper>
      )}
      {handlePrevious !== undefined && (
        <ButtonWrapper position="left">
          <Button
            text="Back"
            size="sm"
            handleClick={handlePrevious}
            variant="primary"
            disabled={prevDisabled}
          />
        </ButtonWrapper>
      )}
    </Card>
  );
}
