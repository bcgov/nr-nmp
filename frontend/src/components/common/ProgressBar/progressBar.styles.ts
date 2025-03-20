/**
 * @summary Styling for Progress Bar component
 */
import styled from '@emotion/styled';
// import * as tokens from '@bcgov/design-tokens/js';

type StepProps = {
  highlight: boolean;
};

export const MainBarWrapper = styled.div`
  background-color: #c1daea;
  color: black;
  align-items: center;
  display: flex;
  justify-content: center;
  text-align: center;
`;

export const ProgressBarWrapper = styled.div`
  top: 65px;
  position: fixed;
  width: 100%;
  left: 0;
  z-index: 1;
`;

export const StyledStep = styled.div<StepProps>`
  ${(props) => (props?.highlight ? 'background-color: #a0c7de;' : '')}
  font-size: 1.125em;
  padding: 10px;
  padding-left: 15px;
  padding-right: 15px;
  cursor: pointer;
`;
