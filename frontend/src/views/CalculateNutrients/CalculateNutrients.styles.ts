/**
 * @summary Styling for CalculateNutrients view
 */
import { css } from '@emotion/react';
import styled from '@emotion/styled';

export const Banner = styled.div`
  display: flex;
  align-items: center;
  margin: 0;
`;

export const Heading = styled.h2`
  color: #494949;
  font-size: 16pt;
  font-weight: 500;
  min-width: 150px;
  display: contents;
  text-decoration: none;
`;

export const InputFieldsContainer = styled.div`
  display: flex;
  width: 100%;
  gap: 16px;
  margin-top: 100px;
`;

export const SelectorContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 16px;
  width: 100%;
  justify-content: flex-start;
  align-items: center;
`;

export const ButtonWrapper = styled.div<{ position?: 'left' | 'right' }>`
  position: absolute;
  bottom: 16px;
  ${({ position }) => (position === 'left' ? 'left: 16px;' : 'right: 16px;')}
  button {
    width: 80px;
    height: 40px;
  }
`;

export const TableWrapper = styled.div`
  margin-top: 3em;
`;

export const addRecordGroupStyle = css({
  '.bcds-ButtonGroup': {
    overflow: 'visible',
    height: '0rem',
    '> button': {
      position: 'relative',
      bottom: '-0.25rem',
      zIndex: '10',
    },
  },
});

export const Error = styled.div`
  display: flex;
  border: 1px solid #c81212;
  width: 100%;
  margin-bottom: 9px;
  box-shadow:
    0 2px 3px rgba(0, 0, 0, 0.4),
    0 0 45px rgba(255, 255, 255, 0.7) inset;
`;

export const Message = styled.div`
  display: flex;
  color: black !important;
  font-size: 12px;
  font-weight: bold;
  align-items: center;
`;

export const Icon = styled.img`
  margin: 0.25em;
`;
