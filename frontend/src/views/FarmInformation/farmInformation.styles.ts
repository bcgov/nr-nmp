/**
 * @summary Styling for FarmInformation view
 */
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { buttonGroup, componentContainer, paragraphCss } from '../../common.styles';

export const StyledContent = styled.div`
  ${componentContainer}

  ${paragraphCss}

  ${buttonGroup}
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
