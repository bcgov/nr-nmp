/**
 * @summary Styles for reusable Footer component
 */
import styled from '@emotion/styled';
import SCREEN_SIZES from '../../../constants/screenSizes';

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

export const Banner = styled.div`
  display: flex;
  align-items: center;
  margin: 0;
  border-left: 1px solid #4b5e73;
`;

export const StyledLink = styled.a`
  text-decoration: none;
  padding: 0.1rem 0.5rem;
  color: #fff !important;
  border-right: 1px solid #4b5e73;
`;
