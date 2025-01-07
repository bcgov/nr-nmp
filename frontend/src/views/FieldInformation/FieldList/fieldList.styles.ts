/**
 * @summary Styling for FieldList view
 */
import styled from '@emotion/styled';
import screenSizes from '../../../constants/screenSizes';

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

export const ListItemContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 16px;
  width: 100%;
  justify-content: flex-start;
  align-items: center;
`;

export const ButtonWrapper = styled.div`
  position: absolute;
  bottom: 16px;
  right: 16px;
  button {
    width: 80px;
    height: 40px;
  }
`;

export const InfoBox = styled.div`
  background-color: rgba(200, 200, 200, 0.3);
  padding: 10px;
  border-radius: 5px;
  margin-top: 10px;
`;

export const InfoBoxContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;