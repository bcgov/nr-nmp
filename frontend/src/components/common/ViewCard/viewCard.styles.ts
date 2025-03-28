import styled from '@emotion/styled';

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
