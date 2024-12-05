/**
 * Styling for FarmInformation view
 */
import styled from '@emotion/styled';
import screenSizes from '../../constants/screenSizes';

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

export const Card = styled.div`
  background-color: rgba(255, 255, 255, 0.8);
  height: 500px;
  width: 1000px;
  padding-top: 0;
  justify-content: center;
  align-items: center;
  display: flex;
  flex-direction: column;
  object-fit: scale-down;
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  padding: 20px;
  text-align: center;
  position: relative;
`;

export const CardHeader = styled.div`
  background-color: rgba(200, 200, 200, 0.3);
  padding: 0;
  color: #fff;
  display: flex;
  justify-content: space-between;
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
    padding-left: 2em;
  }
  z-index: 2000;
`;

export const Banner = styled.div`
  display: flex;
  align-items: center;
  margin: 0;
`;

export const Heading = styled.h2`
  color: #494949;
  font-size: 16pt;
  font-weight: 500;
  min-width: 150px;
  display: contents;
  text-decoration: none;
`;
