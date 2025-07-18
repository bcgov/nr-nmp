/**
 * @summary Styling for AddAnimals view
 */
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import { componentContainer, buttonGroup, paragraphCss } from '../../common.styles';

export const Container = styled.div`
  overflow: visible;
  height: 0rem;
`;

export const ErrorText = styled.div`
  color: red;
`;

export const StyledContent = styled.div`
  margin-bottom: 1rem;
  ${componentContainer}

  ${paragraphCss}

  ${buttonGroup}
`;

export const DoubleRowStyle = styled.span`
  display: block;
  height: 24px;
`;

export const specialTableRowStyle = css({
  lineHeight: '24px',
});
