/**
 * @summary Styles for reusable Footer component
 */
import styled from '@emotion/styled';
import SCREEN_SIZES from '../../../constants/screenSizes';
import typography from '../../../typography';

export const FooterWrapper = styled.footer`
  background-color: #036;
  border-top: 2px solid #fcba19;
  padding: 0;
  color: #fff;
  display: flex;
  flex: 0 1 65px;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  @media (min-width: ${SCREEN_SIZES.tablet}) {
    justify-content: flex-start;
    padding-left: 2em;
  }
  z-index: 999;
`;

export const Heading = styled.h2`
  ${typography.toString()}
  color: rgb(255, 255, 255);
  font-size: 16pt;
  font-weight: 500;
  min-width: 150px;
  display: contents;
  text-decoration: none;
`;

export const Banner = styled.div`
  display: flex;
  align-items: center;
  margin: 0;
  border-left: 1px solid #4b5e73;
`;

export const BannerRight = styled.div`
  min-width: 35pt;
  display: flex;
  padding: 0 0.5em;
  margin: 0;
  @media (min-width: ${SCREEN_SIZES.tablet}) {
    margin: 0 0 0 auto;
  }
`;

export const BannerLeft = styled.div`
  min-width: 35pt;
  display: flex;
  padding: 0 0.5em;
  margin: 0;
`;

export const Image = styled.img`
  width: 175px;
  top: 10px;
  position: relative;
  height: 100%;
  padding-right: 10px;
  @media (max-width: ${SCREEN_SIZES.tablet}) {
    width: 100px;
    padding-right: 5px;
  }
`;

export const StyledLink = styled.a`
  text-decoration: none;
  padding: 0.1rem 0.5rem;
  color: #fff !important;
  border-right: 1px solid #4b5e73;
`;
