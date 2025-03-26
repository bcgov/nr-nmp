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
  margin-left: 3rem;
  margin-right: 3rem;
  max-width: 992px;

  p {
    color: ${tokens.typographyColorSecondary};
    margin-top: 1.25rem;
    margin-bottom: 2.5rem;
    text-align: left;
  }

  .bcds-ButtonGroup {
    align-self: flex-start;
  }
`;

export default StyledContent;
