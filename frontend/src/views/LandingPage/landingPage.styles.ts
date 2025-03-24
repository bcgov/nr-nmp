/**
 * @summary Styling for LandingPage view
 */
import styled from '@emotion/styled';
import * as tokens from '@bcgov/design-tokens/js';

export const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 1rem;
  width: 100vw;

  div {
    width: 80vw;
  }

  p {
    color: ${tokens.typographyColorSecondary};
    margin-top: 1.25rem;
    margin-bottom: 2.5rem;
    text-align: left;
    width: 80vw;
  }
`;

export default StyledContent;
