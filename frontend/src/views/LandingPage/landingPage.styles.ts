/**
 * @summary Styling for LandingPage view
 */
import styled from '@emotion/styled';
import { componentContainer, paragraphCss } from '../../common.styles';

export const StyledContent = styled.div`
  ${componentContainer}

  ${paragraphCss}

  .bcds-ButtonGroup {
    margin-bottom: 1rem;
  }
`;

export default StyledContent;
