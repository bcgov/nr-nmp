import styled from '@emotion/styled';
import screenSizes from '@/constants/screenSizes';

export const CardHeader = styled.div`
  padding: 0;
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 50px;
  width: 100%;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  @media (min-width: ${screenSizes.tablet}) {
    justify-content: flex-start;
    padding-left: 2em;
  }
  z-index: 2000;
  align-items: flex-end;
`;

export const Banner = styled.div`
  display: flex;
  align-items: center;
  margin: 0;
`;

export const Heading = styled.h2`
  color: #494949;
  font-size: 12pt;
  font-weight: 500;
  min-width: 150px;
  display: contents;
  text-decoration: none;
`;

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

export const ChildrenWrapper = styled.div`
  width: 100%;
  padding-left: 20px;
  padding-right: 20px;
`;
