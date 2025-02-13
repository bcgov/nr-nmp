/**
 * @summary Styling for Manure and Compost view
 */
import styled from '@emotion/styled';
import screenSizes from '../../constants/screenSizes';

export const CardHeader = styled.div`
  background-color: rgba(200, 200, 200, 0.3);
  padding: 0;
  color: #fff;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  height: 65px;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  @media (min-width: ${screenSizes.tablet}) {
    justify-content: flex-start;
  }
  z-index: 2000;
`;

export const Banner = styled.div`
  display: flex;
  align-items: center;
  margin: 0;
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
