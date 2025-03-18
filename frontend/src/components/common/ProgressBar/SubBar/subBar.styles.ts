/**
 * @summary Styling for Progress Bar component
 */
import styled from '@emotion/styled';
// import * as tokens from '@bcgov/design-tokens/js';

type StepProps = {
  highlight: boolean;
};

export const SubBarWrapper = styled.div`
  background-color: #f2f2f2;
  color: black;
  align-items: center;
  display: flex;
  justify-content: center;
  text-align: center;
  width: 100%;
`;

export const StyledStep = styled.div<StepProps>`
  ${(props) => (props?.highlight ? 'background-color: #DAE8EF;' : '')}
  font-size: 0.875em;
  padding: 10px;
  padding-left: 15px;
  padding-right: 15px;
  cursor: pointer;
`;
