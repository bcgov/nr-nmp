import styled from '@emotion/styled';

/**
 * @summary This is the root styling for the application.
 */
export const StyledApp = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

export const ViewContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  height: 100svh;
  justify-content: center;
  width: 100%;
  align-items: center;
`;