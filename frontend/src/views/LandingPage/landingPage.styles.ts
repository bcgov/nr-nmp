/**
 * Styling for LandingPage view
 */
import styled from '@emotion/styled';
import * as tokens from '@bcgov/design-tokens/js';
import screenSizes from '../../constants/screenSizes';

export const ViewContainer = styled.div`
  background-color: white;
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  height: 100svh;
  justify-content: center;
  width: 100%;
`;

export const Wrapper = styled.div`
  height: 100%;
  padding-top: 0;
  justify-content: center;
  display: flex;
  box-content: content-box;
  align-items: center;
  flex-direction: column;
  object-fit: scale-down;
  @media (max-height: 570px) {
    padding: 60pt 0;
  }
`;

export const ButtonWrapper = styled.div`
  padding: 5px;
`;

export const StyledDivider = styled.div`
  font-size: 18px;
  font-weight: 400;
  line-height: 30.61px;
  display: flex;
  align-items: center;
  text-align: center;
  color: ${tokens.typographyColorPlaceholder};

  &::before,
  &::after {
    flex: 1;
    content: '';
    padding: 1px;
    background-color: ${tokens.typographyColorPlaceholder};
    width: 145px;
    margin: 5px;
  }

  @media (min-width: ${screenSizes.desktop}) {
    &::before,
    &::after {
      width: 225px;
    }
  }
`;
