/**
 * @summary A reusable Card component
 */
import React from 'react';
import { CardWrapper } from './card.styles';

interface CardProps {
  children: React.ReactNode;
  width?: string;
  height?: string;
  justifyContent?: string;
}

function Card({
  children,
  width = '500px',
  height = '500px',
  justifyContent = 'center',
}: CardProps) {
  return (
    <CardWrapper
      width={width}
      height={height}
      justifyContent={justifyContent}
    >
      {children}
    </CardWrapper>
  );
}

export default Card;
