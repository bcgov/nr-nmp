/**
 * Styling for LandingPage view
 */
import styled from '@emotion/styled';
import * as tokens from '@bcgov/design-tokens/js';
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
  width: 500px;
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
`;

export const ButtonWrapper = styled.div`
  padding: 5px;

  button {
    width: 400px;
    height: 50px;
  }
`;

export const StyledDivider = styled.div`
  font-size: 18px;
  font-weight: 400;
  line-height: 30.61px;
  display: flex;
  align-items: center;
  text-align: center;
  color: ${tokens.typographyColorPlaceholder};
  width: 400px;

  &::before,
  &::after {
    flex: 1;
    content: '';
    padding: 1px;
    background-color: ${tokens.typographyColorPlaceholder};
    width: 130px;
    margin: 5px;
  }

  @media (min-width: ${screenSizes.desktop}) {
    &::before,
    &::after {
      width: 225px;
    }
  }
`;

export const StyledContent = styled.div`
  width: 400px;
  display: flex;
  flex-direction: column;
  max-height: 180px;
  gap: 2px;
  margin-top: 60px;
  text-align: center;

  p {
    color: ${tokens.typographyColorSecondary};
  }

  @media (min-width: ${screenSizes.tablet}) {
    top: 10vh;
    max-width: 100%;
    margin-top: 0;
  }

  @media (min-width: ${screenSizes.desktop}) {
    max-width: 100%;
    max-height: 270px;
    gap: 2px;
    text-align: center;

    p {
      color: ${tokens.typographyColorSecondary};
    }
  }
`;
