/**
 * @summary Styling for FieldList view
 */
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { componentContainer, paragraphCss } from '../../../common.styles';

export const CardHeader = styled.div`
  background-color: rgba(200, 200, 200, 0.3);
  padding: 0;
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 65px;
  width: 100%;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  z-index: 2000;
`;

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

// eslint-disable-next-line import/prefer-default-export
export const ButtonWrapper = styled.div<{ position?: 'left' | 'right' }>`
  position: absolute;
  bottom: 16px;
  ${({ position }) => (position === 'left' ? 'left: 16px;' : 'right: 16px;')}
  button {
    width: 80px;
    height: 40px;
  }
`;

export const ChildrenWrapper = styled.div`
  width: 100%;
  padding-left: 20px;
  padding-right: 20px;
`;
export const StyledContent = styled.div`
  ${componentContainer}

  ${paragraphCss}


  .bcds-ButtonGroup {
    overflow: visible;
    height: 0.5rem;
    position: relative;
    z-index: 99;
    bottom: -0.5rem;
  }
`;

export const subHeader = css({
  fontWeight: '700',
  size: '1.25rem',
  lineHeight: '100%',
  letterSpacing: '0px',
});

export default {
  StyledContent,
  subHeader,
};
